import { useEffect, useRef } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLocation } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { DemoBar } from "~/lib/runtime";
import { Wordmark } from "~/components/layout";
import { buttonVariants } from "~/components/ui/button";

export const links: Route.LinksFunction = () => [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {/* resizes-content keeps the chat composer above the on-screen keyboard where supported. */}
        <meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content" />
        <meta name="theme-color" content="#f7f3e9" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {DemoBar ? <DemoBar /> : null}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** Moves focus to the new page's heading after client-side navigation and announces it. */
function RouteFocus() {
  const location = useLocation();
  const first = useRef(true);
  const announcer = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>("main h1");
      const target = heading ?? document.querySelector<HTMLElement>("main");
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
      if (announcer.current) announcer.current.textContent = document.title;
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return <p ref={announcer} className="sr-only" aria-live="polite" aria-atomic="true" />;
}

export default function App() {
  return (
    <>
      <RouteFocus />
      <Outlet />
    </>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5">
      <Wordmark />
      <p role="status" className="text-muted-ink">
        Loading ConnectAbroad…
      </p>
      <noscript>
        <p className="max-w-md text-center">ConnectAbroad's member area needs JavaScript enabled in your browser.</p>
      </noscript>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-5 py-16">
      <Wordmark />
      <h1 className="font-serif text-4xl font-medium">
        {notFound ? "We couldn't find that page." : "Something went wrong."}
      </h1>
      <p className="text-muted-ink">
        {notFound
          ? "The address may be mistyped, or the page may have moved."
          : "The page couldn't load. Nothing you entered elsewhere was affected. Try again, or go back to the home page."}
      </p>
      {import.meta.env.DEV && error instanceof Error ? (
        <pre className="overflow-x-auto rounded-panel bg-surface p-4 text-sm">{error.stack}</pre>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <a className={buttonVariants()} href="/">
          Go to the home page
        </a>
      </div>
    </main>
  );
}
