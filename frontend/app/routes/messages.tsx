import { useEffect } from "react";
import { Outlet, useParams, useRevalidator } from "react-router";

import type { Route } from "./+types/messages";
import { ConversationList } from "~/components/chat";
import { RouteErrorState } from "~/components/feedback";
import { privateMeta } from "~/lib/meta";
import { api, realtime } from "~/lib/runtime";
import { withSession } from "~/lib/session";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => privateMeta("Messages");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return withSession(request, async () => ({ conversations: await api.listConversations() }));
}

export default function MessagesRoute({ loaderData }: Route.ComponentProps) {
  const { conversationId } = useParams();
  const { revalidate } = useRevalidator();
  const Heading = conversationId ? "h2" : "h1";

  useEffect(
    () => realtime.subscribe(() => { void revalidate(); }),
    [revalidate],
  );

  return (
    <div className={cn("h-full min-h-0 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]", !conversationId && "min-h-96")}>
      <aside
        aria-label="Conversations"
        className={cn("min-h-0 overflow-y-auto border-divider bg-surface lg:border-r", conversationId && "hidden lg:block")}
      >
        <header className="px-5 py-6 sm:px-6 lg:px-4">
          <Heading tabIndex={-1} className="text-2xl font-semibold">Messages</Heading>
          <p className="mt-2 text-sm text-muted-ink">Conversations with your accepted connections.</p>
        </header>
        <ConversationList conversations={loaderData.conversations} />
      </aside>
      <section aria-label="Conversation" className={cn("h-full min-h-0 min-w-0", !conversationId && "hidden lg:block")}>
        <Outlet />
      </section>
    </div>
  );
}

export function ErrorBoundary() {
  return <div className="px-5 sm:px-6"><RouteErrorState /></div>;
}
