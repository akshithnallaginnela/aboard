import path from "node:path";
import type { ServerResponse } from "node:http";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Demo mode is an explicit build/dev switch (scripts/with-demo.mjs). Production builds
// never include app/lib/demo: the runtime module is swapped at build time, not at runtime.
const demo = process.env.CONNECTABROAD_DEMO === "1";
const backend = process.env.CONNECTABROAD_BACKEND ?? "http://localhost:8080";

function backendUnavailable(_err: Error, _req: unknown, res: unknown) {
  const response = res as ServerResponse;
  if (typeof response.writeHead !== "function" || response.headersSent) return;
  response.writeHead(503, { "Content-Type": "application/problem+json" });
  response.end(
    JSON.stringify({
      status: 503,
      code: "backend_unavailable",
      detail: `The ConnectAbroad API is not running at ${backend}.`,
    }),
  );
}

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  define: {
    __DEMO__: JSON.stringify(demo),
  },
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: /^~\/lib\/runtime$/,
        replacement: path.resolve(import.meta.dirname, `app/lib/runtime.${demo ? "demo" : "http"}.ts`),
      },
    ],
  },
  server: {
    proxy: demo
      ? undefined
      : {
          "/api": {
            target: backend,
            configure: (proxy) => proxy.on("error", backendUnavailable),
          },
          "/ws": {
            target: backend.replace(/^http/, "ws"),
            ws: true,
            configure: (proxy) => proxy.on("error", backendUnavailable),
          },
        },
  },
});
