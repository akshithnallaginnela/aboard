// Domain types shared by the HTTP client, the demo backend and every screen.
// These are the frontend's expectations of the future Spring API (see README "API contract").
// Member-facing projections deliberately exclude email, phone, address and documents.

export type Journey = "preparing" | "living_abroad";
export type Role = "member" | "admin";

export const HELP_TOPICS = [
  "university-life",
  "housing-search",
  "first-weeks",
  "part-time-work",
  "banking-and-phone",
  "healthcare",
  "food-and-community",
  "career-start",
] as const;
export type HelpTopic = (typeof HELP_TOPICS)[number];

export interface Page<T> {
  items: T[];
  page: number; // 1-based
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ---------- Session / account ----------

export interface CurrentMember {
  id: string;
  /** Owner-only. Never rendered on member-facing surfaces. */
  email: string;
  displayName: string;
  role: Role;
  emailVerified: boolean;
  onboardingComplete: boolean;
  counts: { unreadNotifications: number; unreadMessages: number; pendingRequests: number };
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
  confirmAdult: boolean;
  acceptTerms: boolean;
}

/** Registration always answers the same way so it cannot reveal whether an email exists. */
export interface RegisterResult {
  status: "verification_sent";
}

export interface LoginInput {
  email: string;
  password: string;
}

// ---------- Profiles ----------

export interface OwnProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  journey: Journey | null;
  /** Destination country (preparing) or current country (living abroad). */
  country: string;
  city: string;
  hometown: string;
  college: string;
  community: string;
  languages: string[];
  helpTopics: HelpTopic[];
  lookingFor: string;
  bio: string;
  onboardingComplete: boolean;
}

export type ProfileUpdate = Partial<
  Pick<
    OwnProfile,
    | "displayName"
    | "journey"
    | "country"
    | "city"
    | "hometown"
    | "college"
    | "community"
    | "languages"
    | "helpTopics"
    | "lookingFor"
    | "bio"
  >
> & { completeOnboarding?: boolean };

/** Viewer-relative relationship. Blocks by the other member surface only as "not_available". */
export type ConnectionState =
  | { status: "self" }
  | { status: "none" }
  | { status: "paused" } // member is not accepting new requests right now
  | { status: "request_sent"; requestId: string }
  | { status: "request_received"; requestId: string }
  | { status: "connected"; conversationId: string }
  | { status: "not_available" } // declined earlier, deactivated, or otherwise unavailable
  | { status: "blocked_by_you" };

/** Safe projection for discovery rows and request lists. */
export interface MemberSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  journey: Journey;
  country: string;
  city: string;
  hometown: string;
  /** Server-computed, human-readable shared context, e.g. "You both listed Kaveri Valley College". */
  sharedContext: string[];
  helpTopics: HelpTopic[];
  lookingFor: string;
  connection: ConnectionState;
}

/** Full member-visible profile. Empty strings mean the member chose not to share. */
export interface MemberProfile extends MemberSummary {
  college: string;
  community: string;
  languages: string[];
  bio: string;
}

export type MemberRef = Pick<MemberSummary, "id" | "displayName" | "avatarUrl">;

// ---------- Discovery ----------

export interface MemberSearchQuery {
  q?: string;
  journey?: Journey;
  country?: string;
  topic?: HelpTopic;
  /** Only members who share at least one background attribute with the viewer. */
  shared?: boolean;
  page?: number;
}

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  count: number;
}

export interface DiscoveryFilterOptions {
  countries: FilterOption[];
  topics: FilterOption<HelpTopic>[];
}

// ---------- Connections ----------

export interface ConnectionRequest {
  id: string;
  direction: "received" | "sent";
  member: MemberSummary;
  introduction: string;
  status: "pending" | "declined";
  createdAt: string; // ISO 8601 UTC
}

export interface Connection {
  id: string;
  member: MemberSummary;
  connectedAt: string;
  conversationId: string;
}

// ---------- Messaging ----------

export interface Message {
  id: string;
  conversationId: string;
  /** Client-generated idempotency key echoed by the server; null for messages from others. */
  clientMessageId: string | null;
  senderId: string;
  body: string;
  sentAt: string;
}

export interface MessagePage {
  /** Oldest first. */
  items: Message[];
  hasMore: boolean;
}

export type ConversationRestriction = null | "blocked_by_you" | "unavailable";

export interface ConversationSummary {
  id: string;
  member: MemberRef;
  lastMessage: { body: string; sentAt: string; fromSelf: boolean } | null;
  unreadCount: number;
  restriction: ConversationRestriction;
}

export interface ConversationDetail {
  id: string;
  member: MemberRef;
  /** When set, history stays readable but new messages cannot be sent. */
  restriction: ConversationRestriction;
}

// ---------- Notifications ----------

export type NotificationKind = "request_received" | "request_accepted" | "message_received" | "report_update";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationList {
  items: AppNotification[];
  unreadCount: number;
}

// ---------- Safety ----------

export const REPORT_REASONS = [
  "harassment",
  "spam_scam",
  "impersonation",
  "inappropriate",
  "safety_concern",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export interface ReportInput {
  /** Idempotency key so a retried submission creates one case. */
  clientRequestId: string;
  memberId: string;
  /** Present when reporting one specific message. */
  messageId?: string;
  reason: ReportReason;
  details: string;
}

export interface ReportReceipt {
  id: string;
  receivedAt: string;
}

export interface BlockedMember {
  member: MemberRef;
  blockedAt: string;
}

export interface AccountSettings {
  email: string;
  discoverable: boolean;
  openToRequests: boolean;
  emailNotifications: { requests: boolean; messages: boolean };
  /** False until a real email delivery path exists; the UI must say so. */
  emailDeliveryAvailable: boolean;
  deletionRequest: DeletionRequest | null;
}

export type AccountSettingsUpdate = Partial<
  Pick<AccountSettings, "discoverable" | "openToRequests" | "emailNotifications">
>;

export interface DeletionRequest {
  requestedAt: string;
  status: "received";
}

// ---------- Moderation (admin only) ----------

export type ReportStatus = "open" | "in_review" | "resolved";
export type ReportSeverity = "urgent" | "standard";
export type ReportOutcome = "no_violation" | "warning_recorded" | "member_restricted";

export interface ReportSummary {
  id: string;
  reason: ReportReason;
  subjectType: "member" | "message";
  severity: ReportSeverity;
  status: ReportStatus;
  createdAt: string;
  reportedMember: MemberRef;
  assignee: MemberRef | null;
}

export interface ReportDetail extends ReportSummary {
  reporter: MemberRef;
  /** Reporter-provided text. */
  details: string;
  /** Only the specific reported message, never the wider conversation. */
  reportedMessage: { id: string; body: string; sentAt: string } | null;
  notes: { id: string; author: MemberRef; body: string; createdAt: string }[];
  history: { id: string; actor: MemberRef; action: string; createdAt: string }[];
  outcome: ReportOutcome | null;
}
