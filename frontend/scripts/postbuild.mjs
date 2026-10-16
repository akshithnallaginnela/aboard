// Post-build step + self-check (docs/SEO-AUDIT.md "Build output and hosting gate").
// 1. Copies the prerendered /not-found page to 404.html for hosts.
// 2. Writes robots.txt, and sitemap.xml only when a real canonical origin was built in.
// 3. Fails the build when public HTML lacks its heading/title, metadata disagrees with the
//    route inventory, or demo fixtures/member data leak into the output.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";
import { PUBLIC_PAGES, UTILITY_PAGES } from "../app/lib/site.ts";

const demo = process.env.CONNECTABROAD_DEMO === "1";
const client = path.resolve(import.meta.dirname, "..", demo ? "build-demo" : "build", "client");
const failures = [];
const fail = (message) => failures.push(message);

const htmlFor = (route) => path.join(client, route === "/" ? "index.html" : `${route.slice(1)}/index.html`);
const read = (file) => readFileSync(file, "utf8");
const escapeHtml = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const textOf = (html) => html.replace(/<[^>]+>/g, "").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&");

if (!existsSync(client)) {
  console.error(`postbuild: ${client} does not exist. Run the build first.`);
  process.exit(1);
}

// 404 document
const notFound = htmlFor("/not-found");
if (existsSync(notFound)) copyFileSync(notFound, path.join(client, "404.html"));
else fail("Prerendered /not-found page is missing, so 404.html could not be created.");

if (!existsSync(path.join(client, "__spa-fallback.html"))) fail("__spa-fallback.html was not generated.");

// Canonical origin is read back from the built home page, so HTML and sitemap always agree.
const home = existsSync(htmlFor("/")) ? read(htmlFor("/")) : "";
const origin = home.match(/<link rel="canonical" href="([^"]+?)\/?"/)?.[1] ?? "";

for (const page of PUBLIC_PAGES) {
  const file = htmlFor(page.path);
  if (!existsSync(file)) {
    fail(`${page.path}: prerendered HTML missing`);
    continue;
  }
  const html = read(file);
  if (!html.includes(`<title>${escapeHtml(page.title)}</title>`)) fail(`${page.path}: <title> does not match inventory`);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  if (!h1 || textOf(h1).trim() !== page.heading) fail(`${page.path}: <h1> missing or differs from "${page.heading}"`);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  const shouldIndex = page.status === "ready" && origin !== "" && !demo;
  if (shouldIndex !== robots.startsWith("index")) fail(`${page.path}: robots "${robots}" is wrong for this build`);
  if (page.status === "draft" && !html.includes("data-publication-blocker")) {
    fail(`${page.path}: draft page does not show its publication blocker`);
  }
  if (!html.includes('href="/signup"') && page.path === "/") fail("/: join link missing from initial HTML");
}

for (const page of UTILITY_PAGES) {
  const file = htmlFor(page.path);
  if (!existsSync(file)) fail(`${page.path}: prerendered HTML missing`);
  else if (!read(file).includes('content="noindex')) fail(`${page.path}: utility page must be noindex`);
}

// Demo fixtures must never reach production output; member data never reaches any HTML.
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files.push(full);
  }
};
walk(client);
const MARKER = "ca-demo-fixture-v1";
for (const file of files) {
  if (!/\.(html|js|css|txt|xml)$/.test(file)) continue;
  const content = read(file);
  const rel = path.relative(client, file);
  if (!demo && content.includes(MARKER)) fail(`${rel}: production build contains demo fixture data`);
  if (file.endsWith(".html") && content.includes(MARKER)) fail(`${rel}: HTML contains demo fixture data`);
}

// robots.txt and sitemap.xml
const ready = PUBLIC_PAGES.filter((page) => page.status === "ready");
if (demo) {
  writeFileSync(path.join(client, "robots.txt"), "User-agent: *\nDisallow: /\n");
} else if (origin) {
  writeFileSync(path.join(client, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  const urls = ready.map((page) => `  <url><loc>${origin}${page.path}</loc></url>`).join("\n");
  writeFileSync(
    path.join(client, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
} else {
  // No production origin configured: pages are noindex and no sitemap is advertised.
  writeFileSync(path.join(client, "robots.txt"), "User-agent: *\nAllow: /\n");
}

const drafts = PUBLIC_PAGES.filter((page) => page.status === "draft");
console.log(`postbuild: ${demo ? "DEMO" : "production"} build at ${path.relative(process.cwd(), client)}`);
console.log(`postbuild: canonical origin ${origin || "(none — pages are noindex, no sitemap)"}`);
console.log(`postbuild: publication blockers: ${drafts.map((page) => page.path).join(", ") || "none"}`);
if (failures.length) {
  console.error(`postbuild: ${failures.length} check(s) failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("postbuild: all public-output checks passed");
