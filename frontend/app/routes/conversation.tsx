import { ArrowLeft, ChevronDown, Flag, ShieldBan } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useRevalidator } from "react-router";

import type { Route } from "./+types/conversation";
import { Composer, MessageList } from "~/components/chat";
import { ActionError, Notice, RouteErrorState, useOnline } from "~/components/feedback";
import { Avatar } from "~/components/member";
import { BlockDialog, ReportDialog } from "~/components/safety";
import { Button, buttonVariants } from "~/components/ui/button";
import { type ActionFailure, actionFailure, errorMessage } from "~/lib/api";
import { type ChatItem, isNearBottom, mergeMessages } from "~/lib/chat";
import { privateMeta } from "~/lib/meta";
import type { RealtimeStatus } from "~/lib/realtime";
import { api, realtime } from "~/lib/runtime";
import { requireMember, withSession } from "~/lib/session";
import type { Message } from "~/lib/types";
import { newClientId } from "~/lib/utils";

export const meta: Route.MetaFunction = () => privateMeta("Conversation");

export async function clientLoader({ request, params }: Route.ClientLoaderArgs) {
  const member = await requireMember(request);
  return withSession(request, async () => {
    const [conversation, messages] = await Promise.all([
      api.getConversation(params.conversationId),
      api.listMessages(params.conversationId),
    ]);
    return { member, conversation, messages };
  });
}

export default function ConversationRoute({ loaderData }: Route.ComponentProps) {
  return <Conversation key={`${loaderData.member.id}:${loaderData.conversation.id}`} data={loaderData} />;
}

