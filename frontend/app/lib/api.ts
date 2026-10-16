// Typed API boundary. Screens depend on the ConnectAbroadApi interface only.
// - createHttpApi(): real same-origin calls to the future Spring backend under /api.
// - app/lib/demo: an in-memory implementation used only in explicit demo builds.
// The active implementation is chosen at build time by ~/lib/runtime (see vite.config.ts).

import type {
  AccountSettings,
  AccountSettingsUpdate,
  BlockedMember,
  Connection,
  ConnectionRequest,
  ConversationDetail,
  ConversationSummary,
  CurrentMember,
  DeletionRequest,
  DiscoveryFilterOptions,
  LoginInput,
  MemberProfile,
  MemberSearchQuery,
  MemberSummary,
  Message,
  MessagePage,
  NotificationList,
  OwnProfile,
  Page,
  ProfileUpdate,
  RegisterInput,
  RegisterResult,
  ReportDetail,
  ReportInput,
  ReportOutcome,
  ReportReceipt,
  ReportStatus,
  ReportSummary,
} from "./types";

export interface ConnectAbroadApi {
  // Account access
  /** Returns null when not signed in (HTTP 401). */
  getSession(): Promise<CurrentMember | null>;
  register(input: RegisterInput): Promise<RegisterResult>;
  login(input: LoginInput): Promise<CurrentMember>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerification(email: string): Promise<void>;

  // Own profile
  getOwnProfile(): Promise<OwnProfile>;
  updateOwnProfile(update: ProfileUpdate): Promise<OwnProfile>;
  uploadAvatar(file: File): Promise<OwnProfile>;
  removeAvatar(): Promise<OwnProfile>;

  // Discovery
  getDiscoveryFilters(): Promise<DiscoveryFilterOptions>;
  searchMembers(query: MemberSearchQuery): Promise<Page<MemberSummary>>;
  getMember(memberId: string): Promise<MemberProfile>;

  // Connections
  listRequests(direction: "received" | "sent"): Promise<ConnectionRequest[]>;
  sendRequest(memberId: string, introduction: string): Promise<ConnectionRequest>;
  acceptRequest(requestId: string): Promise<Connection>;
  declineRequest(requestId: string): Promise<void>;
  cancelRequest(requestId: string): Promise<void>;
  listConnections(): Promise<Connection[]>;

  // Messaging (accepted connections only)
  listConversations(): Promise<ConversationSummary[]>;
  getConversation(conversationId: string): Promise<ConversationDetail>;
  /** `before` is a message id; returns the page of messages immediately older than it. */
  listMessages(conversationId: string, before?: string): Promise<MessagePage>;
  /** Idempotent on clientMessageId: retrying returns the already-persisted message. */
  sendMessage(conversationId: string, input: { clientMessageId: string; body: string }): Promise<Message>;
  markConversationRead(conversationId: string, lastMessageId: string): Promise<void>;

  // Notifications
  listNotifications(): Promise<NotificationList>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;

  // Safety and account
  createReport(input: ReportInput): Promise<ReportReceipt>;
  blockMember(memberId: string): Promise<void>;
  unblockMember(memberId: string): Promise<void>;
  listBlocks(): Promise<BlockedMember[]>;
  getAccountSettings(): Promise<AccountSettings>;
  updateAccountSettings(update: AccountSettingsUpdate): Promise<AccountSettings>;
  requestAccountDeletion(input: { confirmation: "DELETE"; reason?: string }): Promise<DeletionRequest>;

  // Moderation (server enforces the admin role)
  listReports(query: { status: ReportStatus; page?: number }): Promise<Page<ReportSummary>>;
  getReport(reportId: string): Promise<ReportDetail>;
  assignReportToMe(reportId: string): Promise<ReportDetail>;
  addReportNote(reportId: string, body: string): Promise<ReportDetail>;
  resolveReport(reportId: string, input: { outcome: ReportOutcome; note: string }): Promise<ReportDetail>;
}

// ---------- Errors ----------

