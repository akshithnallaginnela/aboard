import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/connections";
import { EmptyState, Notice, RouteErrorState } from "~/components/feedback";
import { AppContainer, PageHeader } from "~/components/layout";
import { ConnectionRow, ReceivedRequestRow, SentRequestRow, runConnectionAction, type RowDone } from "~/components/people";
import { buttonVariants } from "~/components/ui/button";
import { validationFailure } from "~/lib/api";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { requireMember, withSession } from "~/lib/session";

export const meta: Route.MetaFunction = () => privateMeta("Connections");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireMember(request);
  const value = new URL(request.url).searchParams.get("view");
  const view = value === "sent" || value === "connected" ? value : "received";
  const [received, sent, connected] = await withSession(request, () =>
    Promise.all([api.listRequests("received"), api.listRequests("sent"), api.listConnections()]),
  );
  return { view, received, sent, connected };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  await requireMember(request);
  const form = await request.formData();
  if (!["accept", "decline", "cancel"].includes(String(form.get("intent")))) {
    return validationFailure({ action: "That action isn't available. Refresh your connections and try again." });
  }
  if (!String(form.get("requestId") ?? "").trim()) {
    return validationFailure({ requestId: "That request is no longer available. Refresh your connections and try again." });
  }
  return runConnectionAction(form);
}

export default function ConnectionsRoute({ loaderData }: Route.ComponentProps) {
  const { view, received, sent, connected } = loaderData;
  const [outcome, setOutcome] = useState<RowDone | null>(null);
  const notice = useRef<HTMLDivElement>(null);
  const onDone = useCallback((done: RowDone) => setOutcome(done), []);

  useEffect(() => {
    if (outcome) notice.current?.focus();
  }, [outcome]);

  const views = [
    { value: "received", label: "Received requests", count: received.length },
    { value: "sent", label: "Sent requests", count: sent.length },
    { value: "connected", label: "Your connections", count: connected.length },
  ];

  return (
    <AppContainer className="py-6 sm:py-8">
      <PageHeader
        title="Connections"
        description="Thoughtful introductions are the start of a useful conversation."
        actions={<Link to="/people" className={buttonVariants({ variant: "secondary" })}>Find people</Link>}
      />
      <nav aria-label="Connection views" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {views.map((item) => (
            <li key={item.value}>
              <Link to={`?view=${item.value}`} aria-current={view === item.value ? "page" : undefined} className={buttonVariants({ variant: view === item.value ? "primary" : "secondary" })}>
                {item.label}<span className="ml-1">({item.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {outcome ? (
        <div ref={notice} tabIndex={-1} className="mb-6">
          <Notice tone="success" role="status">
            {outcome.text}
            {outcome.conversationId ? <Link to={`/messages/${outcome.conversationId}`} className="mt-2 block font-semibold text-primary underline underline-offset-4">Start conversation</Link> : null}
          </Notice>
        </div>
      ) : null}
      <section aria-label={views.find((item) => item.value === view)?.label} className="max-w-4xl">
        {view === "received" ? (
          received.length ? <ul className="flex flex-col gap-4">{received.map((request) => <li key={request.id}><ReceivedRequestRow request={request} onDone={onDone} /></li>)}</ul> :
            <EmptyState title="No requests waiting for you.">When another member asks to connect, their introduction will appear here. You choose whether to accept.</EmptyState>
        ) : view === "sent" ? (
          sent.length ? <ul className="flex flex-col gap-4">{sent.map((request) => <li key={request.id}><SentRequestRow request={request} onDone={onDone} /></li>)}</ul> :
            <EmptyState title="You haven't sent a request yet." action={<Link to="/people" className={buttonVariants({ variant: "secondary" })}>Find someone with a shared starting point</Link>}>Visit a profile and add a short introduction when you're ready.</EmptyState>
        ) : connected.length ? (
          <ul className="flex flex-col gap-4">{connected.map((connection) => <li key={connection.id}><ConnectionRow connection={connection} /></li>)}</ul>
        ) : (
          <EmptyState title="Your first connection starts with an introduction." action={<Link to="/people" className={buttonVariants({ variant: "secondary" })}>Find people</Link>}>Accepted requests appear here. You can message each other after a connection is accepted.</EmptyState>
        )}
      </section>
    </AppContainer>
  );
}

export function ErrorBoundary() {
  return <AppContainer><RouteErrorState /></AppContainer>;
}
