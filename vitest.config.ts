import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    env: { SKIP_ENV_VALIDATION: "true" },
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
