package net.jordimp.status.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    int probeTimeoutMs,
    int sseHeartbeatSeconds,
    int rateLimitRequestsPerMinute,
    List<String> corsAllowedOrigins
) {}
