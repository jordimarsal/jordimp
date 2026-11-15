package net.jordimp.status.web;

import net.jordimp.status.core.EngineStatus;
import net.jordimp.status.core.ProbeError;
import net.jordimp.status.core.Result;
import net.jordimp.status.core.StatusService;
import net.jordimp.status.core.StatusSnapshot;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.test.context.TestPropertySource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Real SSE integration test (hermetic): the StatusService bean is replaced with a
 * fixed-snapshot service, so no engine is probed. The stream is read with the JDK
 * HttpClient on a virtual thread; Awaitility polls the collected lines.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "app.sse-heartbeat-seconds=1",
    "app.rate-limit-requests-per-minute=100",
    "app.refresh-interval-ms=3600000",
    "spring.main.allow-bean-definition-overriding=true"
})
class SseControllerTest {

    @Autowired
    Environment env;

    @TestConfiguration
    static class Fixed {
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
    }

    private String streamUrl() {
        return "http://localhost:" + env.getProperty("local.server.port") + "/api/status/stream";
    }

    /** One live SSE connection: lines accumulate on a virtual thread until stopped. */
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
                // send() returns as soon as the response HEADERS arrive; the body streams.
                this.response = client.send(builder.build(), HttpResponse.BodyHandlers.ofLines());
            } catch (java.io.IOException e) {
                throw new IllegalStateException("stream connect failed", e);
            }
            Thread.ofVirtual().start(() -> {
                try (Stream<String> body = response.body()) {
                    body.forEach(lines::add);
                } catch (RuntimeException cancelled) {
                    // stream closed by close() — expected
                }
            });
        }

        String firstId() {
            return lines.stream().filter(l -> l.startsWith("id:")).findFirst()
                    .map(l -> l.substring("id:".length()).trim()).orElse(null);
        }

        public void close() {
            try {
                response.body().close();
            } catch (RuntimeException ignored) {
                // already closed by the server
            }
            client.close();
        }
    }

    private final List<SseStream> open = new CopyOnWriteArrayList<>();

    @AfterEach
    void drain() {
        open.forEach(SseStream::close);
    }

    @Test
    void initialSnapshotArrivesWithIdAndFullPayload() {
        AtomicReference<SseStream> ref = new AtomicReference<>();
        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            if (ref.get() == null) {
                ref.set(openStream(null));
            }
            assertThat(ref.get().lines).anyMatch(l -> l.startsWith("id:"));
            assertThat(ref.get().lines).contains("event:status");
            String data = ref.get().lines.stream().filter(l -> l.startsWith("data:")).findFirst().orElse("");
            assertThat(data).contains("llamacpp").contains("strata").contains("\"ts\"");
        });
        SseStream sse = ref.get();
        assertThat(sse.firstId()).isNotNull();
        long id = Long.parseLong(sse.firstId());
        assertThat(id).isGreaterThanOrEqualTo(1); // R13: monotonic, starts at 1
    }

    @Test
    void heartbeatCommentArrivesWithinHeartbeatWindow() {
        AtomicReference<SseStream> ref = new AtomicReference<>();
        Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
            if (ref.get() == null) {
                ref.set(openStream(null));
            }
            // R11: the keepalive is an SSE comment line (":heartbeat" in Spring's
            // wire format); interval 1s in this test
            assertThat(ref.get().lines).anyMatch(l -> l.startsWith(":") && l.contains("heartbeat"));
        });
    }

    @Test
    void reconnectWithLastEventIdReplaysFreshSnapshotWithHigherSeq() {
        AtomicReference<String> firstId = new AtomicReference<>();
        AtomicReference<SseStream> second = new AtomicReference<>();
        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            if (firstId.get() == null) {
                SseStream sse = openStream(null);
                open.add(sse);
                Awaitility.await().atMost(Duration.ofSeconds(5)).until(() -> sse.firstId() != null);
                firstId.set(sse.firstId());
                sse.close();
                open.remove(sse);
            }
            if (firstId.get() != null && second.get() == null) {
                // R12: reconnect announces the last seen id (ADR-2: fresh full snapshot, new seq)
                second.set(openStream(firstId.get()));
                open.add(second.get());
            }
            if (second.get() != null && second.get().firstId() != null) {
                long replayed = Long.parseLong(second.get().firstId());
                assertThat(replayed).isGreaterThan(Long.parseLong(firstId.get()));
                String data = second.get().lines.stream()
                        .filter(l -> l.startsWith("data:")).findFirst().orElse("");
                assertThat(data).contains("llamacpp").contains("strata");
            }
        });
    }

    private SseStream openStream(String lastEventId) throws InterruptedException {
        SseStream sse = new SseStream(streamUrl(), lastEventId);
        open.add(sse);
        return sse;
    }
}
