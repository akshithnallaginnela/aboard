import { MessageSquare } from "lucide-react";

export default function MessagesIndexRoute() {
  return (
    <div className="flex h-full min-h-96 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <MessageSquare aria-hidden="true" className="size-9 text-primary" />
      <h2 className="text-xl font-semibold">Choose a conversation</h2>
      <p className="max-w-sm text-muted-ink">Pick a connection on the left to read your messages or ask a thoughtful question.</p>
    </div>
  );
}
