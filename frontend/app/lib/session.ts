import { useState, useSyncExternalStore } from "react";
import { redirect, useNavigate } from "react-router";

import { errorMessage, isApiError } from "./api";
import { api } from "~/lib/runtime";
import type { CurrentMember } from "./types";

// In-memory session snapshot for UI only. The server session cookie is the real authority.
let current: CurrentMember | null = null;
const listeners = new Set<() => void>();

export const sessionStore = {
  get: () => current,
  set(member: CurrentMember | null) {
    current = member;
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Current member if this tab already loaded the session; null during prerender/hydration. */
export function useSessionMember(): CurrentMember | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
}

/** Only same-site relative paths are accepted as post-login destinations. */
export function safeNext(value: string | null | undefined, fallback = "/people"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

export function loginRedirect(request: Request, reason?: "expired"): string {
  const url = new URL(request.url);
  const params = new URLSearchParams({ next: url.pathname + url.search });
  if (reason) params.set("reason", reason);
  return `/login?${params.toString()}`;
}

/** For app clientLoaders. Redirects to login on 401; other failures reach the route ErrorBoundary. */
export async function requireMember(request: Request): Promise<CurrentMember> {
  const member = await api.getSession();
  if (!member) {
    const hadSession = sessionStore.get() !== null;
    sessionStore.set(null);
    throw redirect(loginRedirect(request, hadSession ? "expired" : undefined));
  }
  sessionStore.set(member);
  return member;
}

/** Wraps loader API calls: a 401 mid-session becomes a redirect to login with reason=expired. */
export async function withSession<T>(request: Request, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (isApiError(error) && error.kind === "unauthorized") {
      sessionStore.set(null);
      throw redirect(loginRedirect(request, "expired"));
    }
    throw error;
  }
}

export function useLogout() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await api.logout();
      sessionStore.set(null);
      navigate("/login?reason=signed_out");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  }

  return { logout, pending, error };
}
