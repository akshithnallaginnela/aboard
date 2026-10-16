// Pure chat helpers: merging history, realtime and pending messages; scroll position; day groups.
import type { Message } from "./types";

export type ChatItem = Message & { state: "sent" | "sending" | "failed"; error?: string };

function compareItems(a: ChatItem, b: ChatItem): number {
  return Date.parse(a.sentAt) - Date.parse(b.sentAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/**
 * Merges messages into a transcript, oldest first. Dedupes by id and by clientMessageId so the
 * server copy replaces its pending one; a confirmed message is never downgraded to pending/failed.
 */
export function mergeMessages(current: ChatItem[], incoming: (Message | ChatItem)[]): ChatItem[] {
  const result = [...current];
  for (const message of incoming) {
    const item: ChatItem = "state" in message ? message : { ...message, state: "sent" };
    const index = result.findIndex(
      (existing) =>
        existing.id === item.id || (item.clientMessageId !== null && existing.clientMessageId === item.clientMessageId),
    );
    if (index === -1) result.push(item);
    else if (item.state === "sent" || result[index].state !== "sent") result[index] = item;
  }
  return result.sort(compareItems);
}

/** True when a scroll container is within `threshold` px of its end. */
export function isNearBottom(
  el: Pick<HTMLElement, "scrollHeight" | "scrollTop" | "clientHeight">,
  threshold = 120,
): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

/** Consecutive runs of items sent on the same local calendar day (for day separators). */
export function groupByDay<T extends { sentAt: string }>(items: T[]): { key: string; items: T[] }[] {
  const groups: { key: string; items: T[] }[] = [];
  for (const item of items) {
    const date = new Date(item.sentAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, items: [item] });
  }
  return groups;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
