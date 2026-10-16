// People discovery rows, profile connection controls and connection request rows.
import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Link, useFetcher } from "react-router";

import { ActionError, Notice } from "~/components/feedback";
import { ErrorSummary, Field, SubmitButton, TextArea, guardSubmit } from "~/components/form";
import { Avatar, RouteLine, SharedContext, StatusLabel, TopicList } from "~/components/member";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { type ActionResult, actionFailure, validationFailure } from "~/lib/api";
import { formatDate } from "~/lib/format";
import { api } from "~/lib/runtime";
import {
  HELP_TOPICS,
  type Connection,
  type ConnectionRequest,
  type ConnectionState,
  type HelpTopic,
  type MemberSearchQuery,
  type MemberSummary,
} from "~/lib/types";
import { cn } from "~/lib/utils";

// ---------- Discovery URL state ----------

/** Reads discovery filters from the URL. Unknown values are dropped instead of being sent to the API. */
export function parseMemberSearch(params: URLSearchParams): MemberSearchQuery {
  const journey = params.get("journey");
  const topic = params.get("topic") as HelpTopic;
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return {
    q: params.get("q")?.trim() || undefined,
    journey: journey === "preparing" || journey === "living_abroad" ? journey : undefined,
    country: params.get("country") || undefined,
    topic: HELP_TOPICS.includes(topic) ? topic : undefined,
    shared: params.get("shared") === "1" || undefined,
    page: page > 1 ? page : 1,
  };
}

