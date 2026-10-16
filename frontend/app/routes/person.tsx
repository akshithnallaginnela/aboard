import { useEffect, useRef } from "react";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types/person";
import { ActionError, NotAvailable, Notice, RouteErrorState } from "~/components/feedback";
import { SubmitButton, guardSubmit } from "~/components/form";
import { AppContainer } from "~/components/layout";
import { Avatar, RouteLine, SharedContext, TopicList } from "~/components/member";
import { ConfirmAction, ConnectDialog, ConnectionStatusLabel, runConnectionAction } from "~/components/people";
import { BlockDialog, ReportDialog } from "~/components/safety";
import { Button, buttonVariants } from "~/components/ui/button";
import { validationFailure } from "~/lib/api";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { requireMember, withSession } from "~/lib/session";

export const meta: Route.MetaFunction = () => privateMeta("Member profile");

export async function clientLoader({ request, params }: Route.ClientLoaderArgs) {
  await requireMember(request);
  return withSession(request, () => api.getMember(params.memberId));
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  await requireMember(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (!["send-request", "accept", "decline", "cancel"].includes(String(intent))) {
    return validationFailure({ action: "That action isn't available. Refresh the profile and try again." });
  }
  if (intent !== "send-request" && !String(form.get("requestId") ?? "").trim()) {
    return validationFailure({ requestId: "That request is no longer available. Refresh the profile and try again." });
  }
  return runConnectionAction(form, params.memberId);
}

export default function PersonRoute({ loaderData: member }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof clientAction>();
  const heading = useRef<HTMLHeadingElement>(null);
  const actionsHeading = useRef<HTMLHeadingElement>(null);
  const busy = fetcher.state !== "idle";
  const result = busy ? undefined : fetcher.data;
  const failure = result && !result.ok ? result : null;
  const state = member.connection;

  useEffect(() => {
    if (result?.ok) actionsHeading.current?.focus();
  }, [result]);

  const success = result?.ok
    ? result.intent === "accept"
      ? "You're connected. You can start a conversation."
      : result.intent === "decline"
        ? "You declined the request."
        : result.intent === "cancel"
          ? "Your request was cancelled."
          : "Your connection request was sent."
    : "";

  function submit(intent: "decline" | "cancel", requestId: string) {
    if (!busy) void fetcher.submit({ intent, requestId }, { method: "post" });
  }

  if (state.status === "not_available") {
    return (
      <AppContainer>
        {success ? <Notice tone="success" role="status" className="mt-6">{success}</Notice> : null}
        <NotAvailable what="This member" />
      </AppContainer>
    );
  }

  return (
    <AppContainer className="py-6 sm:py-8">
      <Link to="/people" className="mb-6 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">Back to people</Link>
      <header className="mb-8 flex items-start gap-4 sm:gap-6">
        <Avatar name={member.displayName} src={member.avatarUrl} size="lg" className="size-16 text-xl sm:size-24 sm:text-3xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight wrap-anywhere sm:text-4xl">{member.displayName}</h1>
          <RouteLine from={member.hometown} journey={member.journey} city={member.city} country={member.country} />
          <div><ConnectionStatusLabel connection={state} /></div>
        </div>
      </header>

      {state.status === "blocked_by_you" ? (
        <Notice title="You blocked this member.">
          New requests and messages are stopped. Earlier messages remain in your conversation history.
          <Link to="/settings/privacy#blocked" className="mt-2 block font-semibold text-primary underline underline-offset-4">Manage blocked members</Link>
        </Notice>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6">
            <SharedContext items={member.sharedContext} />
            <section aria-labelledby="about-member" className="rounded-panel border border-divider bg-surface p-5 sm:p-6">
              <h2 id="about-member" className="mb-3 text-xl font-semibold">About</h2>
              <p className="whitespace-pre-line wrap-break-word">{member.bio || "This member hasn't added a bio yet."}</p>
            </section>
            <section aria-labelledby="member-experience" className="flex flex-col gap-4 rounded-panel border border-divider bg-surface p-5 sm:p-6">
              <h2 id="member-experience" className="text-xl font-semibold">Experience and connection</h2>
              {member.helpTopics.length ? <TopicList topics={member.helpTopics} /> : <p className="text-muted-ink">No experience topics shared yet.</p>}
              {member.lookingFor ? <div><h3 className="mb-1 font-semibold">Looking to connect about</h3><p className="whitespace-pre-line wrap-break-word">{member.lookingFor}</p></div> : null}
              <p className="text-sm text-muted-ink">Members share personal experience, not professional immigration, legal or financial advice.</p>
            </section>
            {member.college || member.community || member.languages.length ? (
              <section aria-labelledby="member-background" className="rounded-panel border border-divider bg-surface p-5 sm:p-6">
                <h2 id="member-background" className="mb-4 text-xl font-semibold">Shared roots</h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {member.college ? <div><dt className="text-sm text-muted-ink">College</dt><dd className="mt-1 wrap-anywhere">{member.college}</dd></div> : null}
                  {member.community ? <div><dt className="text-sm text-muted-ink">Community</dt><dd className="mt-1 wrap-anywhere">{member.community}</dd></div> : null}
                  {member.languages.length ? <div><dt className="text-sm text-muted-ink">Languages</dt><dd className="mt-1 wrap-anywhere">{member.languages.join(", ")}</dd></div> : null}
                </dl>
              </section>
            ) : null}
          </div>

          <aside aria-labelledby="connection-heading" className="flex flex-col gap-4 rounded-panel border border-divider bg-surface p-5 sm:p-6">
            <h2 id="connection-heading" ref={actionsHeading} tabIndex={-1} className="text-xl font-semibold">Connect thoughtfully</h2>
            {success ? <Notice tone="success" role="status">{success}</Notice> : null}
            <ActionError failure={failure} />
            <ConnectDialog member={member} returnFocusRef={heading} />
            {state.status === "none" ? <p className="text-sm text-muted-ink">A short introduction helps explain what you share and what you'd like to ask.</p> : null}
            {state.status === "self" ? (
              <><p>This is how your profile appears to other signed-in members.</p><Link to="/settings/profile" className={buttonVariants({ variant: "secondary" })}>Edit your profile</Link></>
            ) : null}
            {state.status === "paused" ? <p>This member isn't accepting new requests right now.</p> : null}
            {state.status === "request_sent" ? (
              <>
                <p>Your request is waiting for a response. They'll decide whether to accept.</p>
                <ConfirmAction label="Cancel request" busy={busy} busyLabel="Cancelling…" title="Cancel your request?" description="Your introduction and connection request will be withdrawn." confirmLabel="Cancel request" keepLabel="Keep request" onConfirm={() => submit("cancel", state.requestId)} />
              </>
            ) : null}
            {state.status === "request_received" ? (
              <>
                <p>This member would like to connect with you. Accepting lets you message each other.</p>
                <fetcher.Form method="post" onSubmit={guardSubmit(busy)}>
                  <input type="hidden" name="intent" value="accept" />
                  <input type="hidden" name="requestId" value={state.requestId} />
                  <SubmitButton busy={busy} busyLabel="Accepting…" className="w-full">Accept request</SubmitButton>
                </fetcher.Form>
                <Link to="/connections?view=received" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">Read their introduction</Link>
                <ConfirmAction label="Decline request" busy={busy} busyLabel="Updating…" title="Decline this request?" description="You won't be connected or able to message each other." confirmLabel="Decline request" keepLabel="Keep request" onConfirm={() => submit("decline", state.requestId)} />
              </>
            ) : null}
            {state.status === "connected" ? <Link to={`/messages/${state.conversationId}`} className={buttonVariants()}>Start conversation</Link> : null}
            {state.status !== "self" ? (
              <div className="flex flex-col gap-3 border-t border-divider pt-4">
                <ReportDialog member={member} trigger={<Button variant="quiet">Report member</Button>} />
                <BlockDialog member={member} trigger={<Button variant="quiet">Block member</Button>} />
              </div>
            ) : null}
            <p className="text-sm text-muted-ink">Profiles are visible to authorized members, not published in public search.</p>
          </aside>
        </div>
      )}
    </AppContainer>
  );
}

export function ErrorBoundary() {
  return <AppContainer><RouteErrorState /></AppContainer>;
}