export type ApiErrorKind =
  | "unavailable" // network failure, 502/503/504, or a non-API response (backend absent)
  | "unauthorized" // 401: signed out, session expired, or (on login) invalid credentials
  | "forbidden" // 403
  | "not_found" // 404 with an API body
  | "conflict" // 409
  | "validation" // 400/422 with field errors
  | "rate_limited" // 429
  | "server"; // other 5xx

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly code: string | null;
  readonly fieldErrors: Record<string, string>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number | null; code?: string | null; fieldErrors?: Record<string, string> } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const KIND_MESSAGES: Record<ApiErrorKind, string> = {
  unavailable:
    "ConnectAbroad's member service isn't reachable right now, so nothing was sent or saved. Check your connection and try again.",
  unauthorized: "Your session has ended. Log in again to continue — what you entered here is still on this page.",
  forbidden: "You don't have permission to do that.",
  not_found: "This isn't available. It may have been removed, or you may not have access to it.",
  conflict: "This changed since the page loaded. Refresh to see the latest state, then try again.",
  validation: "Some details need attention. Check the highlighted fields.",
  rate_limited: "Too many attempts in a short time. Wait a minute, then try again.",
  server: "Something went wrong on our side and your request may not have completed. Try again.",
};

/** User-facing copy for any thrown value. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) return error.message || KIND_MESSAGES[error.kind];
  return KIND_MESSAGES.server;
}

/** Serializable failure returned from clientActions so forms can keep their values. */
export interface ActionFailure {
  ok: false;
  kind: ApiErrorKind;
  message: string;
  fieldErrors: Record<string, string>;
}

export type ActionResult<T extends object = object> = ({ ok: true } & T) | ActionFailure;

export function actionFailure(error: unknown): ActionFailure {
  if (isApiError(error)) {
    return { ok: false, kind: error.kind, message: errorMessage(error), fieldErrors: error.fieldErrors };
  }
  return { ok: false, kind: "server", message: KIND_MESSAGES.server, fieldErrors: {} };
}

/** Client-side validation failure in the same shape as a server 400. */
export function validationFailure(fieldErrors: Record<string, string>): ActionFailure {
  return { ok: false, kind: "validation", message: KIND_MESSAGES.validation, fieldErrors };
}

// ---------- HTTP implementation ----------

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "X-XSRF-TOKEN";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

interface ProblemBody {
  code?: string;
  detail?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 400 || status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status === 502 || status === 503 || status === 504) return "unavailable";
  return "server";
}

