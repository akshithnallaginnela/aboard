import type { LucideIcon } from "lucide-react";
import { MessageSquare, Shield, UserCheck, UserPlus } from "lucide-react";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types/notifications";
import { ActionError, EmptyState, Notice, RouteErrorState } from "~/components/feedback";
import { SubmitButton } from "~/components/form";
import { AppContainer, PageHeader } from "~/components/layout";
import { StatusLabel } from "~/components/member";
import { buttonVariants } from "~/components/ui/button";
import { actionFailure } from "~/lib/api";
import { formatRelative, plural } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { withSession } from "~/lib/session";
import type { NotificationKind } from "~/lib/types";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => privateMeta("Notifications");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return withSession(request, () => api.listNotifications());
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  if (form.get("intent") !== "mark-all") throw new Response("Unknown action", { status: 400 });
  try {
    await api.markAllNotificationsRead();
    return { ok: true as const };
  } catch (error) {
    return actionFailure(error);
  }
}

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  request_received: UserPlus,
  request_accepted: UserCheck,
  message_received: MessageSquare,
  report_update: Shield,
};

export default function NotificationsRoute({ loaderData }: Route.ComponentProps) {
  const { items, unreadCount } = loaderData;
  const fetcher = useFetcher<typeof clientAction>();
  const busy = fetcher.state !== "idle";
  const result = busy ? undefined : fetcher.data;
  const inactive = busy || unreadCount === 0;

  return (
    <AppContainer className="py-6 sm:py-8">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${plural(unreadCount, "new notification")}.` : undefined}
        actions={
          <>
            <Link to="/settings/privacy#notifications" className={buttonVariants({ variant: "quiet", size: "sm" })}>
              Notification settings
            </Link>
            {items.length > 0 ? (
              <fetcher.Form
                method="post"
                onSubmit={(event) => {
                  if (inactive) event.preventDefault();
                }}
              >
                <input type="hidden" name="intent" value="mark-all" />
                <SubmitButton
                  variant="secondary"
                  size="sm"
                  busy={busy}
                  busyLabel="Marking as read…"
                  aria-disabled={inactive || undefined}
                >
                  Mark all as read
                </SubmitButton>
              </fetcher.Form>
            ) : null}
          </>
        }
      />
      <div className="flex flex-col gap-4">
        {result?.ok ? (
          <Notice tone="success" role="status">
            All notifications are marked as read.
          </Notice>
        ) : null}
        <ActionError failure={result && !result.ok ? result : null} />
        {items.length === 0 ? (
          <EmptyState title="You're all caught up.">
            New connection requests, accepted requests, messages and updates on reports you made will appear here.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-divider overflow-hidden rounded-panel border border-divider bg-surface">
            {items.map((item) => {
              const Icon = KIND_ICONS[item.kind];
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    // Fire and forget: the destination matters more than the read marker.
                    onClick={() => {
                      if (!item.read) api.markNotificationRead(item.id).catch(() => {});
                    }}
                    className="flex min-h-11 items-start gap-3 p-4 hover:bg-canvas"
                  >
                    <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className={cn(!item.read && "font-semibold")}>{item.text}</span>
                      <span className="flex flex-wrap items-center gap-2 text-sm text-muted-ink">
                        {item.read ? null : <StatusLabel tone="attention">New</StatusLabel>}
                        <time dateTime={item.createdAt}>{formatRelative(item.createdAt)}</time>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

export function ErrorBoundary() {
  return (
    <AppContainer>
      <RouteErrorState />
    </AppContainer>
  );
}
