package net.jordimp.status.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    int probeTimeoutMs,
    int sseHeartbeatSeconds,
    int rateLimitRequestsPerMinute,
    List<String> corsAllowedOrigins,
    int poolTopN,
    String poolPath
) {
    /**
     * T8: Compact constructor for startup validation.
     */
    public AppProperties {
        if (probeTimeoutMs <= 0) {
            throw new IllegalArgumentException("app.probe-timeout-ms must be > 0");
        }
        if (sseHeartbeatSeconds <= 0) {
            throw new IllegalArgumentException("app.sse-heartbeat-seconds must be > 0");
        }
        if (rateLimitRequestsPerMinute <= 0) {
            throw new IllegalArgumentException("app.rate-limit-requests-per-minute must be > 0");
        }
        if (corsAllowedOrigins == null) {
            throw new IllegalArgumentException("app.cors-allowed-origins cannot be null");
        }
        if (poolTopN <= 0) {
            throw new IllegalArgumentException("app.pool-top-n must be > 0");
        }
        if (poolPath == null || poolPath.isBlank()) {
            throw new IllegalArgumentException("app.pool-path cannot be blank");
        }
    }
}
