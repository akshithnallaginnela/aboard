// Shared pieces for the prerendered public pages. Static content only: no data, no browser APIs.
import type * as React from "react";
import { Link } from "react-router";

import { Notice } from "~/components/feedback";
import { PublicContainer } from "~/components/layout";
import { buttonVariants } from "~/components/ui/button";
import { getPublicPage } from "~/lib/site";
import { cn } from "~/lib/utils";

export const sectionTitle = "font-serif text-2xl font-medium leading-[1.2] sm:text-[2rem]";
export const textLink = "font-semibold text-primary underline underline-offset-4 hover:text-primary-hover";

/** Inner public page: the H1 comes from the route inventory (scripts/postbuild.mjs compares it). */
export function PublicPage({ path, lede, children }: { path: string; lede?: React.ReactNode; children: React.ReactNode }) {
  const page = getPublicPage(path);
  return (
    <PublicContainer className="py-12 lg:py-24">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 tabIndex={-1} className="font-serif text-[1.875rem] font-medium leading-[1.15] sm:text-[2.25rem] lg:text-[2.5rem]">
          {page.heading}
        </h1>
        {lede ? <p className="prose-editorial text-lg text-muted-ink">{lede}</p> : null}
        {page.status === "draft" ? (
          <div data-publication-blocker="" className="max-w-2xl">
            <Notice tone="warning" title="Draft — not approved for publication.">
              {page.blocker}
            </Notice>
          </div>
        ) : null}
      </header>
      <div className="mt-12 flex flex-col gap-8 lg:mt-16 lg:gap-12">{children}</div>
    </PublicContainer>
  );
}

/** Rule-separated editorial section: heading left, reading column right on desktop. */
export function PublicSection({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid gap-4 border-t border-divider pt-8 lg:grid-cols-12 lg:gap-8 lg:pt-12">
      <h2 className={cn(sectionTitle, "lg:col-span-4")}>{title}</h2>
      <div className="prose-editorial min-w-0 sm:text-lg lg:col-span-8">{children}</div>
    </section>
  );
}

export function Bullets({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex list-disc flex-col gap-2 pl-6 marker:text-primary", className)}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** Closing invitation with the sparse marigold rule. */
export function JoinCta({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col items-start gap-4">
      <span aria-hidden="true" className="h-1 w-16 bg-accent" />
      <h2 className={sectionTitle}>{title}</h2>
      <div className="prose-editorial text-muted-ink sm:text-lg">{children}</div>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link to="/signup" className={buttonVariants()}>
          Join the founding community
        </Link>
        <Link to="/safety" className={buttonVariants({ variant: "secondary" })}>
          Read about safety
        </Link>
      </div>
    </section>
  );
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Policy layout for privacy/terms while approved legal text is missing: contents, pending sections,
 * and a separately labeled summary of documented product behaviour (never presented as the policy).
 */
export function PolicyPage({ path, sections }: { path: string; sections: string[] }) {
  return (
    <PublicPage
      path={path}
      lede={
        <>
          <span className="font-semibold text-ink">Status:</span> not yet published
        </>
      }
    >
      <section aria-labelledby="product-summary" className="max-w-3xl rounded-panel border border-divider bg-surface p-6 sm:p-8">
        <h2 id="product-summary" className="text-xl font-semibold leading-tight sm:text-2xl">
          Draft product summary (not the policy)
        </h2>
        <p className="mt-3 text-muted-ink">
          Until the approved text is published, this only restates how the product is designed to work. It is not a
          legal policy and gives no legal assurances.
        </p>
        <Bullets
          className="mt-4"
          items={[
            "Profiles are visible only to signed-in members.",
            "Your email address, your messages and any reports you make are never shown on your member profile.",
            "You can message someone only after they accept your connection request.",
            "You can block a member and report a concern from their profile or a conversation.",
            "ConnectAbroad doesn't ask for your passport, visa documents, exact address or phone number.",
          ]}
        />
      </section>

      <div className="grid gap-8 border-t border-divider pt-8 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <nav aria-labelledby="contents-title" className="lg:col-span-4">
          <div className="lg:sticky lg:top-8">
            <h2 id="contents-title" className="text-lg font-semibold">
              Contents
            </h2>
            <p className="mt-1 text-sm text-muted-ink">Sections the approved text must cover</p>
            <ol className="mt-3 list-decimal pl-6 marker:text-muted-ink">
              {sections.map((title) => (
                <li key={title}>
                  <a href={`#${slug(title)}`} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-primary">
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          {sections.map((title, index) => (
            <section key={title} id={slug(title)} className="flex flex-col gap-2 border-b border-divider pb-8 last:border-b-0">
              <h2 className="font-serif text-2xl font-medium leading-[1.2]">
                {index + 1}. {title}
              </h2>
              <p className="text-muted-ink">Approved text pending</p>
            </section>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
