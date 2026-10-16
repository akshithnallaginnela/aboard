import { getPublicPage } from "./site";

const ORIGIN = (import.meta.env.VITE_PUBLIC_SITE_ORIGIN ?? "").replace(/\/+$/, "");

type MetaDescriptor = Record<string, string>;

/** Metadata for an approved public page. Indexable only when ready, deployed with an origin, and not a demo. */
export function publicPageMeta(path: string): MetaDescriptor[] {
  const page = getPublicPage(path);
  const indexable = page.status === "ready" && ORIGIN !== "" && !__DEMO__;
  const url = ORIGIN ? `${ORIGIN}${path}` : "";
  return [
    { title: page.title },
    { name: "description", content: page.description },
    { name: "robots", content: indexable ? "index, follow" : "noindex, follow" },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:type", content: "website" },
    ...(url ? [{ tagName: "link", rel: "canonical", href: url }, { property: "og:url", content: url }] : []),
  ];
}

/** Utility and member pages: never indexed. */
export function privateMeta(title: string): MetaDescriptor[] {
  return [{ title: `${title} — ConnectAbroad` }, { name: "robots", content: "noindex, nofollow" }];
}

export const siteOrigin = ORIGIN;
