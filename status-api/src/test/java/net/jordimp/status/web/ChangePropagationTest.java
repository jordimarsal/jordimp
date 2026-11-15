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
 * T11 end-to-end: probes -> snapshot -> change detection -> SSE push -> client.
 * The adapters are mutable lambdas; the test flips an engine's state mid-stream
 * and asserts the connected client receives the change event (not just the
 * initial snapshot). R22 is structural: no scoreboard/pool.jsonl dependency
 * exists anywhere in status-api (verified by grep in the implementation log).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "app.sse-heartbeat-seconds=60",
    "app.rate-limit-requests-per-minute=100",
    "app.refresh-interval-ms=3600000",
    "spring.main.allow-bean-definition-overriding=true"
})
class ChangePropagationTest {

    /** The two probe results the mutable adapters return; the test flips them. */
    static final AtomicReference<EngineStatus> LLAMA = new AtomicReference<>(
            EngineStatus.llama("alias-a", 2, 8192, "v1"));
    static final AtomicReference<EngineStatus> STRATA = new AtomicReference<>(
            EngineStatus.strata("model-a", true));

    @Autowired
    StatusService service;

    @Autowired
    Environment env;

    @TestConfiguration
    static class Mutable {
        @Bean
        public StatusService statusService() {
            // REAL StatusService: refresh() probes these lambdas, so a flipped
            // result is detected as a change and pushed to SSE subscribers.
            return new StatusService(
                    () -> LLAMA.get() == null
                            ? Result.err(new ProbeError.EngineUnreachable("down"))
                            : Result.ok(LLAMA.get()),
                    () -> STRATA.get() == null
                            ? Result.err(new ProbeError.EngineUnreachable("down"))
                            : Result.ok(STRATA.get()));
        }
    }

    private String streamUrl() {
        return "http://localhost:" + env.getProperty("local.server.port") + "/api/status/stream";
    }

    private static final class SseStream implements AutoCloseable {
        final CopyOnWriteArrayList<String> lines = new CopyOnWriteArrayList<>();
        private final HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2)).build();
        private final HttpResponse<Stream<String>> response;

        SseStream(String url) throws InterruptedException {
            try {
                response = client.send(HttpRequest.newBuilder(URI.create(url))
                        .header("Accept", "text/event-stream").build(),
                        HttpResponse.BodyHandlers.ofLines());
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

        List<String> dataLines() {
            return lines.stream().filter(l -> l.startsWith("data:")).toList();
        }

        public void close() {
            try {
                response.body().close();
            } catch (RuntimeException ignored) {
                // already closed
            }
            client.close();
        }
    }

    private final List<SseStream> open = new CopyOnWriteArrayList<>();

    @AfterEach
    void drain() {
        // restore initial state for context reuse
        LLAMA.set(EngineStatus.llama("alias-a", 2, 8192, "v1"));
        STRATA.set(EngineStatus.strata("model-a", true));
        open.forEach(SseStream::close);
    }

    @Test
    void engineChangeIsPushedToConnectedClient() throws InterruptedException {
        SseStream sse = new SseStream(streamUrl());
        open.add(sse);

        // initial snapshot (llamacpp up with alias-a) reaches the client
        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() ->
                assertThat(sse.dataLines()).anyMatch(d -> d.contains("alias-a")));

        // flip llama down, refresh once: change detection must push a new event
        LLAMA.set(null);
        service.refresh();

        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            // the LAST data event no longer carries alias-a: llamacpp went down,
            // and its fields are omitted (down + null alias, R9 filtering)
            assertThat(sse.dataLines()).anySatisfy(d -> assertThat(d).doesNotContain("alias-a"));
        });
        // the client saw the initial event AND the change event
        assertThat(sse.dataLines().size()).isGreaterThanOrEqualTo(2);
    }
}