export function searchHref(query: MemberSearchQuery, page = 1): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.journey) params.set("journey", query.journey);
  if (query.country) params.set("country", query.country);
  if (query.topic) params.set("topic", query.topic);
  if (query.shared) params.set("shared", "1");
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/people?${search}` : "/people";
}

export function activeFilterCount(query: MemberSearchQuery): number {
  return [query.q, query.journey, query.country, query.topic, query.shared].filter(Boolean).length;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// ---------- Connection actions (shared clientAction body) ----------

export const INTRODUCTION_MAX = 500;

export type ConnectionIntent = "send-request" | "cancel" | "accept" | "decline";
export type ConnectionActionData = ActionResult<{ intent: ConnectionIntent; connection?: Connection }>;

/** Runs one connection intent. Success is only ever returned after the API resolved. */
export async function runConnectionAction(form: FormData, memberId?: string): Promise<ConnectionActionData> {
  const intent = form.get("intent");
  const requestId = String(form.get("requestId") ?? "");
  try {
    if (intent === "send-request" && memberId) {
      const introduction = String(form.get("introduction") ?? "").trim();
      if (introduction.length > INTRODUCTION_MAX) {
        return validationFailure({
          introduction: `Shorten your introduction to ${INTRODUCTION_MAX} characters or fewer. It has ${introduction.length}.`,
        });
      }
      await api.sendRequest(memberId, introduction);
      return { ok: true, intent };
    }
    if (intent === "accept") return { ok: true, intent, connection: await api.acceptRequest(requestId) };
    if (intent === "decline") {
      await api.declineRequest(requestId);
      return { ok: true, intent };
    }
    if (intent === "cancel") {
      await api.cancelRequest(requestId);
      return { ok: true, intent };
    }
  } catch (error) {
    return actionFailure(error);
  }
  return actionFailure(null);
}

// ---------- Member pieces ----------

const STATUS_LABELS: Partial<Record<ConnectionState["status"], [string, "neutral" | "positive" | "attention"]>> = {
  request_sent: ["Request sent", "neutral"],
  request_received: ["Wants to connect with you", "attention"],
  connected: ["Connected", "positive"],
  paused: ["Not taking requests right now", "neutral"],
};

/** Viewer-relative state for rows. Blocks and unavailable members show nothing. */
export function ConnectionStatusLabel({ connection }: { connection: ConnectionState }) {
  const label = STATUS_LABELS[connection.status];
  return label ? <StatusLabel tone={label[1]}>{label[0]}</StatusLabel> : null;
}

/** Avatar, name (h2 link to the profile) and route line. `children` sits beside the name. */
function MemberIdentity({ member, children }: { member: MemberSummary; children?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-4">
      <Avatar name={member.displayName} src={member.avatarUrl} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h2 className="min-w-0 text-lg font-semibold leading-snug wrap-anywhere">
            <Link to={`/people/${member.id}`} className="underline-offset-4 hover:underline">
              {member.displayName}
            </Link>
          </h2>
          {children}
        </div>
        <RouteLine from={member.hometown} journey={member.journey} city={member.city} country={member.country} />
      </div>
    </div>
  );
}

const rowClass = "flex flex-col gap-3 rounded-panel border border-divider bg-surface p-4 sm:p-5";
// Aligns row details with the name column (avatar 56px + 16px gap).
const detailsClass = "flex min-w-0 flex-col gap-3 sm:pl-18";

export function PersonRow({ member }: { member: MemberSummary }) {
  return (
    <article className={rowClass}>
      <MemberIdentity member={member}>
        <ConnectionStatusLabel connection={member.connection} />
      </MemberIdentity>
      <div className={detailsClass}>
        <SharedContext items={member.sharedContext} />
        <TopicList topics={member.helpTopics} limit={3} />
        {member.lookingFor ? (
          <p className="line-clamp-2 wrap-break-word">
            <span className="text-muted-ink">Looking for: </span>
            {member.lookingFor}
          </p>
        ) : null}
        <div>
          <Link to={`/people/${member.id}`} className={buttonVariants({ variant: "secondary" })}>
            View profile<span className="sr-only">: {member.displayName}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ---------- Confirmations ----------

/** Secondary button that asks for confirmation before a consequential action. */
export function ConfirmAction({
  label,
  busy,
  busyLabel,
  title,
  description,
  confirmLabel,
  keepLabel,
  onConfirm,
}: {
  label: React.ReactNode;
  busy: boolean;
  busyLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  keepLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          aria-disabled={busy || undefined}
          onClick={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          {busy ? busyLabel : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="wrap-anywhere">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{keepLabel}</AlertDialogCancel>
          <AlertDialogAction destructive onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------- Ask to connect ----------

/**
 * "Ask to connect" button + dialog. Render it in a fixed spot (it renders nothing when a request
 * can't be sent) so the dialog survives the revalidation that follows a sent request.
 */
export function ConnectDialog({
  member,
  returnFocusRef,
}: {
  member: MemberSummary;
  /** Focus target when the dialog closes after its trigger disappeared. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const canAsk = member.connection.status === "none";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {canAsk ? (
        <DialogTrigger asChild>
          <Button className="w-full">Ask to connect</Button>
        </DialogTrigger>
      ) : null}
      <DialogContent
        onCloseAutoFocus={(event) => {
          if (canAsk) return;
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="wrap-anywhere">Ask {member.displayName} to connect</DialogTitle>
          <DialogDescription>
            Your introduction is shown with your request. If {firstName(member.displayName)} accepts, you can message
            each other.
          </DialogDescription>
        </DialogHeader>
        <ConnectForm member={member} />
      </DialogContent>
    </Dialog>
  );
}

/** Mounted per dialog opening, so each opening starts with a fresh fetcher. */
function ConnectForm({ member }: { member: MemberSummary }) {
  const fetcher = useFetcher<ConnectionActionData>();
  const [length, setLength] = useState(0);
  const sentRef = useRef<HTMLDivElement>(null);
  const busy = fetcher.state !== "idle";
  const result = fetcher.data;
  const sent = result?.ok === true;

  useEffect(() => {
    if (sent) sentRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <>
        <div ref={sentRef} tabIndex={-1}>
          <Notice tone="success" role="status" title="Request sent.">
            {member.displayName} will decide whether to accept.
          </Notice>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </>
    );
  }

  const failure = result && !result.ok ? result : null;
  const fieldErrors = failure?.fieldErrors ?? {};
  const over = length - INTRODUCTION_MAX;
  const countId = "field-introduction-count";
  return (
    <fetcher.Form
      method="post"
      action={`/people/${member.id}`}
      onSubmit={guardSubmit(busy)}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="intent" value="send-request" />
      <ErrorSummary errors={fieldErrors} />
      {failure && Object.keys(fieldErrors).length === 0 ? <ActionError failure={failure} /> : null}
      <div className="flex flex-col gap-1.5">
        <Field
          name="introduction"
          label="Introduction"
          optional
          error={fieldErrors.introduction}
          hint={
            <>
              Mention what you share and one question you'd like to ask.
              <span className="mt-1 block">
                For example: “We studied at the same college. I'd like to learn about settling into university
                life.”
              </span>
            </>
          }
        >
          {(control) => (
            <TextArea
              {...control}
              aria-describedby={[control["aria-describedby"], countId].filter(Boolean).join(" ")}
              rows={5}
              onChange={(event) => setLength(event.currentTarget.value.length)}
            />
          )}
        </Field>
        <p id={countId} className={cn("text-sm", over > 0 ? "font-semibold text-danger" : "text-muted-ink")}>
          {over > 0 ? `${over} characters too many` : `${-over} characters remaining`}
        </p>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <SubmitButton busy={busy} busyLabel="Sending…">
          Send request
        </SubmitButton>
      </DialogFooter>
    </fetcher.Form>
  );
}

// ---------- Connection request rows (/connections) ----------

/** Server-confirmed outcome a row reports before it leaves the list. */
export interface RowDone {
  id: string;
  text: string;
  conversationId?: string;
}

function Introduction({ label, text }: { label: string; text: string }) {
  if (!text) return <p className="text-muted-ink">No introduction added.</p>;
  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-sm text-muted-ink">{label}</figcaption>
      <blockquote className="whitespace-pre-line border-l-2 border-control-border pl-3 wrap-break-word">{text}</blockquote>
    </figure>
  );
}

function When({ label, iso }: { label: string; iso: string }) {
  return (
    <p className="text-sm text-muted-ink">
      {label} <time dateTime={iso}>{formatDate(iso)}</time>
    </p>
  );
}

/** Per-row fetcher posting to /connections; busy state covers the action and the revalidation after it. */
function useRowFetcher() {
  const fetcher = useFetcher<ConnectionActionData>();
  const busy = fetcher.state !== "idle";
  return {
    fetcher,
    busy,
    busyIntent: busy ? fetcher.formData?.get("intent") : null,
    failure: !busy && fetcher.data && !fetcher.data.ok ? fetcher.data : null,
    submit: (intent: ConnectionIntent, requestId: string) =>
      void fetcher.submit({ intent, requestId }, { method: "post", action: "/connections" }),
  };
}

// Rows report success upward as soon as the server answers: the row leaves the list on revalidation.
export function ReceivedRequestRow({ request, onDone }: { request: ConnectionRequest; onDone: (done: RowDone) => void }) {
  const name = request.member.displayName;
  const { fetcher, busy, busyIntent, failure, submit } = useRowFetcher();
  const data = fetcher.data;
  useEffect(() => {
    if (!data?.ok) return;
    onDone({
      id: request.id,
      text: data.intent === "accept" ? `You're connected with ${name}.` : `You declined ${name}'s request.`,
      conversationId: data.connection?.conversationId,
    });
  }, [data, onDone, request.id, name]);
  return (
    <article className={rowClass}>
      <MemberIdentity member={request.member} />
      <div className={detailsClass}>
        <SharedContext items={request.member.sharedContext} />
        <Introduction label="Their introduction" text={request.introduction} />
        <When label="Received" iso={request.createdAt} />
        {request.status === "pending" ? (
          <div className="flex flex-wrap gap-3">
            <fetcher.Form method="post" action="/connections" onSubmit={guardSubmit(busy)}>
              <input type="hidden" name="intent" value="accept" />
              <input type="hidden" name="requestId" value={request.id} />
              <SubmitButton busy={busyIntent === "accept"} busyLabel="Accepting…">
                Accept<span className="sr-only"> request from {name}</span>
              </SubmitButton>
            </fetcher.Form>
            <ConfirmAction
              label={
                <>
                  Decline<span className="sr-only"> request from {name}</span>
                </>
              }
              busy={busyIntent === "decline"}
              busyLabel="Declining…"
              title={`Decline ${name}'s request?`}
              description={`${name} won't be able to send you another request.`}
              confirmLabel="Decline request"
              keepLabel="Keep request"
              onConfirm={() => !busy && submit("decline", request.id)}
            />
          </div>
        ) : (
          <div>
            <StatusLabel>Declined</StatusLabel>
          </div>
        )}
        <ActionError failure={failure} />
      </div>
    </article>
  );
}

