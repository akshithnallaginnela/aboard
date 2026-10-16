// Mirrors the scripts/postbuild.mjs public-output checks on server-rendered markup,
// so a heading/blocker mismatch fails here instead of at the end of a build.
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { PUBLIC_PAGES, UTILITY_PAGES } from "~/lib/site";
import * as about from "~/routes/about";
import * as guidelines from "~/routes/community-guidelines";
import * as home from "~/routes/home";
import * as howItWorks from "~/routes/how-it-works";
import * as notFound from "~/routes/not-found";
import * as privacy from "~/routes/privacy";
import * as safety from "~/routes/safety";
import * as terms from "~/routes/terms";

const modules: Record<string, typeof home> = {
  "/": home,
  "/how-it-works": howItWorks,
  "/safety": safety,
  "/about": about,
  "/community-guidelines": guidelines,
  "/privacy": privacy,
  "/terms": terms,
  "/not-found": notFound,
};

const render = (mod: typeof home) =>
  renderToString(
    <MemoryRouter>
      <mod.default />
    </MemoryRouter>,
  );
const textOf = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&");
const h1Text = (html: string) => textOf(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "").trim();

describe("public pages match the route inventory", () => {
  for (const page of [...PUBLIC_PAGES, UTILITY_PAGES[3]]) {
    it(page.path, () => {
      const mod = modules[page.path];
      const html = render(mod);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(h1Text(html)).toBe(page.heading);
      expect(mod.meta()[0]).toEqual({ title: page.title });
      expect(html.includes("data-publication-blocker")).toBe("status" in page && page.status === "draft");
    });
  }

  it("home offers signup and the in-page explanation", () => {
    const html = render(home);
    expect(html).toContain('href="/signup"');
    expect(html).toContain('href="#how-it-works"');
    expect(html).toContain('id="how-it-works"');
  });
});
