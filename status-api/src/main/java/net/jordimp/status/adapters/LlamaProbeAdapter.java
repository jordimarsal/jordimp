package net.jordimp.status.adapters;

import net.jordimp.status.core.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.ConnectException;
import java.net.http.HttpTimeoutException;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LlamaProbeAdapter {
    private static final Logger log = LoggerFactory.getLogger(LlamaProbeAdapter.class);
    private final String baseUrl;
    private final Duration timeout;
    private final HttpClient httpClient;
    private final PgrepRunner pgrep;

    public LlamaProbeAdapter(String baseUrl, int timeoutMs) {
        this(baseUrl, timeoutMs, PgrepRunner.real());
    }

    public LlamaProbeAdapter(String baseUrl, int timeoutMs, PgrepRunner pgrep) {
        this.baseUrl = baseUrl;
        this.timeout = Duration.ofMillis(timeoutMs);
        this.pgrep = pgrep;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(this.timeout)
                .build();
    }

    public Result<EngineStatus, ProbeError> probe() {
        try {
            String pgrepOutput = executePgrep("[l]lama-server");
            if (pgrepOutput == null || pgrepOutput.isBlank()) {
                return Result.err(new ProbeError.EngineUnreachable("llama-server process not found"));
            }
            ParsedLlama parsed = parsePgrepOutput(pgrepOutput);

            var healthReq = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/health"))
                    .timeout(timeout)
                    .GET()
                    .build();
            var healthRes = httpClient.send(healthReq, HttpResponse.BodyHandlers.ofString());
            if (healthRes.statusCode() != 200) return Result.err(new ProbeError.ProbeParseError("Health check failed: " + healthRes.statusCode()));

            var propsReq = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/props"))
                    .timeout(timeout)
                    .GET()
                    .build();
            var propsRes = httpClient.send(propsReq, HttpResponse.BodyHandlers.ofString());
            if (propsRes.statusCode() != 200) return Result.err(new ProbeError.ProbeParseError("Props check failed: " + propsRes.statusCode()));

            // build is "unknown" because llama.cpp does not expose its build id over HTTP via /health, /props, or /metrics.
            return Result.ok(EngineStatus.llama(parsed.alias(), parsed.slots(), parsed.ctxPerSlot(), parsed.build()));

        } catch (HttpTimeoutException | SocketTimeoutException e) {
            log.warn("Llama probe timed out: {}", e.getMessage());
            return Result.err(new ProbeError.ProbeTimeout("Llama probe timed out"));
        } catch (ConnectException e) {
            log.warn("Llama engine unreachable: {}", e.getMessage());
            return Result.err(new ProbeError.EngineUnreachable("Llama engine unreachable"));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Result.err(new ProbeError.EngineUnreachable("probe interrupted"));
        } catch (IOException | RuntimeException e) {
            log.warn("Llama probe error: {}", e.getMessage());
            return Result.err(new ProbeError.ProbeParseError(e.getMessage()));
        }
    }

    private String executePgrep(String pattern) throws IOException, InterruptedException {
        return pgrep.run(pattern);
    }

    public record ParsedLlama(String alias, int slots, int ctxPerSlot, String build) {}

    public static ParsedLlama parsePgrepOutput(String output) {
        if (output == null || output.isBlank()) {
            return new ParsedLlama("unknown", 1, 512, "unknown");
        }
        String[] parts = output.split("\\s+");
        String cmdLine = String.join(" ", parts);

        String alias = "unknown";
        int slots = 1;
        int ctx = 512;
        String build = "unknown";

        Matcher mModel = Pattern.compile("-m\\s+([^\\s]+)").matcher(cmdLine);
        if (mModel.find()) {
            String path = mModel.group(1);
            alias = path.substring(path.lastIndexOf('/') + 1).replace(".gguf", "");
        }

        Matcher mCtx = Pattern.compile("-c\\s+(\\d+)").matcher(cmdLine);
        if (mCtx.find()) {
            ctx = Integer.parseInt(mCtx.group(1));
        }

        Matcher mParallel = Pattern.compile("--parallel\\s+(\\d+)").matcher(cmdLine);
        if (mParallel.find()) {
            slots = Integer.parseInt(mParallel.group(1));
        }

        return new ParsedLlama(alias, slots, ctx / Math.max(1, slots), build);
    }
}
