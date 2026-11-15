package net.jordimp.status.core;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.json.JsonMapper;
import net.jordimp.status.config.AppProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/**
 * T26.1: Watches pool.jsonl, parses rows, computes global scores, and maintains top-N scoreboard.
 */
public class FleetService {
    private static final Logger log = LoggerFactory.getLogger(FleetService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

    private final Path poolPath;
    private final int topN;
    private final JsonMapper mapper;
    private final List<Consumer<List<FleetRow>>> subscribers = new ArrayList<>();
    
    private FileTime lastMtime = FileTime.from(Instant.MIN);
    private List<FleetRow> currentScoreboard = List.of();

    public FleetService(Path poolPath, int topN) {
        this.poolPath = poolPath;
        this.topN = topN;
        this.mapper = new JsonMapper();
    }

    public synchronized void refreshIfChanged() {
        try {
            if (!Files.exists(poolPath)) {
                log.warn("Pool file not found at {}", poolPath);
                return;
            }

            FileTime mtime = Files.getLastModifiedTime(poolPath);
            if (mtime.compareTo(lastMtime) > 0) {
                log.info("Detected change in pool file: {}", poolPath);
                lastMtime = mtime;
                List<FleetRow> newScoreboard = parseAndCompute(mtime);
                
                if (!newScoreboard.equals(currentScoreboard)) {
                    currentScoreboard = newScoreboard;
                    notifySubscribers(currentScoreboard);
                }
            }
        } catch (IOException e) {
            log.error("Failed to check/read pool file", e);
        }
    }

    private List<FleetRow> parseAndCompute(FileTime fileMtime) throws IOException {
        Map<String, FleetRow> latestRowsBySlug = new LinkedHashMap<>();
        
        // Read line by line for memory efficiency and JSONL compliance
        try (var lines = Files.lines(poolPath)) {
            lines.filter(line -> !line.isBlank()).forEach(line -> {
                try {
                    var node = mapper.readTree(line);
                    String slug = extractSlug(node.get("model").asText());
                    
                    // R8: Honest fallback for missing ts
                    String tsStr = node.has("ts") && !node.get("ts").isNull() 
                        ? node.get("ts").asText() 
                        : ISO_FORMATTER.format(fileMtime.toInstant());

                    String think = node.has("thinking") ? node.get("thinking").asText() : "off";
                    
                    Double genTps = null;
                    if (node.has("speed") && node.get("speed").has("gen_tps")) {
                        var tpsNode = node.get("speed").get("gen_tps");
                        if (!tpsNode.isNull()) genTps = tpsNode.asDouble();
                    }

                    // Extract scores for R7 computation
                    double toolsScore = getScore(node, "tools.score");
                    double codeScore = getScore(node, "code.score");
                    double agentScore = getScore(node, "agent.score");

                    // We store raw values in a temporary map to compute global later
                    // But we need the latest row per slug based on file order
                    latestRowsBySlug.put(slug, new FleetRow(slug, think, 0.0, genTps, tsStr));
                    
                    // To handle R7 correctly, we actually need the score components. 
                    // Since FleetRow is our public DTO, let's use an internal helper or just re-parse logic.
                    // Actually, let's store the components temporarily.
                } catch (Exception e) {
                    log.warn("Skipping malformed JSONL line: {}", e.getMessage());
                }
            });
        }

        // Re-read/process with full context for scoring
        // Optimization: In a real high-perf scenario, we'd parse once into a complex object.
        // For this implementation, we follow the requirement of deduping by LAST row per slug.
        return computeFinalScoreboard(latestRowsBySlug, fileMtime);
    }

    private List<FleetRow> computeFinalScoreboard(Map<String, FleetRow> slugs, FileTime mtime) throws IOException {
        // We need to go back and get the scores for these specific rows.
        // Because we must respect "LAST row wins", we iterate through the file again or 
        // better: collect all valid rows in order, then dedup.
        
        List<RawRow> allValidRows = new ArrayList<>();
        try (var lines = Files.lines(poolPath)) {
            lines.filter(line -> !line.isBlank()).forEach(line -> {
                try {
                    allValidRows.add(parseRaw(line, mtime));
                } catch (Exception e) {
                    log.warn("Skipping malformed line during score computation");
                }
            });
        }

        // Dedup: Last row per slug wins
        Map<String, RawRow> deduped = new LinkedHashMap<>();
        for (var row : allValidRows) {
            deduped.put(row.slug, row);
        }

        Collection<RawRow> finalRows = deduped.values();
        double maxRaw = finalRows.stream()
            .mapToDouble(r -> r.genTps != null ? r.genTps : 0.0)
            .max().orElse(1.0);
        final double maxGenTps = maxRaw <= 0 ? 1.0 : maxRaw;

        return finalRows.stream()
            .map(r -> {
                double speedPart = (r.genTps != null) ? (r.genTps / maxGenTps) * 0.15 : 0.0;
                double toolsPart = r.toolsScore * 0.30;
                double codePart = r.codeScore * 0.30;
                double agentPart = r.agentScore * 0.25;
                double global = Math.round((toolsPart + codePart + agentPart + speedPart) * 100.0) / 100.0;
                return new FleetRow(r.slug, r.think, global, r.genTps, r.ts);
            })
            .sorted(Comparator.comparingDouble(FleetRow::global).reversed())
            .limit(topN)
            .collect(Collectors.toList());
    }

    private RawRow parseRaw(String line, FileTime mtime) throws Exception {
        var node = mapper.readTree(line);
        String slug = extractSlug(node.get("model").asText());
        String ts = node.has("ts") && !node.get("ts").isNull() ? node.get("ts").asText() : ISO_FORMATTER.format(mtime.toInstant());
        String think = node.has("thinking") ? node.get("thinking").asText() : "off";
        Double genTps = (node.has("speed") && node.get("speed").has("gen_tps") && !node.get("speed").get("gen_tps").isNull()) 
                        ? node.get("speed").get("gen_tps").asDouble() : null;
        
        return new RawRow(
            slug, think, genTps, ts,
            getScore(node, "tools.score"),
            getScore(node, "code.score"),
            getScore(node, "agent.score")
        );
    }

    private double getScore(tools.jackson.databind.JsonNode node, String path) {
        try {
            String[] parts = path.split("\\.");
            var current = node;
            for (String part : parts) {
                current = current.get(part);
                if (current == null || current.isNull()) return 0.0;
            }
            return current.asDouble();
        } catch (Exception e) {
            return 0.0;
        }
    }

    private String extractSlug(String modelPath) {
        // R9: basename minus .gguf
        String filename = modelPath.substring(modelPath.lastIndexOf('/') + 1);
        if (filename.endsWith(".gguf")) {
            return filename.substring(0, filename.length() - 5);
        }
        return filename;
    }

    public synchronized List<FleetRow> getScoreboard() {
        return new ArrayList<>(currentScoreboard);
    }

    public synchronized void subscribe(Consumer<List<FleetRow>> listener) {
        subscribers.add(listener);
    }

    public synchronized void unsubscribe(Consumer<List<FleetRow>> listener) {
        subscribers.remove(listener);
    }

    private void notifySubscribers(List<FleetRow> list) {
        for (var s : subscribers) {
            try { s.accept(list); } catch (Exception e) { log.error("Subscriber error", e); }
        }
    }

    private record RawRow(String slug, String think, Double genTps, String ts, double toolsScore, double codeScore, double agentScore) {}
}
