import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      // lcov és el format que consumeix SonarQube (sonar.javascript.lcov.reportPaths)
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: ['src/**/*.spec.ts'],
    },
  },
});
