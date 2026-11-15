package net.jordimp.status.adapters;

import com.sun.net.httpserver.HttpServer;
import net.jordimp.status.core.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;

import static org.assertj.core.api.Assertions.assertThat;

class LlamaProbeAdapterTest {
    private HttpServer server;
    private int port;

    @BeforeEach
    void setup() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        port = server.getAddress().getPort();
        server.createContext("/health", exchange -> {
            exchange.sendResponseHeaders(200, 0);
            exchange.close();
        });
        server.createContext("/props", exchange -> {
            exchange.sendResponseHeaders(200, 0);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void teardown() {
        server.stop(0);
    }

    @Test
    void testParsePgrepOutput() {
        String fixture = "1234 [l]lama-server -m /path/to/my-model.gguf -c 2048 --parallel 2";
        LlamaProbeAdapter.ParsedLlama parsed = LlamaProbeAdapter.parsePgrepOutput(fixture);

        assertThat(parsed.alias()).isEqualTo("my-model");
        assertThat(parsed.slots()).isEqualTo(2);
        assertThat(parsed.ctxPerSlot()).isEqualTo(1024);
    }

    @Test
    void testProbeSuccess() {
        String fixture = "1234 [l]lama-server -m /models/my-model.gguf -c 2048 --parallel 2";
        LlamaProbeAdapter adapter = new LlamaProbeAdapter("http://localhost:" + port, 1000, pattern -> fixture);
        Result<EngineStatus, ProbeError> result = adapter.probe();

        assertThat(result.isOk()).isTrue();
        assertThat(result.getValue().alias()).isEqualTo("my-model");
        assertThat(result.getValue().slots()).isEqualTo(2);
        assertThat(result.getValue().ctxPerSlot()).isEqualTo(1024);
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
            LlamaProbeAdapter adapter = new LlamaProbeAdapter(
                "http://localhost:" + slowServer.getAddress().getPort(), 100,
                pattern -> "123 [l]lama-server");
            Result<EngineStatus, ProbeError> result = adapter.probe();

            assertThat(result.isErr()).isTrue();
            assertThat(result.getError()).isInstanceOf(ProbeError.ProbeTimeout.class);
        } finally {
            slowServer.stop(0);
        }
    }

    @Test
    void testProbeUnreachable() {
        LlamaProbeAdapter adapter = new LlamaProbeAdapter("http://localhost:1", 1000, pattern -> "123 [l]lama-server");
        Result<EngineStatus, ProbeError> result = adapter.probe();

        assertThat(result.isErr()).isTrue();
        assertThat(result.getError()).isInstanceOf(ProbeError.EngineUnreachable.class);
    }
}
