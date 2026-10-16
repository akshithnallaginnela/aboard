import type { Config } from "@react-router/dev/config";
import { PRERENDER_PATHS } from "./app/lib/site";

const demo = process.env.CONNECTABROAD_DEMO === "1";

export default {
  // Static output only: no Node rendering server in production.
  ssr: false,
  // Explicit allowlist from the shared route inventory. Member screens are never prerendered.
  prerender: PRERENDER_PATHS,
  // Demo builds go to a separate folder so they cannot be mistaken for a production build.
  buildDirectory: demo ? "build-demo" : "build",
} satisfies Config;
