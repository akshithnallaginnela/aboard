/// <reference types="vite/client" />

/** True only in builds started through scripts/with-demo.mjs. Replaced at build time. */
declare const __DEMO__: boolean;

interface ImportMetaEnv {
  /** Public HTTPS origin of a real deployment, e.g. https://connectabroad.example. Not a secret. */
  readonly VITE_PUBLIC_SITE_ORIGIN?: string;
}
