package net.jordimp.status.web;

import net.jordimp.status.core.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "app.probe-timeout-ms=1000",
    "app.sse-heartbeat-seconds=15",
    "app.rate-limit-requests-per-minute=3",
    "app.refresh-interval-ms=3600000",
    "app.cors-allowed-origins=https://jordimp.net,http://localhost:4321",
    "spring.main.allow-bean-definition-overriding=true"
})
class StatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public StatusService statusService() {
            // Seed with fixed snapshot
            EngineStatus llama = EngineStatus.llama("test-alias", 4, 2048, "v1");
            EngineStatus strata = EngineStatus.strata("model-x", true);
            return new StatusService(() -> Result.ok(llama), () -> Result.ok(strata)) {
                @Override public StatusSnapshot currentSnapshot() {
                    return new StatusSnapshot(llama, strata);
                }
            };
        }
    }

    @Test
    void testGetStatusShapeAndFiltering() throws Exception {
        // dedicated IP so the shared 3/min bucket does not leak between tests (R15 exercise)
        mockMvc.perform(get("/api/status").header("CF-Connecting-IP", "198.51.100.1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.llamacpp.alias").value("test-alias"))
                .andExpect(jsonPath("$.llamacpp.modelName").doesNotExist()) // R9 filtering
                .andExpect(jsonPath("$.strata.modelName").value("model-x"))
                .andExpect(jsonPath("$.strata.alias").doesNotExist());
    }

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health").header("CF-Connecting-IP", "198.51.100.2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void testRateLimiting() throws Exception {
        // Limit is 3 per minute in @TestPropertySource; dedicated IP isolates the bucket
        mockMvc.perform(get("/api/status").header("CF-Connecting-IP", "198.51.100.7")).andExpect(status().isOk());
        mockMvc.perform(get("/api/status").header("CF-Connecting-IP", "198.51.100.7")).andExpect(status().isOk());
        mockMvc.perform(get("/api/status").header("CF-Connecting-IP", "198.51.100.7")).andExpect(status().isOk());
        
        // 4th request
        mockMvc.perform(get("/api/status").header("CF-Connecting-IP", "198.51.100.7"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(content().contentType("application/problem+json"));
    }

    @Test
    void testCorsBehavior() throws Exception {
        // Allowed origin
        mockMvc.perform(get("/api/status").header("Origin", "https://jordimp.net").header("CF-Connecting-IP", "198.51.100.3"))
                .andExpect(header().string("Access-Control-Allow-Origin", "https://jordimp.net"));

        // Foreign origin (no header)
        mockMvc.perform(get("/api/status").header("Origin", "https://evil.com").header("CF-Connecting-IP", "198.51.100.4"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
