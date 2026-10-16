// Page chrome shared by public and member layouts.
import { Menu } from "lucide-react";
import type * as React from "react";
import { Link, NavLink } from "react-router";

import { buttonVariants } from "~/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { useSessionMember } from "~/lib/session";
import { cn } from "~/lib/utils";

/** Typographic mark: the two words joined by the route line motif. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-serif text-[1.45rem] font-medium leading-none", className)}>
      <span>Connect</span>
      <span aria-hidden="true" className="inline-flex items-center">
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="h-px w-4 bg-ink" />
        <span className="size-1.5 rounded-full bg-accent" />
      </span>
      <span>Abroad</span>
    </span>
  );
}

export function PublicContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-10", className)} {...props} />;
}

export function AppContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-5 sm:px-6 lg:px-10", className)} {...props} />;
}

/** App page heading block: one H1 (focus target after navigation), optional lede and actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-2">
        <h1 tabIndex={-1} className="text-[1.75rem] font-semibold leading-tight sm:text-[2.25rem]">
          {title}
        </h1>
        {description ? <div className="max-w-2xl text-muted-ink">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

const publicLinks = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/safety", label: "Safety" },
  { to: "/about", label: "About" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex min-h-11 items-center rounded-button px-3 font-semibold underline-offset-[6px] hover:underline",
    isActive && "text-primary underline decoration-2",
  );

export function PublicHeader() {
  const member = useSessionMember();
  return (
    <header className="border-b border-divider bg-canvas">
      <PublicContainer className="flex min-h-16 items-center justify-between gap-4 py-2">
        <Link to="/" className="rounded-button py-2" aria-label="ConnectAbroad home">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {member ? (
            <Link to="/people" className={buttonVariants({ size: "sm" })}>
              Open ConnectAbroad
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: "quiet", size: "sm" })}>
                Log in
              </Link>
              <Link to="/signup" className={buttonVariants({ size: "sm" })}>
                Join
              </Link>
            </>
          )}
        </div>
        <Sheet>
          <SheetTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "md:hidden")}>
            <Menu aria-hidden="true" />
            Menu
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
            <nav aria-label="Main" className="flex flex-col gap-1">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              {publicLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex flex-col gap-3 border-t border-divider pt-4">
              {member ? (
                <Link to="/people" className={buttonVariants()}>
                  Open ConnectAbroad
                </Link>
              ) : (
                <>
                  <Link to="/signup" className={buttonVariants()}>
                    Join the founding community
                  </Link>
                  <Link to="/login" className={buttonVariants({ variant: "secondary" })}>
                    Log in
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </PublicContainer>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-divider bg-canvas">
      <PublicContainer className="flex flex-col gap-8 py-10 md:flex-row md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Wordmark />
          <p className="text-sm text-muted-ink">
            Peer experience from people who made a similar move. Not immigration, legal or financial advice.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
          {[
            ["/how-it-works", "How it works"],
            ["/safety", "Safety and privacy"],
            ["/about", "About"],
            ["/community-guidelines", "Community guidelines"],
            ["/privacy", "Privacy policy"],
            ["/terms", "Terms of use"],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
              {label}
            </Link>
          ))}
        </nav>
      </PublicContainer>
    </footer>
  );
}
