import { useEffect, useRef } from "react";
import type * as React from "react";
import { useFetcher } from "react-router";

import type { Route } from "./+types/settings-privacy";
import { ActionError, Notice, RouteErrorState } from "~/components/feedback";
import { Checkbox, ErrorSummary, Field, SubmitButton, TextInput, guardSubmit } from "~/components/form";
import { AppContainer, PageHeader } from "~/components/layout";
import { Avatar } from "~/components/member";
import { SettingsNav } from "~/components/settings";
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
import { Button } from "~/components/ui/button";
import { type ActionFailure, actionFailure, validationFailure } from "~/lib/api";
import { formatDate } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { useLogout, withSession } from "~/lib/session";
import type { AccountSettings, BlockedMember, DeletionRequest } from "~/lib/types";

export const meta: Route.MetaFunction = () => privateMeta("Account and privacy");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const [settings, blocks] = await withSession(request, () =>
    Promise.all([api.getAccountSettings(), api.listBlocks()]),
  );
  return { settings, blocks };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const checked = (name: string) => form.get(name) === "on";
  try {
    switch (form.get("intent")) {
      case "visibility":
        await api.updateAccountSettings({ discoverable: checked("discoverable"), openToRequests: checked("openToRequests") });
        return { ok: true as const };
      case "notifications":
        await api.updateAccountSettings({
          emailNotifications: { requests: checked("emailRequests"), messages: checked("emailMessages") },
        });
        return { ok: true as const };
      case "unblock":
        await api.unblockMember(String(form.get("memberId")));
        return { ok: true as const, name: String(form.get("name") ?? "") };
      case "delete": {
        if (String(form.get("confirmation") ?? "").trim() !== "DELETE") {
          return validationFailure({ confirmation: "Type DELETE in capital letters to confirm." });
        }
        const deletion = await api.requestAccountDeletion({ confirmation: "DELETE" });
        return { ok: true as const, deletion };
      }
    }
  } catch (error) {
    return actionFailure(error);
  }
  throw new Response("Unknown action", { status: 400 });
}

export default function SettingsPrivacyRoute({ loaderData }: Route.ComponentProps) {
  const { settings, blocks } = loaderData;
  return (
    <AppContainer className="py-6 sm:py-8">
      <PageHeader title="Account and privacy" description="Choose who can find you, what we email you about, and manage your account." />
      <SettingsNav />
      <div className="flex max-w-3xl flex-col gap-6">
        <VisibilitySection settings={settings} />
        <NotificationsSection settings={settings} />
        <BlockedSection blocks={blocks} />
        <AccountSection email={settings.email} />
        <DeletionSection saved={settings.deletionRequest} />
      </div>
    </AppContainer>
  );
}

