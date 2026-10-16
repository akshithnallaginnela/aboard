import { describe, expect, it } from "vitest";

import { type ChatItem, firstName, groupByDay, isNearBottom, mergeMessages } from "./chat";
import type { Message } from "./types";

const message = (id: string, sentAt: string, extra: Partial<Message> = {}): Message => ({
  id,
  conversationId: "c1",
  clientMessageId: null,
  senderId: "other",
  body: id,
  sentAt,
  ...extra,
});

describe("mergeMessages", () => {
  it("dedupes by id and sorts by time, then id", () => {
    const current = mergeMessages([], [message("b", "2026-10-16T10:01:00Z"), message("a", "2026-10-16T10:00:00Z")]);
    const merged = mergeMessages(current, [message("b", "2026-10-16T10:01:00Z"), message("c", "2026-10-16T10:01:00Z")]);
    expect(merged.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(merged.every((item) => item.state === "sent")).toBe(true);
    expect(current.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("compares instants, not strings", () => {
    const merged = mergeMessages([], [message("late", "2026-10-16T10:00:00.500Z"), message("early", "2026-10-16T10:00:00Z")]);
    expect(merged.map((item) => item.id)).toEqual(["early", "late"]);
  });

  it("replaces a pending copy with the server message and never downgrades it", () => {
    const pending: ChatItem = {
      ...message("k1", "2026-10-16T10:05:01Z", { clientMessageId: "k1", senderId: "me" }),
      state: "sending",
    };
    const server = message("m9", "2026-10-16T10:05:00Z", { clientMessageId: "k1", senderId: "me" });
    const history = mergeMessages([], [message("m1", "2026-10-16T10:00:00Z"), pending]);
    expect(history.map((item) => item.state)).toEqual(["sent", "sending"]);
    const confirmed = mergeMessages(history, [server]);
    expect(confirmed.map((item) => [item.id, item.state])).toEqual([
      ["m1", "sent"],
      ["m9", "sent"],
    ]);
    expect(mergeMessages(confirmed, [{ ...pending, state: "failed", error: "Offline" }])).toEqual(confirmed);
  });

  it("lets a retry replace a failed copy", () => {
    const failed: ChatItem = { ...message("k2", "2026-10-16T10:00:00Z", { clientMessageId: "k2" }), state: "failed" };
    const retry: ChatItem = { ...failed, sentAt: "2026-10-16T10:09:00Z", state: "sending" };
    expect(mergeMessages([failed], [retry])).toEqual([retry]);
  });
});

describe("isNearBottom", () => {
  it("is true within the threshold of the end", () => {
    expect(isNearBottom({ scrollHeight: 1000, scrollTop: 780, clientHeight: 100 })).toBe(true);
    expect(isNearBottom({ scrollHeight: 1000, scrollTop: 779, clientHeight: 100 })).toBe(false);
    expect(isNearBottom({ scrollHeight: 1000, scrollTop: 0, clientHeight: 100 }, 900)).toBe(true);
  });
});

describe("groupByDay", () => {
  it("groups consecutive items by local calendar day", () => {
    const at = (day: number, hour: number) => ({ sentAt: new Date(2026, 9, day, hour).toISOString() });
    const groups = groupByDay([at(15, 9), at(15, 23), at(16, 0), at(16, 8), at(18, 12)]);
    expect(groups.map((group) => group.items.length)).toEqual([2, 2, 1]);
    expect(new Set(groups.map((group) => group.key)).size).toBe(3);
  });
});

describe("firstName", () => {
  it("uses the first word of a display name", () => {
    expect(firstName("  Asha  Rao ")).toBe("Asha");
    expect(firstName("Ngozi")).toBe("Ngozi");
  });
});
