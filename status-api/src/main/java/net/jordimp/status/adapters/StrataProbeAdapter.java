package net.jordimp.status.adapters;

import net.jordimp.status.core.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.ConnectException;
import java.net.http.HttpTimeoutException;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class StrataProbeAdapter {
    private static final Logger log = LoggerFactory.getLogger(StrataProbeAdapter.class);
    private static final JsonMapper mapper = JsonMapper.builder().build();
    private final String baseUrl;
    private final Duration timeout;
    private final HttpClient httpClient;
    private final PgrepRunner pgrep;

    public StrataProbeAdapter(String baseUrl, int timeoutMs) {
        this(baseUrl, timeoutMs, PgrepRunner.real());
    }

    public StrataProbeAdapter(String baseUrl, int timeoutMs, PgrepRunner pgrep) {
        this.baseUrl = baseUrl;
        this.timeout = Duration.ofMillis(timeoutMs);
        this.pgrep = pgrep;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(this.timeout)
                .build();
    }

    public Result<EngineStatus, ProbeError> probe() {
        try {
            String pgrepOutput = executePgrep("[s]erve/server\\.py");
            if (pgrepOutput == null || pgrepOutput.isBlank()) {
                return Result.err(new ProbeError.EngineUnreachable("Strata process not found"));
            }

            var req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/health"))
                    .timeout(timeout)
                    .GET()
                    .build();

            var res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200) {
                return Result.err(new ProbeError.ProbeParseError("Strata health check failed: " + res.statusCode()));
            }

            JsonNode node = mapper.readTree(res.body());
            String model = node.path("model").asText(null);
            boolean loaded = node.path("loaded").asBoolean(false);

            return Result.ok(EngineStatus.strata(model, loaded));

        } catch (HttpTimeoutException | SocketTimeoutException e) {
            log.warn("Strata probe timed out: {}", e.getMessage());
            return Result.err(new ProbeError.ProbeTimeout("Strata probe timed out"));
        } catch (ConnectException e) {
            log.warn("Strata engine unreachable: {}", e.getMessage());
            return Result.err(new ProbeError.EngineUnreachable("Strata engine unreachable"));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Result.err(new ProbeError.EngineUnreachable("probe interrupted"));
        } catch (IOException | RuntimeException e) {
            log.warn("Strata probe error: {}", e.getMessage());
            return Result.err(new ProbeError.ProbeParseError(e.getMessage()));
        }
    }

    private String executePgrep(String pattern) throws IOException, InterruptedException {
        return pgrep.run(pattern);
    }
}
