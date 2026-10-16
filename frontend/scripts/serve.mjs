// Local static preview that mirrors the planned Caddy routing (deploy/Caddyfile.example):
//   /api/*, /ws        -> 503 JSON (no backend in this preview)
//   existing files      -> 200 (prerendered public pages, assets)
//   app route prefixes  -> __spa-fallback.html, 200, noindex
//   anything else       -> 404.html with a real 404 status
// Usage: node scripts/serve.mjs <client-dir> [--port 4173]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { isAppRoute } from "../app/lib/site.ts";

const root = path.resolve(process.argv[2] ?? "build/client");
const portFlag = process.argv.indexOf("--port");
const port = Number(portFlag > -1 ? process.argv[portFlag + 1] : 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".data": "text/x-script",
};

function send(res, status, file, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
    "Cache-Control": file.includes(`${path.sep}assets${path.sep}`) ? "public, max-age=31536000, immutable" : "no-cache",
    ...extraHeaders,
  });
  createReadStream(file).pipe(res);
}

function fileFor(urlPath) {
  const resolved = path.join(root, decodeURIComponent(urlPath));
  if (!resolved.startsWith(root)) return null; // path traversal guard
  for (const candidate of [resolved, path.join(resolved, "index.html")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");

  if (pathname.startsWith("/api/") || pathname === "/api" || pathname === "/ws") {
    res.writeHead(503, { "Content-Type": "application/problem+json" });
    res.end(JSON.stringify({ status: 503, code: "backend_unavailable", detail: "No API is connected to this preview." }));
    return;
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    res.writeHead(301, { Location: pathname.replace(/\/+$/, "") });
    res.end();
    return;
  }

  const file = fileFor(pathname);
  if (file && !file.endsWith("__spa-fallback.html")) return send(res, 200, file);
  if (isAppRoute(pathname)) {
    return send(res, 200, path.join(root, "__spa-fallback.html"), { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" });
  }
  return send(res, 404, path.join(root, "404.html"));
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