export function createHttpApi(base = "/api"): ConnectAbroadApi {
  let csrfToken: string | null = null;

  async function ensureCsrf(): Promise<string | null> {
    const fromCookie = readCookie(CSRF_COOKIE);
    if (fromCookie) return fromCookie;
    if (csrfToken) return csrfToken;
    // Spring Security CSRF bootstrap: sets the XSRF-TOKEN cookie and returns the token.
    const body = await send<{ token: string }>("GET", "/auth/csrf");
    csrfToken = body.token;
    return readCookie(CSRF_COOKIE) ?? csrfToken;
  }

  async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    let payload: BodyInit | undefined;
    if (body instanceof FormData) {
      payload = body;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    if (method !== "GET" && method !== "HEAD") {
      const token = await ensureCsrf();
      if (token) headers[CSRF_HEADER] = token;
    }

    let response: Response;
    try {
      response = await fetch(`${base}${path}`, { method, headers, body: payload, credentials: "same-origin" });
    } catch {
      throw new ApiError("unavailable", KIND_MESSAGES.unavailable);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("json");

    if (response.ok) {
      if (response.status === 204) return undefined as T;
      // A static host answering /api with HTML means the backend is not deployed.
      if (!isJson) throw new ApiError("unavailable", KIND_MESSAGES.unavailable, { status: response.status });
      return (await response.json()) as T;
    }

    let problem: ProblemBody = {};
    if (isJson) {
      try {
        problem = (await response.json()) as ProblemBody;
      } catch {
        problem = {};
      }
    }
    // Without an API body, a 404/405 comes from a host with no backend behind /api.
    const kind =
      !isJson && (response.status === 404 || response.status === 405) ? "unavailable" : kindForStatus(response.status);
    if (response.status === 403 && problem.code === "csrf_invalid") csrfToken = null;
    throw new ApiError(kind, problem.detail ?? problem.message ?? KIND_MESSAGES[kind], {
      status: response.status,
      code: problem.code ?? null,
      fieldErrors: problem.fieldErrors ?? {},
    });
  }

  const get = <T>(path: string) => send<T>("GET", path);
  const post = <T>(path: string, body?: unknown) => send<T>("POST", path, body ?? {});
  const put = <T>(path: string, body: unknown) => send<T>("PUT", path, body);
  const patch = <T>(path: string, body: unknown) => send<T>("PATCH", path, body);
  const del = <T>(path: string) => send<T>("DELETE", path);
  const qs = (params: Record<string, string | number | boolean | undefined>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "" && value !== false) search.set(key, String(value));
    }
    const text = search.toString();
    return text ? `?${text}` : "";
  };
  const id = encodeURIComponent;

  return {
    async getSession() {
      try {
        return (await get<{ member: CurrentMember }>("/session")).member;
      } catch (error) {
        if (isApiError(error) && error.kind === "unauthorized") return null;
        throw error;
      }
    },
    register: (input) => post("/auth/register", input),
    login: async (input) => (await post<{ member: CurrentMember }>("/auth/login", input)).member,
    logout: () => post("/auth/logout"),
    requestPasswordReset: (email) => post("/auth/password-reset", { email }),
    resetPassword: (token, password) => post("/auth/password-reset/confirm", { token, password }),
    verifyEmail: (token) => post("/auth/verify-email", { token }),
    resendVerification: (email) => post("/auth/verify-email/resend", { email }),

    getOwnProfile: () => get("/me/profile"),
    updateOwnProfile: (update) => patch("/me/profile", update),
    uploadAvatar: (file) => {
      const form = new FormData();
      form.set("file", file);
      return send("PUT", "/me/avatar", form);
    },
    removeAvatar: () => del("/me/avatar"),

    getDiscoveryFilters: () => get("/members/filters"),
    searchMembers: (query) =>
      get(
        `/members${qs({
          q: query.q,
          journey: query.journey,
          country: query.country,
          topic: query.topic,
          shared: query.shared,
          page: query.page,
        })}`,
      ),
    getMember: (memberId) => get(`/members/${id(memberId)}`),

    listRequests: async (direction) =>
      (await get<{ items: ConnectionRequest[] }>(`/connections/requests${qs({ direction })}`)).items,
    sendRequest: (memberId, introduction) => post("/connections/requests", { recipientId: memberId, introduction }),
    acceptRequest: (requestId) => post(`/connections/requests/${id(requestId)}/accept`),
    declineRequest: (requestId) => post(`/connections/requests/${id(requestId)}/decline`),
    cancelRequest: (requestId) => post(`/connections/requests/${id(requestId)}/cancel`),
    listConnections: async () => (await get<{ items: Connection[] }>("/connections")).items,

    listConversations: async () => (await get<{ items: ConversationSummary[] }>("/conversations")).items,
    getConversation: (conversationId) => get(`/conversations/${id(conversationId)}`),
    listMessages: (conversationId, before) =>
      get(`/conversations/${id(conversationId)}/messages${qs({ before, limit: 30 })}`),
    sendMessage: (conversationId, input) => post<Message>(`/conversations/${id(conversationId)}/messages`, input),
    markConversationRead: (conversationId, lastMessageId) =>
      post(`/conversations/${id(conversationId)}/read`, { lastMessageId }),

    listNotifications: () => get("/notifications"),
    markNotificationRead: (notificationId) => post(`/notifications/${id(notificationId)}/read`),
    markAllNotificationsRead: () => post("/notifications/read-all"),

    createReport: (input) => post("/reports", input),
    blockMember: (memberId) => post("/blocks", { memberId }),
    unblockMember: (memberId) => del(`/blocks/${id(memberId)}`),
    listBlocks: async () => (await get<{ items: BlockedMember[] }>("/blocks")).items,
    getAccountSettings: () => get("/me/settings"),
    updateAccountSettings: (update) => put("/me/settings", update),
    requestAccountDeletion: (input) => post("/me/deletion-request", input),

    listReports: (query) => get(`/admin/reports${qs({ status: query.status, page: query.page })}`),
    getReport: (reportId) => get(`/admin/reports/${id(reportId)}`),
    assignReportToMe: (reportId) => post(`/admin/reports/${id(reportId)}/assign`, { assignee: "me" }),
    addReportNote: (reportId, body) => post(`/admin/reports/${id(reportId)}/notes`, { body }),
    resolveReport: (reportId, input) => post(`/admin/reports/${id(reportId)}/resolve`, input),
  };
}
