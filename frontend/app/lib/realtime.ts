// Realtime boundary. Writes always go through REST (persist-before-acknowledge, CSRF);
// the WebSocket at /ws only delivers server-authorized events for the signed-in member.
import type { Message } from "./types";

export type RealtimeStatus = "connecting" | "open" | "reconnecting" | "offline";

export type RealtimeEvent =
  | { type: "message.created"; message: Message }
  | { type: "conversation.updated"; conversationId: string }
  | { type: "connection.updated" }
  | { type: "notification.created" };

export interface Realtime {
  /** Starts the connection on first subscriber; returns an unsubscribe function. */
  subscribe(listener: (event: RealtimeEvent) => void): () => void;
  onStatus(listener: (status: RealtimeStatus) => void): () => void;
  status(): RealtimeStatus;
}

/** Minimal listener registry shared by the WebSocket and demo implementations. */
export function createRealtimeHub() {
  const eventListeners = new Set<(event: RealtimeEvent) => void>();
  const statusListeners = new Set<(status: RealtimeStatus) => void>();
  let current: RealtimeStatus = "connecting";
  return {
    eventListeners,
    emit(event: RealtimeEvent) {
      for (const listener of eventListeners) listener(event);
    },
    setStatus(next: RealtimeStatus) {
      if (next === current) return;
      current = next;
      for (const listener of statusListeners) listener(next);
    },
    status: () => current,
    onStatus(listener: (status: RealtimeStatus) => void) {
      statusListeners.add(listener);
      return () => {
        statusListeners.delete(listener);
      };
    },
  };
}

export function createWebSocketRealtime(path = "/ws"): Realtime {
  const hub = createRealtimeHub();
  let socket: WebSocket | null = null;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function connect() {
    if (typeof window === "undefined" || socket) return;
    if (!navigator.onLine) {
      hub.setStatus("offline");
      return;
    }
    const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${path}`;
    socket = new WebSocket(url);
    socket.onopen = () => {
      retry = 0;
      hub.setStatus("open");
    };
    socket.onmessage = (message) => {
      try {
        hub.emit(JSON.parse(String(message.data)) as RealtimeEvent);
      } catch {
        // Ignore malformed frames; REST refetch on reconnect fills any gap.
      }
    };
    socket.onclose = () => {
      socket = null;
      if (hub.eventListeners.size === 0) return;
      hub.setStatus(navigator.onLine ? "reconnecting" : "offline");
      const delay = Math.min(30_000, 1_000 * 2 ** retry++);
      clearTimeout(timer);
      timer = setTimeout(connect, delay);
    };
  }

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      if (hub.eventListeners.size > 0) {
        retry = 0;
        connect();
      }
    });
    window.addEventListener("offline", () => hub.setStatus("offline"));
  }

  return {
    subscribe(listener) {
      hub.eventListeners.add(listener);
      connect();
      return () => {
        hub.eventListeners.delete(listener);
        if (hub.eventListeners.size === 0) {
          clearTimeout(timer);
          socket?.close();
          socket = null;
        }
      };
    },
    onStatus: hub.onStatus,
    status: hub.status,
  };
}
