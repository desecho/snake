import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/game/__tests__/**/*.test.ts"]
  }
});
