package net.jordimp.status.adapters;

import com.sun.net.httpserver.HttpServer;
import net.jordimp.status.core.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;

import static org.assertj.core.api.Assertions.assertThat;

class StrataProbeAdapterTest {
    private HttpServer server;
    private int port;

    @BeforeEach
    void setup() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        port = server.getAddress().getPort();
        server.createContext("/health", exchange -> {
            String response = "{\"status\":\"ok\",\"max_context\":131072,\"model\":\"qwen3.8-flash-next-iq3_xxs\",\"loaded\":true,\"service\":\"strata\"}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length());
            try (var os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        });
        server.start();
    }

    @AfterEach
    void teardown() {
        server.stop(0);
    }

    @Test
    void testProbeSuccess() {
        StrataProbeAdapter adapter = new StrataProbeAdapter("http://localhost:" + port, 1000, pattern -> "[s]erve/server\\.py");
        Result<EngineStatus, ProbeError> result = adapter.probe();

        assertThat(result.isOk()).isTrue();
        assertThat(result.getValue().modelName()).isEqualTo("qwen3.8-flash-next-iq3_xxs");
        assertThat(result.getValue().loaded()).isTrue();
    }

    @Test
    void testProbeTimesOut() throws IOException {
        HttpServer slowServer = HttpServer.create(new InetSocketAddress(0), 0);
        slowServer.createContext("/health", exchange -> {
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            exchange.sendResponseHeaders(200, 0);
            exchange.close();
        });
        slowServer.start();
        try {
            StrataProbeAdapter adapter = new StrataProbeAdapter(
                "http://localhost:" + slowServer.getAddress().getPort(), 100,
                pattern -> "4310 python3 serve/server.py");
            Result<EngineStatus, ProbeError> result = adapter.probe();

            assertThat(result.isErr()).isTrue();
            assertThat(result.getError()).isInstanceOf(ProbeError.ProbeTimeout.class);
        } finally {
            slowServer.stop(0);
        }
    }

    @Test
    void testProbeUnreachable() {
        StrataProbeAdapter adapter = new StrataProbeAdapter("http://localhost:1", 1000, pattern -> "[s]erve/server\\.py");
        Result<EngineStatus, ProbeError> result = adapter.probe();

        assertThat(result.isErr()).isTrue();
        assertThat(result.getError()).isInstanceOf(ProbeError.EngineUnreachable.class);
    }
}
