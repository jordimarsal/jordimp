package net.jordimp.status.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class FleetServiceTest {

    @TempDir
    Path tempDir;
    private Path poolFile;
    private FleetService service;

    @BeforeEach
    void setup() throws IOException {
        poolFile = tempDir.resolve("pool.jsonl");
        service = new FleetService(poolFile, 10);
    }

    @Test
    void testParseAndDedup() throws IOException {
        // Two rows same slug -> last one wins
        Files.writeString(poolFile, """
            {"model": "models/qwen.gguf", "thinking": "off", "speed": {"gen_tps": 10}, "tools": {"score": 1.0}, "code": {"score": 1.0}, "agent": {"score": 1.0}, "ts": "2026-01-01T00:00:00Z"}
            {"model": "models/qwen.gguf", "thinking": "on", "speed": {"gen_tps": 20}, "tools": {"score": 1.0}, "code": {"score": 1.0}, "agent": {"score": 1.0}, "ts": "2026-01-01T00:00:01Z"}
            """);
        
        service.refreshIfChanged();
        List<FleetRow> scoreboard = service.getScoreboard();
        
        assertThat(scoreboard).hasSize(1);
        assertThat(scoreboard.get(0).slug()).isEqualTo("qwen");
        assertThat(scoreboard.get(0).think()).isEqualTo("on");
        assertThat(scoreboard.get(0).genTps()).isEqualTo(20.0);
    }

    @Test
    void testGlobalMath() throws IOException {
        // R7: tools*0.3 + code*0.3 + agent*0.25 + (genTps/max)*0.15
        // Max genTps will be 100.
        Files.writeString(poolFile, """
            {"model": "m1.gguf", "speed": {"gen_tps": 100}, "tools": {"score": 1.0}, "code": {"score": 1.0}, "agent": {"score": 1.0}}
            {"model": "m2.gguf", "speed": {"gen_tps": 50}, "tools": {"score": 0.0}, "code": {"score": 0.0}, "agent": {"score": 0.0}}
            """);
        
        service.refreshIfChanged();
        List<FleetRow> scoreboard = service.getScoreboard();
        
        // m1: 0.3 + 0.3 + 0.25 + (100/100 * 0.15) = 1.0
        assertThat(scoreboard.get(0).slug()).isEqualTo("m1");
        assertThat(scoreboard.get(0).global()).isEqualTo(1.0);

        // m2: 0 + 0 + 0 + (50/100 * 0.15) = 0.075 -> rounded to 0.08? No, math says 0.075. 
        // Requirement R7 says round final value to 2 decimals.
        assertThat(scoreboard.get(1).slug()).isEqualTo("m2");
        assertThat(scoreboard.get(1).global()).isEqualTo(0.08); // Math.round(0.075 * 100)/100.0
    }

    @Test
    void testMissingTsUsesMtime() throws IOException {
        Files.writeString(poolFile, """
            {"model": "m1.gguf", "speed": {"gen_tps": 10}, "tools": {"score": 1.0}}
            """);
        
        Instant fixedTime = Instant.parse("2026-01-01T12:00:00Z");
        Files.setLastModifiedTime(poolFile, FileTime.from(fixedTime));
        
        service.refreshIfChanged();
        List<FleetRow> scoreboard = service.getScoreboard();
        
        assertThat(scoreboard.get(0).ts()).isEqualTo("2026-01-01T12:00:00Z");
    }

    @Test
    void testMalformedLineSkipped() throws IOException {
        Files.writeString(poolFile, """
            {"model": "good.gguf", "speed": {"gen_tps": 10}, "tools": {"score": 1.0}}
            { INVALID JSON }
            {"model": "also-good.gguf", "speed": {"gen_tps": 5}, "tools": {"score": 1.0}}
            """);
        
        service.refreshIfChanged();
        assertThat(service.getScoreboard()).hasSize(2);
    }

    @Test
    void testRefreshDetection() throws IOException, InterruptedException {
        Files.writeString(poolFile, """
            {"model": "m1.gguf", "speed": {"gen_tps": 10}, "tools": {"score": 1.0}}
            """);
        service.refreshIfChanged();
        
        AtomicReference<List<FleetRow>> notified = new AtomicReference<>();
        service.subscribe(notified::set);

        // Touch file
        Thread.sleep(1000);
        Files.writeString(poolFile, """
            {"model": "m1.gguf", "speed": {"gen_tps": 20}, "tools": {"score": 1.0}}
            """, java.nio.file.StandardOpenOption.APPEND);
        
        service.refreshIfChanged();
        assertThat(notified.get()).isNotNull();
        assertThat(notified.get().get(0).genTps()).isEqualTo(20.0);
    }

    @Test
    void testTopN() throws IOException {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 20; i++) {
            sb.append(String.format("{\"model\": \"m%d.gguf\", \"speed\": {\"gen_tps\": %d}, \"tools\": {\"score\": 1.0}}\n", i, i));
        }
        Files.writeString(poolFile, sb.toString());
        
        FleetService limitedService = new FleetService(poolFile, 5);
        limitedService.refreshIfChanged();
        assertThat(limitedService.getScoreboard()).hasSize(5);
        assertThat(limitedService.getScoreboard().get(0).slug()).isEqualTo("m20"); // Highest score first
    }
}