export function SentRequestRow({ request, onDone }: { request: ConnectionRequest; onDone: (done: RowDone) => void }) {
  const name = request.member.displayName;
  const pending = request.status === "pending";
  const { fetcher, busy, busyIntent, failure, submit } = useRowFetcher();
  const data = fetcher.data;
  useEffect(() => {
    if (data?.ok) onDone({ id: request.id, text: `You cancelled your request to ${name}.` });
  }, [data, onDone, request.id, name]);
  return (
    <article className={rowClass}>
      <MemberIdentity member={request.member}>
        <StatusLabel>{pending ? "Pending" : "Not accepted"}</StatusLabel>
      </MemberIdentity>
      <div className={detailsClass}>
        <SharedContext items={request.member.sharedContext} />
        <Introduction label="Your introduction" text={request.introduction} />
        <When label="Sent" iso={request.createdAt} />
        {pending ? (
          <div>
            <ConfirmAction
              label={
                <>
                  Cancel request<span className="sr-only"> to {name}</span>
                </>
              }
              busy={busyIntent === "cancel"}
              busyLabel="Cancelling…"
              title="Cancel your request?"
              description={`Your request to ${name} will be withdrawn.`}
              confirmLabel="Cancel request"
              keepLabel="Keep request"
              onConfirm={() => !busy && submit("cancel", request.id)}
            />
          </div>
        ) : null}
        <ActionError failure={failure} />
      </div>
    </article>
  );
}

export function ConnectionRow({ connection }: { connection: Connection }) {
  const { member } = connection;
  return (
    <article className={rowClass}>
      <MemberIdentity member={member} />
      <div className={detailsClass}>
        <SharedContext items={member.sharedContext} />
        <When label="Connected since" iso={connection.connectedAt} />
        <div className="flex flex-wrap gap-3">
          <Link to={`/messages/${connection.conversationId}`} className={buttonVariants()}>
            Message<span className="sr-only"> {member.displayName}</span>
          </Link>
          <Link to={`/people/${member.id}`} className={buttonVariants({ variant: "secondary" })}>
            View profile<span className="sr-only">: {member.displayName}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
