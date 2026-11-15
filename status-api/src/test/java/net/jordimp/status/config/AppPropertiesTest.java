package net.jordimp.status.config;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AppPropertiesTest {

    @Test
    void validConfigConstructs() {
        var props = new AppProperties(1000, 15, 60, List.of("http://localhost"));
        org.assertj.core.api.Assertions.assertThat(props.probeTimeoutMs()).isEqualTo(1000);
    }

    @Test
    void invalidProbeTimeoutThrowsIAE() {
        assertThatThrownBy(() -> new AppProperties(0, 15, 60, List.of()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("app.probe-timeout-ms");
    }

    @Test
    void invalidHeartbeatThrowsIAE() {
        assertThatThrownBy(() -> new AppProperties(1000, -1, 60, List.of()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("app.sse-heartbeat-seconds");
    }

    @Test
    void invalidRateLimitThrowsIAE() {
        assertThatThrownBy(() -> new AppProperties(1000, 15, 0, List.of()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("app.rate-limit-requests-per-minute");
    }

    @Test
    void nullOriginsThrowsIAE() {
        assertThatThrownBy(() -> new AppProperties(1000, 15, 60, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("app.cors-allowed-origins");
    }
}
