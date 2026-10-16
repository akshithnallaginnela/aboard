import type { HelpTopic, Journey, ReportOutcome, ReportReason, ReportStatus } from "./types";

export const TOPIC_LABELS: Record<HelpTopic, string> = {
  "university-life": "University life",
  "housing-search": "Finding a place to live",
  "first-weeks": "The first few weeks",
  "part-time-work": "Part-time work",
  "banking-and-phone": "Bank account and phone",
  healthcare: "Registering for healthcare",
  "food-and-community": "Food and community",
  "career-start": "Starting a career",
};

export const JOURNEY_LABELS: Record<Journey, string> = {
  preparing: "Preparing to move",
  living_abroad: "Living abroad",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harassment: "Harassment or unwanted contact",
  spam_scam: "Spam, scam or fraud",
  impersonation: "Pretending to be someone else",
  inappropriate: "Inappropriate or offensive content",
  safety_concern: "Someone may be at risk of harm",
  other: "Something else",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
};

export const REPORT_OUTCOME_LABELS: Record<ReportOutcome, string> = {
  no_violation: "No violation found",
  warning_recorded: "Warning recorded",
  member_restricted: "Member restricted",
};

/** Countries offered in profile and discovery. Self-described; never implies nationality or status. */
export const COUNTRIES = [
  "Australia",
  "Canada",
  "France",
  "Germany",
  "India",
  "Ireland",
  "Japan",
  "Netherlands",
  "New Zealand",
  "Singapore",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

export function placeLabel(city: string, country: string): string {
  return [city, country].filter(Boolean).join(", ");
}

/** "Living in Manchester, United Kingdom" / "Moving to Toronto, Canada". */
export function journeyPlace(journey: Journey, city: string, country: string): string {
  const place = placeLabel(city, country);
  if (!place) return JOURNEY_LABELS[journey];
  return journey === "living_abroad" ? `Living in ${place}` : `Moving to ${place}`;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatDay(iso: string): string {
  return dayFormat.format(new Date(iso));
}

/** Compact relative time for lists: "just now", "5 min ago", "3 h ago", else a date. */
export function formatRelative(iso: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatDate(iso);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((part) => Array.from(part)[0]?.toUpperCase() ?? "").join("") || "?";
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
