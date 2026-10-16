// Type-checking entry only. Vite replaces "~/lib/runtime" with runtime.http.ts (default)
// or runtime.demo.ts (explicit demo builds) — see vite.config.ts. Both export the same shape.
export * from "./runtime.http";
