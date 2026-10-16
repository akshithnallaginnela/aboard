// Member identity pieces: avatar fallback, route line, shared context, topics.
import type * as React from "react";

import { TOPIC_LABELS, initials, journeyPlace } from "~/lib/format";
import type { HelpTopic, Journey } from "~/lib/types";
import { cn } from "~/lib/utils";

const avatarSizes = { sm: "size-10 text-sm", md: "size-14 text-lg", lg: "size-24 text-3xl" } as const;
const fallbackTones = ["bg-soft-context", "bg-accent-soft", "bg-canvas"] as const;

/** Decorative by default: the member's name is always shown next to it. */
export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  const tone = fallbackTones[Array.from(name).reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0) % 3];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-divider font-semibold text-ink",
        avatarSizes[size],
        !src && tone,
        className,
      )}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

/**
 * The product's identity line: origin → destination, drawn as a thin route.
 * Self-described places only; never implies nationality or immigration status.
 */
export function RouteLine({
  from,
  journey,
  city,
  country,
  className,
}: {
  from?: string;
  journey: Journey;
  city: string;
  country: string;
  className?: string;
}) {
  const to = journeyPlace(journey, city, country);
  return (
    <p className={cn("flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-ink", className)}>
      {from ? (
        <>
          <span>From {from}</span>
          <span aria-hidden="true" className="inline-flex items-center">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="h-px w-8 bg-control-border" />
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
          <span className="sr-only">,</span>
        </>
      ) : null}
      <span className="font-semibold text-ink">{to}</span>
    </p>
  );
}

/** Specific shared-background sentences computed by the server. */
export function SharedContext({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn("rounded-panel bg-soft-context px-3.5 py-2.5", className)}>
      <p className="sr-only">What you share:</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item} className="text-sm font-semibold text-ink">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopicList({
  topics,
  label = "Can share experience with",
  limit,
  className,
}: {
  topics: HelpTopic[];
  label?: string;
  limit?: number;
  className?: string;
}) {
  if (topics.length === 0) return null;
  const shown = limit ? topics.slice(0, limit) : topics;
  const hidden = topics.length - shown.length;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-sm text-muted-ink">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {shown.map((topic) => (
          <li key={topic} className="rounded-input border border-divider bg-canvas px-2 py-0.5 text-sm">
            {TOPIC_LABELS[topic]}
          </li>
        ))}
        {hidden > 0 ? <li className="px-1 py-0.5 text-sm text-muted-ink">+{hidden} more</li> : null}
      </ul>
    </div>
  );
}

/** Compact rectangular status label (never a pill on a headline). */
export function StatusLabel({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "attention" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "border-control-border bg-surface text-ink",
    positive: "border-primary bg-soft-context text-ink",
    attention: "border-accent bg-accent-soft text-ink",
    danger: "border-danger bg-danger-soft text-ink",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-input border px-2 py-0.5 text-sm font-semibold leading-snug",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
