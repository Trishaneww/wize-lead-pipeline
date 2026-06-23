import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    env: { SKIP_ENV_VALIDATION: "true", ANTHROPIC_API_KEY: "test" },
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
