// Single route inventory shared by react-router.config.ts (prerender list), route meta,
// scripts/postbuild.mjs (sitemap + self-check) and scripts/serve.mjs (host routing).
// Keep this file free of imports and browser/Vite APIs: Node scripts import it directly.

export type PublicPageStatus = "ready" | "draft";

export interface PublicPage {
  path: string;
  title: string;
  heading: string;
  description: string;
  /** "draft" pages render a visible publication blocker, get noindex and stay out of the sitemap. */
  status: PublicPageStatus;
  blocker?: string;
}

export const PUBLIC_PAGES: PublicPage[] = [
  {
    path: "/",
    title: "ConnectAbroad — Meet People Before You Move Abroad",
    heading: "Move abroad with people who understand your journey.",
    description:
      "Find people with shared roots and lived experience abroad. Join ConnectAbroad's founding community to ask practical questions and make relevant connections.",
    status: "ready",
  },
  {
    path: "/how-it-works",
    title: "How ConnectAbroad Works — From Profile to Connection",
    heading: "Find a relevant person. Start a useful conversation.",
    description:
      "See how profiles, discovery and connection requests work, what members can see, and how to report a concern before joining ConnectAbroad.",
    status: "ready",
  },
  {
    path: "/safety",
    title: "Safety and Privacy — ConnectAbroad",
    heading: "Connect with clear boundaries.",
    description:
      "Understand profile visibility, respectful introductions, reporting and the limits of peer advice on ConnectAbroad.",
    status: "ready",
  },
  {
    path: "/about",
    title: "About ConnectAbroad",
    heading: "Why ConnectAbroad exists",
    description:
      "Why ConnectAbroad is starting with one founding community, what it will and will not do, and how it is being built.",
    status: "draft",
    blocker: "Founder, team and contact details have not been approved for publication.",
  },
  {
    path: "/community-guidelines",
    title: "Community Guidelines — ConnectAbroad",
    heading: "Community guidelines",
    description: "Draft community guidelines for respectful introductions and conversations on ConnectAbroad.",
    status: "draft",
    blocker: "These draft guidelines need founder approval before publication.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy — ConnectAbroad",
    heading: "Privacy policy",
    description: "ConnectAbroad's privacy policy page. The approved policy text has not been published yet.",
    status: "draft",
    blocker: "Approved, legally reviewed privacy policy text is missing.",
  },
  {
    path: "/terms",
    title: "Terms of Use — ConnectAbroad",
    heading: "Terms of use",
    description: "ConnectAbroad's terms of use page. The approved terms have not been published yet.",
    status: "draft",
    blocker: "Approved, legally reviewed terms of use are missing.",
  },
];

/** Public utility documents: prerendered, always noindex, never in the sitemap. */
export const UTILITY_PAGES = [
  { path: "/login", title: "Log in — ConnectAbroad", heading: "Log in" },
  { path: "/signup", title: "Create your account — ConnectAbroad", heading: "Create your account" },
  { path: "/forgot-password", title: "Reset your password — ConnectAbroad", heading: "Reset your password" },
  { path: "/not-found", title: "Page not found — ConnectAbroad", heading: "We couldn't find that page." },
] as const;

export const PRERENDER_PATHS: string[] = [
  ...PUBLIC_PAGES.map((page) => page.path),
  ...UTILITY_PAGES.map((page) => page.path),
];

/**
 * Client-rendered application paths. Hosts serve the generated __spa-fallback.html for these
 * prefixes only; every other unknown path must return a real 404 (404.html).
 */
export const APP_ROUTE_PREFIXES = [
  "/onboarding",
  "/people",
  "/connections",
  "/messages",
  "/notifications",
  "/settings",
  "/admin",
  "/reset-password",
  "/verify-email",
];

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getPublicPage(path: string): PublicPage {
  const page = PUBLIC_PAGES.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`Unknown public page: ${path}`);
  return page;
}