function Panel({
  id,
  title,
  headingRef,
  children,
}: {
  id: string;
  title: string;
  headingRef?: React.Ref<HTMLHeadingElement>;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-6 flex-col gap-4 rounded-panel border border-divider bg-surface p-4 sm:p-6"
    >
      <h2 id={`${id}-title`} ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Server-confirmed outcome of one section's last submission. */
function Outcome({ data, success }: { data: { ok: true } | ActionFailure | undefined; success: string }) {
  if (!data) return null;
  return data.ok ? (
    <Notice tone="success" role="status">
      {success}
    </Notice>
  ) : (
    <ActionError failure={data} />
  );
}

function VisibilitySection({ settings }: { settings: AccountSettings }) {
  const fetcher = useFetcher<typeof clientAction>();
  const busy = fetcher.state !== "idle";
  return (
    <Panel id="visibility" title="Visibility">
      <fetcher.Form method="post" onSubmit={guardSubmit(busy)} className="flex flex-col gap-4">
        <input type="hidden" name="intent" value="visibility" />
        <Checkbox
          name="discoverable"
          defaultChecked={settings.discoverable}
          label="Show my profile in member search"
          hint="When this is off, other members can't find you in search."
        />
        <Checkbox
          name="openToRequests"
          defaultChecked={settings.openToRequests}
          label="Accept new connection requests"
          hint="When this is off, your profile shows that you aren't accepting requests right now."
        />
        <Outcome data={busy ? undefined : fetcher.data} success="Visibility settings saved." />
        <SubmitButton busy={busy} busyLabel="Saving…" className="self-start">
          Save visibility
        </SubmitButton>
      </fetcher.Form>
    </Panel>
  );
}

function NotificationsSection({ settings }: { settings: AccountSettings }) {
  const fetcher = useFetcher<typeof clientAction>();
  const busy = fetcher.state !== "idle";
  return (
    <Panel id="notifications" title="Notifications">
      {settings.emailDeliveryAvailable ? null : (
        <Notice tone="warning">Email notifications aren't being sent yet. Your choices are saved for when they are.</Notice>
      )}
      <fetcher.Form method="post" onSubmit={guardSubmit(busy)} className="flex flex-col gap-4">
        <input type="hidden" name="intent" value="notifications" />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-semibold">Email me about</legend>
          <Checkbox name="emailRequests" label="New connection requests" defaultChecked={settings.emailNotifications.requests} />
          <Checkbox name="emailMessages" label="New messages" defaultChecked={settings.emailNotifications.messages} />
        </fieldset>
        <Outcome data={busy ? undefined : fetcher.data} success="Notification settings saved." />
        <SubmitButton busy={busy} busyLabel="Saving…" className="self-start">
          Save notifications
        </SubmitButton>
      </fetcher.Form>
    </Panel>
  );
}

function BlockedSection({ blocks }: { blocks: BlockedMember[] }) {
  // One fetcher for the list: its outcome must outlive the row that is removed.
  const fetcher = useFetcher<typeof clientAction>();
  const heading = useRef<HTMLHeadingElement>(null);
  const busy = fetcher.state !== "idle";
  const data = busy ? undefined : fetcher.data;
  useEffect(() => {
    if (data?.ok) heading.current?.focus();
  }, [data]);
  const name = data && "name" in data ? data.name : "";

  return (
    <Panel id="blocked" title="Blocked members" headingRef={heading}>
      <p className="text-muted-ink">
        Blocked members can't send you requests or messages, and you don't appear in each other's search.
      </p>
      {busy ? (
        <p role="status" className="text-muted-ink">
          Unblocking {String(fetcher.formData?.get("name") ?? "")}…
        </p>
      ) : null}
      <Outcome data={data} success={`You unblocked ${name}.`} />
      {blocks.length === 0 ? (
        <p>You haven't blocked anyone.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-divider">
          {blocks.map((block) => (
            <BlockedRow
              key={block.member.id}
              block={block}
              onUnblock={() =>
                fetcher.submit(
                  { intent: "unblock", memberId: block.member.id, name: block.member.displayName },
                  { method: "post" },
                )
              }
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function BlockedRow({ block, onUnblock }: { block: BlockedMember; onUnblock: () => void }) {
  const name = block.member.displayName;
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <Avatar name={name} src={block.member.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1 basis-40">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-ink">Blocked {formatDate(block.blockedAt)}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary" size="sm">
            Unblock<span className="sr-only"> {name}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {name}?</AlertDialogTitle>
            <AlertDialogDescription>They'll be able to find you and send a request again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onUnblock}>Unblock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function AccountSection({ email }: { email: string }) {
  const { logout, pending, error } = useLogout();
  return (
    <Panel id="account" title="Account">
      <dl className="flex flex-col gap-1">
        <dt className="font-semibold">Email</dt>
        <dd>{email}</dd>
      </dl>
      <p className="text-sm text-muted-ink">Only you can see your email. It isn't shown to other members.</p>
      {error ? (
        <Notice tone="error" role="alert" title="You're still logged in">
          {error}
        </Notice>
      ) : null}
      <Button variant="secondary" className="self-start" aria-disabled={pending || undefined} onClick={() => void logout()}>
        {pending ? "Logging out…" : "Log out"}
      </Button>
    </Panel>
  );
}

function DeletionSection({ saved }: { saved: DeletionRequest | null }) {
  const fetcher = useFetcher<typeof clientAction>();
  const heading = useRef<HTMLHeadingElement>(null);
  const busy = fetcher.state !== "idle";
  const data = busy ? undefined : fetcher.data;
  const failure = data && !data.ok ? data : null;
  const received = (data && "deletion" in data ? data.deletion : null) ?? saved;
  // The dialog and its trigger are replaced by the receipt; move focus to the section.
  useEffect(() => {
    if (data?.ok) heading.current?.focus();
  }, [data]);

  return (
    <Panel id="delete-account" title="Delete account" headingRef={heading}>
      {received ? (
        <Notice tone="info" role="status" title={`Deletion request received on ${formatDate(received.requestedAt)}.`} />
      ) : (
        <>
          <p>You can ask us to delete your ConnectAbroad account.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="danger-outline" className="self-start">
                Request account deletion
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <fetcher.Form method="post" noValidate onSubmit={guardSubmit(busy)} className="flex flex-col gap-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Request account deletion?</AlertDialogTitle>
                  <AlertDialogDescription>
                    We'll stop showing your profile and process the deletion. Some records — such as reports you made or
                    that involve you — may be kept for safety reviews under a retention policy that hasn't been published
                    yet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <input type="hidden" name="intent" value="delete" />
                <ErrorSummary errors={failure?.fieldErrors ?? {}} labels={{ confirmation: "Confirmation" }} />
                <ActionError failure={failure} />
                <Field name="confirmation" label="Type DELETE to confirm" error={failure?.fieldErrors.confirmation}>
                  {(control) => (
                    <TextInput {...control} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
                  )}
                </Field>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <SubmitButton variant="danger" busy={busy} busyLabel="Sending request…">
                    Request deletion
                  </SubmitButton>
                </AlertDialogFooter>
              </fetcher.Form>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Panel>
  );
}

export function ErrorBoundary() {
  return (
    <AppContainer>
      <RouteErrorState />
    </AppContainer>
  );
}
