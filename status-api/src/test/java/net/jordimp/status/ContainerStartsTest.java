package net.jordimp.status;

import org.junit.jupiter.api.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.ImageFromDockerfile;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * T9: builds the image from the repo Dockerfile and waits for /api/health.
 * Skips cleanly when no Docker daemon is available (disabledWithoutDocker).
 * First run pays a full Maven build inside the image; later runs reuse the
 * cached dependency layer.
 */
@Testcontainers(disabledWithoutDocker = true)
class ContainerStartsTest {

    @Container
    static final GenericContainer<?> APP = new GenericContainer<>(
            new ImageFromDockerfile()
                    .withFileFromFile("Dockerfile", Path.of("Dockerfile").toFile())
                    .withFileFromFile("pom.xml", Path.of("pom.xml").toFile())
                    .withFileFromPath("src", Path.of("src")))
            .withExposedPorts(8081)
            .waitingFor(Wait.forHttp("/api/health").forStatusCode(200)
                    .withStartupTimeout(Duration.ofMinutes(3)));

    @Test
    void containerServesHealth() throws Exception {
        String url = "http://" + APP.getHost() + ":" + APP.getMappedPort(8081) + "/api/health";
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        HttpResponse<String> res = client.send(
                HttpRequest.newBuilder(URI.create(url)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(res.statusCode()).isEqualTo(200);
        assertThat(res.body()).contains("ok");
    }
}
