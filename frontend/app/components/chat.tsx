// Messaging pieces: conversation list rows, transcript items and the composer.
import { Send } from "lucide-react";
import { useId, useLayoutEffect, useState } from "react";
import type * as React from "react";
import { Link, NavLink } from "react-router";

import { EmptyState } from "~/components/feedback";
import { TextArea } from "~/components/form";
import { Avatar, StatusLabel } from "~/components/member";
import { Button, buttonVariants } from "~/components/ui/button";
import { type ChatItem, firstName, groupByDay } from "~/lib/chat";
import { formatDay, formatRelative, formatTime } from "~/lib/format";
import type { ConversationSummary, Message } from "~/lib/types";
import { cn } from "~/lib/utils";

export function ConversationList({ conversations }: { conversations: ConversationSummary[] }) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        className="mx-5 sm:mx-6 lg:mx-4"
        title="No conversations yet"
        action={
          <Link to="/connections" className={buttonVariants({ variant: "secondary" })}>
            Go to connections
          </Link>
        }
      >
        When someone accepts your request — or you accept theirs — you can message here.
      </EmptyState>
    );
  }
  return (
    <ul className="border-t border-divider">
      {conversations.map(({ id, member, lastMessage, unreadCount, restriction }) => (
        <li key={id} className="border-b border-divider">
          <NavLink
            to={`/messages/${id}`}
            className={({ isActive }) =>
              cn(
                "flex min-h-16 gap-3 border-l-4 py-3 pl-4 pr-5 hover:bg-soft-context/60 sm:pl-5 sm:pr-6 lg:pl-3 lg:pr-4",
                isActive ? "border-primary bg-soft-context" : "border-transparent",
              )
            }
          >
            {({ isPending }) => (
              <>
                <Avatar name={member.displayName} src={member.avatarUrl} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="min-w-0 font-semibold">{member.displayName}</span>
                    {lastMessage ? (
                      <time dateTime={lastMessage.sentAt} className="text-sm text-muted-ink">
                        {formatRelative(lastMessage.sentAt)}
                      </time>
                    ) : null}
                  </span>
                  <span className="line-clamp-2 text-sm text-muted-ink">
                    {lastMessage ? `${lastMessage.fromSelf ? "You: " : ""}${lastMessage.body}` : "No messages yet"}
                  </span>
                  {unreadCount > 0 || restriction || isPending ? (
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      {unreadCount > 0 ? (
                        <StatusLabel tone="attention">
                          {unreadCount} new
                          <span className="sr-only">{unreadCount === 1 ? " message" : " messages"}</span>
                        </StatusLabel>
                      ) : null}
                      {restriction ? <StatusLabel>Messaging closed</StatusLabel> : null}
                      {isPending ? <span className="text-sm text-muted-ink">Opening…</span> : null}
                    </span>
                  ) : null}
                </span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/** Transcript body with day separators. Keys stay stable when a pending copy is confirmed. */
export function MessageList({
  items,
  memberId,
  otherName,
  onRetry,
  onRemove,
  onReport,
}: {
  items: ChatItem[];
  memberId: string;
  otherName: string;
  onRetry: (item: ChatItem) => void;
  onRemove: (item: ChatItem) => void;
  onReport?: (message: Message) => void;
}) {
  const other = firstName(otherName);
  return groupByDay(items).map((group) => (
    <div key={group.key} className="flex flex-col gap-3">
      <h2 className="pt-2 text-center text-sm font-semibold text-muted-ink">{formatDay(group.items[0].sentAt)}</h2>
      <ol className="flex flex-col gap-3">
        {group.items.map((item) => {
          const own = item.senderId === memberId;
          return (
            <li key={item.clientMessageId ?? item.id} className={cn("flex flex-col gap-1", own ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[min(36rem,85%)] rounded-panel px-3 py-2",
                  own ? "bg-soft-context" : "border border-divider bg-surface",
                )}
              >
                <p className="flex flex-wrap gap-x-2 text-sm">
                  <span className="font-semibold">{own ? "You" : other}</span>
                  {item.state === "sent" ? (
                    <time dateTime={item.sentAt} className="text-muted-ink">
                      {formatTime(item.sentAt)}
                    </time>
                  ) : (
                    <span className="text-muted-ink">{item.state === "sending" ? "Sending…" : "Not sent"}</span>
                  )}
                </p>
                <p className="whitespace-pre-wrap break-words">{item.body}</p>
              </div>
              {!own && item.state === "sent" && onReport ? (
                <Button variant="quiet" size="sm" onClick={() => onReport(item)}
                  aria-label={`Report message from ${other} sent at ${formatTime(item.sentAt)}`}>
                  Report message
                </Button>
              ) : null}
              {item.state === "failed" ? (
                <div className="flex max-w-[min(36rem,85%)] flex-col items-end gap-2 text-right text-sm">
                  <p>
                    <span className="font-semibold text-danger">Not sent.</span> {item.error}
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="secondary" className="min-h-11" onClick={() => onRetry(item)}>
                      Retry
                    </Button>
                    <Button size="sm" variant="quiet" className="min-h-11" onClick={() => onRemove(item)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  ));
}

const MAX_LENGTH = 2000;
/** Unsent drafts per conversation for this tab session. Memory only: never written to storage. */
const drafts = new Map<string, string>();

export function Composer({
  conversationId,
  recipient,
  disabled,
  describedBy,
  inputRef,
  onSend,
}: {
  conversationId: string;
  recipient: string;
  /** Sending is blocked (offline, session ended); the draft stays editable. */
  disabled: boolean;
  /** Id of the text explaining why sending is blocked. */
  describedBy?: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onSend: (body: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(() => drafts.get(conversationId) ?? "");
  const [finePointer] = useState(() => window.matchMedia?.("(pointer: fine)").matches ?? false);
  const nearLimit = draft.length > MAX_LENGTH - 200;
  const empty = draft.trim() === "";

  // Grow with the text; CSS max-height caps it at about six lines, then it scrolls.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [draft, inputRef]);

  function update(value: string) {
    setDraft(value);
    if (value) drafts.set(conversationId, value);
    else drafts.delete(conversationId);
  }

  function submit() {
    if (disabled || empty) return;
    onSend(draft.trim());
    update("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="shrink-0 border-t border-divider bg-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <label htmlFor={id} className="text-sm font-semibold">
        Message {recipient}
      </label>
      <div className="mt-1 flex items-end gap-2">
        <TextArea
          ref={inputRef}
          id={id}
          rows={1}
          maxLength={MAX_LENGTH}
          value={draft}
          onChange={(event) => update(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends only with a keyboard-and-pointer setup, never mid-IME composition.
            if (
              finePointer &&
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              submit();
            }
          }}
          aria-describedby={[finePointer && `${id}-hint`, nearLimit && `${id}-count`].filter(Boolean).join(" ") || undefined}
          className="max-h-40 min-h-11 resize-none overflow-y-auto"
        />
        <Button type="submit" className="shrink-0" aria-disabled={disabled || empty || undefined} aria-describedby={describedBy}>
          <Send aria-hidden="true" />
          Send
        </Button>
      </div>
      {finePointer ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted-ink">
          Enter to send · Shift + Enter for a new line
        </p>
      ) : null}
      {nearLimit ? (
        <p id={`${id}-count`} className="mt-1 text-sm text-muted-ink">
          {MAX_LENGTH - draft.length} characters left
        </p>
      ) : null}
    </form>
  );
}
