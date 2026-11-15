package net.jordimp.status.adapters;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

@FunctionalInterface
public interface PgrepRunner {
    String run(String pattern) throws IOException, InterruptedException;

    static PgrepRunner real() {
        return pattern -> {
            ProcessBuilder pb = new ProcessBuilder("pgrep", "-af", pattern);
            Process p = pb.start();
            try (var reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String out = reader.lines().reduce("", (a, b) -> a + "\n" + b);
                p.waitFor();
                return out.trim();
            }
        };
    }
}
