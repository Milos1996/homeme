import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/**/index.ts",
        "src/components/ui/**",
        "src/**/types/**",
      ],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        "src/domain/**": {
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90,
        },
      },
    },
  },
});
