import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    conditions: ["development"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/server.ts", "src/api.ts", "src/worker.ts", "src/router.ts", "src/**/*.route.ts"],
    },
  },
});
