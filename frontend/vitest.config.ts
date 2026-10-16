import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit/component tests run without the React Router build plugin. "~/lib/runtime" resolves to
// the HTTP runtime; tests exercising the demo backend import app/lib/demo directly.
export default defineConfig({
  define: { __DEMO__: "false" },
  resolve: {
    tsconfigPaths: true,
    alias: [{ find: /^~\/lib\/runtime$/, replacement: path.resolve(import.meta.dirname, "app/lib/runtime.http.ts") }],
  },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}"],
    setupFiles: ["./app/test/setup.ts"],
    restoreMocks: true,
  },
});