function Conversation({ data }: { data: Route.ComponentProps["loaderData"] }) {
  const { member, conversation } = data;
  const [items, setItems] = useState<ChatItem[]>(() => mergeMessages([], data.messages.items));
  const [hasMore, setHasMore] = useState(data.messages.hasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>(() => realtime.status());
  const [newMessages, setNewMessages] = useState(0);
  const [reportedMessage, setReportedMessage] = useState<Message | null>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const followEnd = useRef(true);
  const restoreScroll = useRef<{ height: number; top: number } | null>(null);
  const inFlight = useRef(new Set<string>());
  const knownMessages = useRef(new Set(data.messages.items.map((message) => message.id)));
  const online = useOnline();
  const { revalidate } = useRevalidator();

  useLayoutEffect(() => {
    const element = transcript.current;
    if (!element) return;
    if (restoreScroll.current) {
      element.scrollTop = restoreScroll.current.top + element.scrollHeight - restoreScroll.current.height;
      restoreScroll.current = null;
    } else if (followEnd.current) element.scrollTop = element.scrollHeight;
  }, [items]);

  useEffect(() => {
    let active = true;
    const markRead = (lastMessageId: string) => {
      void api.markConversationRead(conversation.id, lastMessageId).catch(() => {});
    };
    const last = data.messages.items.at(-1);
    if (last) markRead(last.id);

    const offEvents = realtime.subscribe((event) => {
      if (event.type === "message.created" && event.message.conversationId === conversation.id) {
        const message = event.message;
        const fresh = !knownMessages.current.has(message.id);
        knownMessages.current.add(message.id);
        setItems((current) => mergeMessages(current, [message]));
        if (fresh && message.senderId !== member.id) {
          if (followEnd.current) markRead(message.id);
          else setNewMessages((count) => count + 1);
        }
      } else if (event.type === "connection.updated" ||
        (event.type === "conversation.updated" && event.conversationId === conversation.id)) {
        void revalidate();
      }
    });
    const offStatus = realtime.onStatus((next) => {
      setStatus(next);
      if (next === "open") {
        void api.listMessages(conversation.id).then((page) => {
          if (!active) return;
          for (const message of page.items) knownMessages.current.add(message.id);
          setItems((current) => mergeMessages(current, page.items));
          void revalidate();
        }).catch((error: unknown) => { if (active) setFailure(actionFailure(error)); });
      }
    });
    return () => { active = false; offEvents(); offStatus(); };
  }, [conversation.id, member.id, data.messages.items, revalidate]);

  const unavailable = conversation.restriction !== null;
  const sessionEnded = failure?.kind === "unauthorized";
  const sendDisabled = unavailable || !online || status === "offline" || sessionEnded;

  async function deliver(item: ChatItem) {
    const key = item.clientMessageId;
    if (!key || sendDisabled || inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setFailure(null);
    setItems((current) => mergeMessages(current, [{ ...item, state: "sending", error: undefined }]));
    try {
      const message = await api.sendMessage(conversation.id, { clientMessageId: key, body: item.body });
      knownMessages.current.add(message.id);
      setItems((current) => mergeMessages(current, [message]));
    } catch (error) {
      setItems((current) => current.map((message) =>
        message.clientMessageId === key && message.state !== "sent"
          ? { ...message, state: "failed", error: errorMessage(error) }
          : message,
      ));
      setFailure(actionFailure(error));
      void revalidate();
    } finally { inFlight.current.delete(key); }
  }

  function send(body: string) {
    if (sendDisabled || !body.trim()) return;
    const key = newClientId();
    followEnd.current = true;
    void deliver({
      id: key, clientMessageId: key, conversationId: conversation.id,
      senderId: member.id, body: body.trim(), sentAt: new Date().toISOString(), state: "sending",
    });
  }

  async function loadOlder() {
    const oldest = items.find((message) => message.state === "sent");
    if (loadingOlder || !hasMore || !oldest) return;
    setLoadingOlder(true);
    setFailure(null);
    try {
      const page = await api.listMessages(conversation.id, oldest.id);
      const element = transcript.current;
      if (element) restoreScroll.current = { height: element.scrollHeight, top: element.scrollTop };
      for (const message of page.items) knownMessages.current.add(message.id);
      setItems((current) => mergeMessages(current, page.items));
      setHasMore(page.hasMore);
    } catch (error) { setFailure(actionFailure(error)); }
    finally { setLoadingOlder(false); }
  }

  function showLatest() {
    followEnd.current = true;
    const element = transcript.current;
    if (element) element.scrollTop = element.scrollHeight;
    setNewMessages(0);
    const last = items.filter((message) => message.state === "sent").at(-1);
    if (last) void api.markConversationRead(conversation.id, last.id).catch(() => {});
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="shrink-0 border-b border-divider bg-surface px-3 py-3 sm:px-6">
        <div className="flex items-start gap-3">
          <Link to="/messages" aria-label="All messages" className={buttonVariants({ variant: "quiet", size: "icon" })}>
            <ArrowLeft aria-hidden="true" />
          </Link>
          <Avatar name={conversation.member.displayName} src={conversation.member.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <h1 tabIndex={-1} className="text-lg font-semibold sm:text-xl">{conversation.member.displayName}</h1>
            <Link to={`/people/${encodeURIComponent(conversation.member.id)}`} className="text-sm text-primary underline underline-offset-4">View profile</Link>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ReportDialog member={conversation.member} trigger={<Button variant="quiet" size="sm"><Flag aria-hidden="true" />Report member</Button>} />
          {conversation.restriction === "blocked_by_you" ? null : (
            <BlockDialog member={conversation.member} trigger={<Button variant="quiet" size="sm"><ShieldBan aria-hidden="true" />Block member</Button>} />
          )}
        </div>
      </header>
      <div className="shrink-0 space-y-2 px-3 pt-2 sm:px-6">
        {unavailable ? <Notice tone="warning" title="Messaging is closed">
          {conversation.restriction === "blocked_by_you" ? "You blocked this member. Earlier messages remain here. Manage blocked members in account and privacy settings." : "New messages aren't available with this member. Earlier messages remain here."}
        </Notice> : null}
        {!online || status === "offline" ? <Notice tone="warning">You're offline. Your unsent message stays in this tab.</Notice>
          : status !== "open" ? <p role="status" className="text-sm text-muted-ink">Reconnecting to live updates…</p> : null}
        <ActionError failure={failure} />
      </div>
      <div
        ref={transcript} role="region" aria-label="Message history" tabIndex={0}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6"
        onScroll={() => {
          if (transcript.current) {
            followEnd.current = isNearBottom(transcript.current);
            if (followEnd.current && newMessages > 0) showLatest();
          }
        }}
      >
        {hasMore ? <div className="text-center"><Button variant="secondary" size="sm" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder ? "Loading earlier messages…" : "Load earlier messages"}</Button></div> : null}
        {items.length === 0 ? <p className="py-8 text-center text-muted-ink">No messages yet. Mention what you share and ask one practical question.</p> : null}
        <MessageList items={items} memberId={member.id} otherName={conversation.member.displayName}
          onRetry={(item) => void deliver(item)}
          onRemove={(item) => setItems((current) => current.filter((message) => message.clientMessageId !== item.clientMessageId))}
          onReport={setReportedMessage}
        />
      </div>
      <p role="status" aria-live="polite" className="sr-only">{newMessages ? `${newMessages} new messages` : ""}</p>
      {newMessages > 0 ? <div className="shrink-0 px-3 pb-2 text-center"><Button size="sm" onClick={showLatest}><ChevronDown aria-hidden="true" />New messages ({newMessages})</Button></div> : null}
      <Composer conversationId={conversation.id} recipient={conversation.member.displayName} disabled={Boolean(sendDisabled)} inputRef={composer} onSend={send} />
      <ReportDialog member={conversation.member} message={reportedMessage ?? undefined} open={reportedMessage !== null} onOpenChange={(open) => { if (!open) setReportedMessage(null); }} />
    </div>
  );
}

export function ErrorBoundary() {
  return <div className="px-5 sm:px-6"><RouteErrorState /></div>;
}
