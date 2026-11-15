package net.jordimp.status.web;

import net.jordimp.status.core.*;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "app.sse-heartbeat-seconds=1",
    "app.rate-limit-requests-per-minute=100",
    "app.refresh-interval-ms=3600000",
    "spring.main.allow-bean-definition-overriding=true"
})
class FleetSseControllerTest {

    @Autowired
    Environment env;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public StatusService statusService() {
            EngineStatus llama = EngineStatus.llama("test-alias", 4, 2048, "v1");
            EngineStatus strata = EngineStatus.strata("model-x", true);
            return new StatusService(() -> Result.<EngineStatus, ProbeError>ok(llama),
                                     () -> Result.<EngineStatus, ProbeError>ok(strata)) {
                @Override
                public StatusSnapshot currentSnapshot() {
                    return new StatusSnapshot(llama, strata);
                }
            };
        }

        @Bean
        public FleetService fleetService(@org.springframework.beans.factory.annotation.Value("${app.pool-top-n}") int topN) throws IOException {
            Path fixture = Files.createTempFile("pool", ".jsonl");
            List<String> lines = List.of(
                "{\"model\":\"models/demo-a.gguf\",\"thinking\":\"off\",\"tools\":{\"score\":0.8},\"code\":{\"score\":0.7},\"agent\":{\"score\":0.9},\"speed\":{\"gen_tps\":100.0},\"ts\":\"2026-11-15T10:00:00\"}",
                "{\"model\":\"models/demo-b.gguf\",\"thinking\":\"on\",\"tools\":{\"score\":0.5},\"code\":{\"score\":0.5},\"agent\":{\"score\":0.5},\"speed\":{\"gen_tps\":50.0},\"ts\":\"2026-11-15T10:01:00\"}",
                "{\"model\":\"models/demo-a.gguf\",\"thinking\":\"off\",\"tools\":{\"score\":0.99},\"code\":{\"score\":0.99},\"agent\":{\"score\":0.99},\"speed\":{\"gen_tps\":200.0},\"ts\":\"2026-11-15T10:02:00\"}"
            );
            Files.write(fixture, lines);
            return new FleetService(fixture, topN);
        }
    }

    private String streamUrl() {
        return "http://localhost:" + env.getProperty("local.server.port") + "/api/fleet";
    }

    private static final class SseStream implements AutoCloseable {
        final CopyOnWriteArrayList<String> lines = new CopyOnWriteArrayList<>();
        private final HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
        private final HttpResponse<Stream<String>> response;

        SseStream(String url, String lastEventId) throws InterruptedException {
            HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url))
                    .header("Accept", "text/event-stream");
            if (lastEventId != null) {
                builder.header("Last-Event-ID", lastEventId);
            }
            try {
                this.response = client.send(builder.build(), HttpResponse.BodyHandlers.ofLines());
            } catch (IOException e) {
                throw new IllegalStateException("stream connect failed", e);
            }
            Thread.ofVirtual().start(() -> {
                try (Stream<String> body = response.body()) {
                    body.forEach(lines::add);
                } catch (RuntimeException ignored) {}
            });
        }

        String firstId() {
            return lines.stream().filter(l -> l.startsWith("id:")).findFirst()
                    .map(l -> l.substring("id:".length()).trim()).orElse(null);
        }

        public void close() {
            try {
                response.body().close();
            } catch (RuntimeException ignored) {}
            client.close();
        }
    }

    private final List<SseStream> open = new CopyOnWriteArrayList<>();

    @AfterEach
    void drain() {
        open.forEach(SseStream::close);
    }

    @Test
    void fleetInitialEvent() throws InterruptedException {
        AtomicReference<SseStream> ref = new AtomicReference<>();
        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            if (ref.get() == null) {
                ref.set(openStream(null));
            }
            assertThat(ref.get().lines).anyMatch(l -> l.startsWith("event:fleet"));
            assertThat(ref.get().lines).anyMatch(l -> l.startsWith("id:"));
            String data = ref.get().lines.stream().filter(l -> l.startsWith("data:")).findFirst().orElse("");
            assertThat(data).contains("\"engines\"").contains("\"scoreboard\"").contains("\"seq\"").contains("\"ts\"");
            // R3/R9 exclusion check: slug is 'demo-a', not the full model path
            assertThat(data).contains("\"slug\":\"demo-a\"");
            assertThat(data).doesNotContain("models/");
            assertThat(data).doesNotContain(".gguf");
        });
    }

    @Test
    void fleetHeartbeat() {
        AtomicReference<SseStream> ref = new AtomicReference<>();
        Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
            if (ref.get() == null) {
                ref.set(openStream(null));
            }
            assertThat(ref.get().lines).anyMatch(l -> l.startsWith(":") && l.contains("heartbeat"));
        });
    }

    @Test
    void fleetSeqMonotonic() throws InterruptedException {
        AtomicReference<String> firstId = new AtomicReference<>();
        AtomicReference<SseStream> second = new AtomicReference<>();
        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            if (firstId.get() == null) {
                SseStream sse = openStream(null);
                Awaitility.await().atMost(Duration.ofSeconds(2)).until(() -> sse.firstId() != null);
                firstId.set(sse.firstId());
                sse.close();
            }
            if (firstId.get() != null && second.get() == null) {
                second.set(openStream(firstId.get()));
            }
            if (second.get() != null && second.get().firstId() != null) {
                long id1 = Long.parseLong(firstId.get());
                long id2 = Long.parseLong(second.get().firstId());
                assertThat(id2).isGreaterThan(id1);
            }
        });
    }

    private SseStream openStream(String lastEventId) throws InterruptedException {
        SseStream sse = new SseStream(streamUrl(), lastEventId);
        open.add(sse);
        return sse;
    }
}
