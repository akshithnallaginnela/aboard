// Shared status, empty, unavailable, access-denied and session states.
import { useEffect, useState } from "react";
import type * as React from "react";
import { AlertTriangle, CheckCircle2, Info, Lock, WifiOff, XCircle } from "lucide-react";
import { Link, isRouteErrorResponse, useLocation, useRevalidator, useRouteError } from "react-router";

import { Button, buttonVariants } from "~/components/ui/button";
import { errorMessage, isApiError } from "~/lib/api";
import { cn } from "~/lib/utils";

type Tone = "info" | "success" | "warning" | "error";

const toneStyles: Record<Tone, string> = {
  info: "border-control-border bg-surface",
  success: "border-primary bg-soft-context",
  warning: "border-accent bg-accent-soft",
  error: "border-danger bg-danger-soft",
};

const toneIcons: Record<Tone, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

/**
 * Inline message. Pass role="status" for completion messages and role="alert" for
 * failures that need immediate attention. Never conveys meaning by color alone.
 */
export function Notice({
  tone = "info",
  title,
  children,
  role,
  action,
  className,
}: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  role?: "status" | "alert";
  action?: React.ReactNode;
  className?: string;
}) {
  const Icon = toneIcons[tone];
  return (
    <div role={role} className={cn("flex gap-3 rounded-panel border-l-4 p-4", toneStyles[tone], className)}>
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", tone === "error" && "text-danger")} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-ink">{children}</div> : null}
        {action ? <div className="mt-2 flex flex-wrap gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-panel border border-dashed border-control-border bg-surface p-6 sm:p-8", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children ? <div className="mt-2 max-w-prose text-muted-ink">{children}</div> : null}
      {action ? <div className="mt-4 flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

/** Full-panel state used for unavailable / denied / not found screens. */
export function StatePanel({
  icon: Icon = Info,
  title,
  children,
  actions,
}: {
  icon?: React.ElementType;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 py-10">
      <Icon aria-hidden="true" className="size-8 text-primary" />
      <h1 tabIndex={-1} className="text-2xl font-semibold leading-tight sm:text-3xl">
        {title}
      </h1>
      {children ? <div className="flex flex-col gap-3 text-muted-ink">{children}</div> : null}
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

export function UnavailableState({ message }: { message?: string }) {
  const revalidator = useRevalidator();
  const retrying = revalidator.state === "loading";
  return (
    <StatePanel
      icon={WifiOff}
      title="This part of ConnectAbroad isn't available right now"
      actions={
        <Button onClick={() => revalidator.revalidate()} aria-disabled={retrying || undefined}>
          {retrying ? "Trying again…" : "Try again"}
        </Button>
      }
    >
      <p>
        {message ??
          "We couldn't reach ConnectAbroad's member service. Nothing was saved or sent. Check your connection, then try again."}
      </p>
      <p role="status" className="sr-only">
        {retrying ? "Trying again" : ""}
      </p>
    </StatePanel>
  );
}

export function AccessDenied({ children }: { children?: React.ReactNode }) {
  return (
    <StatePanel
      icon={Lock}
      title="You don't have access to this page"
      actions={
        <Link className={buttonVariants({ variant: "secondary" })} to="/people">
          Go to people
        </Link>
      }
    >
      {children ?? <p>This area is limited to people with a specific role. If you think this is wrong, contact the team.</p>}
    </StatePanel>
  );
}

export function NotAvailable({ what = "This page" }: { what?: string }) {
  return (
    <StatePanel
      title={`${what} isn't available`}
      actions={
        <Link className={buttonVariants({ variant: "secondary" })} to="/people">
          Find people
        </Link>
      }
    >
      <p>It may have been removed, or you may not have access to it.</p>
    </StatePanel>
  );
}

/** Shown inline when an action fails with 401; keeps the user's unsent input on the page. */
export function SessionEndedNotice() {
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.search);
  return (
    <Notice
      tone="warning"
      role="alert"
      title="Your session has ended"
      action={
        <Link className={buttonVariants({ size: "sm" })} to={`/login?next=${next}&reason=expired`}>
          Log in again
        </Link>
      }
    >
      What you entered is still here. Copy anything important before logging in again.
    </Notice>
  );
}

/** Maps an action failure to the right inline message. */
export function ActionError({ failure }: { failure: { kind: string; message: string } | null | undefined }) {
  if (!failure) return null;
  if (failure.kind === "unauthorized") return <SessionEndedNotice />;
  return (
    <Notice tone="error" role="alert" title="That didn't work">
      {failure.message}
    </Notice>
  );
}

/** Route ErrorBoundary body: unavailable / denied / not found / generic. */
export function RouteErrorState() {
  const error = useRouteError();
  if (isApiError(error)) {
    if (error.kind === "unavailable") return <UnavailableState />;
    if (error.kind === "forbidden") return <AccessDenied />;
    if (error.kind === "not_found") return <NotAvailable />;
    return <UnavailableState message={errorMessage(error)} />;
  }
  if (isRouteErrorResponse(error) && error.status === 404) return <NotAvailable />;
  return <UnavailableState message="Something went wrong while loading this page. Nothing was changed." />;
}

/** Skeleton rows that reserve layout space while content loads. */
export function LoadingRows({ count = 3, label = "Loading" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-panel border border-divider bg-surface" />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function OfflineBanner() {
  const online = useOnline();
  return (
    <div role="status" aria-live="polite">
      {online ? null : (
        <div className="flex items-center gap-2 bg-ink px-5 py-2 text-sm text-white">
          <WifiOff aria-hidden="true" className="size-4" />
          You're offline. Nothing new will be sent or saved until your connection returns.
        </div>
      )}
    </div>
  );
}
