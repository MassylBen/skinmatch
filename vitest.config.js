import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/js/**/*.js'],
      exclude: ['src/js/models/**'],
      thresholds: {
        lines:      80,
        functions:  80,
        branches:   75,
        statements: 80,
      },
    },
    include: ['tests/unit/**/*.test.js'],
    reporter: ['verbose'],
  },
});
