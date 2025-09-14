import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
  resolve: {
    alias: {
      $: resolve(__dirname, "./src"),
      $lib: resolve(__dirname, "./src/lib"),
      $managers: resolve(__dirname, "./src/managers"),
      $db: resolve(__dirname, "./src/db"),
      "$db-system": resolve(__dirname, "./src/db/system"),
      "$db-tree": resolve(__dirname, "./src/db/trees"),
    },
  },
});
