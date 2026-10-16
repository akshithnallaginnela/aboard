import { ApiError, type ConnectAbroadApi } from "../api";
import { createRealtimeHub, type Realtime } from "../realtime";
import { HELP_TOPICS, REPORT_REASONS, type AccountSettings, type Connection, type ConnectionRequest, type ConnectionState, type CurrentMember, type MemberProfile, type MemberRef, type Message, type OwnProfile, type Page, type ReportDetail } from "../types";
export const DEMO_PASSWORD = "DemoOnly123!";
export const DEMO_PERSONAS = { member: "demo-asha", helper: "demo-mira", new: "demo-new", admin: "demo-admin" } as const;
export type DemoPersona = keyof typeof DEMO_PERSONAS;
export type DemoScenario = "normal" | "empty" | "unavailable" | "send_failure";
interface Person {
    profile: OwnProfile;
    email: string;
    password: string;
    verified: boolean;
    role: "member" | "admin";
    settings: AccountSettings;
}
interface RequestRecord {
    id: string;
    from: string;
    to: string;
    introduction: string;
    status: "pending" | "declined";
    createdAt: string;
}
interface Thread {
    id: string;
    participants: [
        string,
        string
    ];
    connectedAt: string;
    messages: Message[];
    read: Record<string, string | undefined>;
}
type Notification = Awaited<ReturnType<ConnectAbroadApi["listNotifications"]>>["items"][number];
const copy = <T,>(value: T): T => structuredClone(value);
const BASE_DATE = "2026-10-16T08:00:00.000Z";
/** Isolated, synthetic backend. Nothing is stored, sent over the network, or shared between tabs. */
export function createDemoRuntime(now: () => number = Date.now) {
    let people: Person[] = [];
    let requests: RequestRecord[] = [];
    let threads: Thread[] = [];
    let notifications: Record<string, Notification[]> = {};
    let blocks: {
        from: string;
        to: string;
        at: string;
    }[] = [];
    let reports: ReportDetail[] = [];
    let reportKeys = new Map<string, {
        input: string;
        id: string;
    }>();
    let tokens = new Map<string, {
        memberId: string;
        kind: "verify" | "reset";
        expires: number;
    }>();
    let latestLink: string | null = null;
    let actor: string | null = null;
    let expires = 0;
    let sequence = 0;
    let scenario: DemoScenario = "normal";
    let version = 0;
    const listeners = new Set<() => void>();
    const hub = createRealtimeHub();
    const changed = () => { version++; for (const listener of listeners)
        listener(); };
    const stamp = () => new Date(now()).toISOString();
    const id = (prefix: string) => `demo-${prefix}-${++sequence}`;
    function fail(kind: ConstructorParameters<typeof ApiError>[0], message: string, fieldErrors?: Record<string, string>): never {
        throw new ApiError(kind, message, { fieldErrors });
    }
    const person = (memberId: string) => people.find((p) => p.profile.id === memberId) ?? fail("not_found", "This demo member is not available.");
    function active() {
        if (scenario === "unavailable")
            fail("unavailable", "Demo scenario: the service is unavailable. Choose Normal in the demo controls to recover.");
        if (!actor || expires <= now()) {
            actor = null;
            fail("unauthorized", "Your demo session has ended. Enter a demo persona again.");
        }
        return person(actor);
    }
    function admin() { const member = active(); if (member.role !== "admin")
        fail("forbidden", "Only the demo moderator can open reports."); return member; }
    const ref = (memberId: string): MemberRef => { const p = person(memberId).profile; return { id: p.id, displayName: p.displayName, avatarUrl: p.avatarUrl }; };
    const blocked = (a: string, b: string) => blocks.some((v) => (v.from === a && v.to === b) || (v.from === b && v.to === a));
    const threadFor = (a: string, b: string) => threads.find((t) => t.participants.includes(a) && t.participants.includes(b));
    function shared(a: OwnProfile, b: OwnProfile) {
        return (["college", "hometown", "community"] as const).flatMap((key) => a[key] && a[key] === b[key] ? [`You both listed ${a[key]}`] : []);
    }
    function connection(viewer: string, memberId: string): ConnectionState {
        if (viewer === memberId)
            return { status: "self" };
        if (blocks.some((b) => b.from === viewer && b.to === memberId))
            return { status: "blocked_by_you" };
        if (blocked(viewer, memberId))
            return { status: "not_available" };
        const thread = threadFor(viewer, memberId);
        if (thread)
            return { status: "connected", conversationId: thread.id };
        const request = requests.find((r) => (r.from === viewer && r.to === memberId) || (r.from === memberId && r.to === viewer));
        if (request?.status === "declined")
            return { status: "not_available" };
        if (request)
            return { status: request.from === viewer ? "request_sent" : "request_received", requestId: request.id };
        return { status: person(memberId).settings.openToRequests ? "none" : "paused" };
    }
    function projection(memberId: string, viewer: string): MemberProfile {
        const p = person(memberId).profile;
        // Explicit projection: owner-only email/settings never reach discovery or peer profiles.
        return copy({ id: p.id, displayName: p.displayName, avatarUrl: p.avatarUrl, journey: p.journey ?? "preparing", country: p.country, city: p.city, hometown: p.hometown, sharedContext: shared(person(viewer).profile, p), helpTopics: p.helpTopics, lookingFor: p.lookingFor, connection: connection(viewer, memberId), college: p.college, community: p.community, languages: p.languages, bio: p.bio });
    }
    function page<T>(items: T[], number = 1): Page<T> {
        if (!Number.isInteger(number) || number < 1)
            fail("validation", "Choose a valid page.");
        return { items: copy(items.slice((number - 1) * 6, number * 6)), page: number, pageSize: 6, totalItems: items.length, totalPages: Math.ceil(items.length / 6) };
    }
    function threadAccess(conversationId: string) {
        const member = active().profile.id;
        const thread = threads.find((t) => t.id === conversationId && t.participants.includes(member)) ?? fail("not_found", "This conversation is not available to this demo persona.");
        const other = thread.participants.find((p) => p !== member)!;
        const restriction = blocks.some((b) => b.from === member && b.to === other) ? "blocked_by_you" as const : blocked(member, other) ? "unavailable" as const : null;
        return { thread, member, other, restriction };
    }
    function notify(memberId: string, notification: Omit<Notification, "id" | "createdAt" | "read">) {
        (notifications[memberId] ??= []).unshift({ ...notification, id: id("notification"), createdAt: stamp(), read: false });
        if (actor === memberId)
            hub.emit({ type: "notification.created" });
    }
    function current(): CurrentMember {
        const p = active();
        const memberId = p.profile.id;
        return { id: memberId, email: p.email, displayName: p.profile.displayName, role: p.role, emailVerified: p.verified, onboardingComplete: p.profile.onboardingComplete, counts: { unreadNotifications: (notifications[memberId] ?? []).filter((n) => !n.read).length, unreadMessages: threads.filter((t) => t.participants.includes(memberId)).reduce((n, t) => n + unread(t, memberId), 0), pendingRequests: requests.filter((r) => r.to === memberId && r.status === "pending" && !blocked(r.from, memberId)).length } };
    }
    function unread(thread: Thread, memberId: string) {
        const readIndex = thread.messages.findIndex((m) => m.id === thread.read[memberId]);
        return thread.messages.slice(readIndex + 1).filter((m) => m.senderId !== memberId).length;
    }
    function requestView(request: RequestRecord, viewer: string): ConnectionRequest {
        return { id: request.id, direction: request.from === viewer ? "sent" : "received", member: projection(request.from === viewer ? request.to : request.from, viewer), introduction: request.introduction, status: request.status, createdAt: request.createdAt };
    }
    function connectionView(thread: Thread, viewer: string): Connection {
        return { id: thread.id, member: projection(thread.participants.find((p) => p !== viewer)!, viewer), connectedAt: thread.connectedAt, conversationId: thread.id };
    }
    function validText(value: string, field: string, max: number, min = 1) {
        if (typeof value !== "string" || value.trim().length < min || value.length > max)
            fail("validation", `Check ${field}.`, { [field]: `Use ${min}–${max} characters.` });
        return value.trim();
    }
    function email(value: string) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        fail("validation", "Enter a valid email.", { email: "Enter a valid email address." }); return value.trim().toLowerCase(); }
    function tokenFor(memberId: string, kind: "verify" | "reset") {
        for (const [key, token] of tokens)
            if (token.memberId === memberId && token.kind === kind)
                tokens.delete(key);
        const key = id(`${kind}-token`);
        tokens.set(key, { memberId, kind, expires: now() + 30 * 60000 });
        latestLink = `/${kind === "verify" ? "verify-email" : "reset-password"}?token=${key}`;
        changed();
    }
    function consumeToken(key: string, kind: "verify" | "reset") {
        const token = tokens.get(key);
        if (!token || token.kind !== kind || token.expires <= now())
            fail("validation", "This synthetic link has expired or was already used.");
        tokens.delete(key);
        latestLink = null;
        changed();
        return person(token.memberId);
    }
    function reportAccess(reportId: string) { admin(); return reports.find((r) => r.id === reportId) ?? fail("not_found", "This demo report does not exist."); }
    function audit(report: ReportDetail, action: string) { report.history.push({ id: id("audit"), actor: ref(active().profile.id), action, createdAt: stamp() }); }
    function seed() {
        sequence = 0;
        actor = null;
        expires = 0;
        scenario = "normal";
        latestLink = null;
        tokens = new Map();
        reportKeys = new Map();
        blocks = [];
        notifications = {};
        const seeds = [
            ["asha", "Asha Rao", "preparing", "United Kingdom", "Manchester"],
            ["mira", "Mira Sen", "living_abroad", "United Kingdom", "Manchester"],
            ["leo", "Leo Martin", "preparing", "United Kingdom", "Manchester"],
            ["noor", "Noor Ali", "living_abroad", "Germany", "Berlin"],
            ["priya", "Priya Das", "living_abroad", "Ireland", "Dublin"],
            ["ben", "Ben Clarke", "living_abroad", "Canada", "Toronto"],
            ["lina", "Lina Chen", "preparing", "Germany", "Berlin"],
            ["sam", "Sam Patel", "living_abroad", "United Kingdom", "Leeds"],
            ["new", "New Demo Member", null, "", ""],
            ["admin", "Demo Moderator", "living_abroad", "United Kingdom", "Manchester"],
        ] as const;
        people = seeds.map(([key, displayName, journey, country, city]) => {
            const own: OwnProfile = { id: `demo-${key}`, displayName, avatarUrl: null, journey, country, city, hometown: key === "ben" ? "Bristol" : "Mysuru", college: "Kaveri Valley College (fictional)", community: "Synthetic founding cohort", languages: ["English"], helpTopics: ["first-weeks", "food-and-community"], lookingFor: journey === "living_abroad" ? "Happy to share my first-week experiences." : "Looking for practical settling-in perspectives.", bio: "Synthetic demonstration profile. This person and their experiences are fictional.", onboardingComplete: key !== "new" };
            return { profile: own, email: `${key === "asha" ? "asha" : key}@example.test`, password: DEMO_PASSWORD, verified: true, role: key === "admin" ? "admin" : "member", settings: { email: `${key}@example.test`, discoverable: key !== "admin" && key !== "new", openToRequests: key !== "sam", emailNotifications: { requests: false, messages: false }, emailDeliveryAvailable: false, deletionRequest: null } };
        });
        requests = [{ id: "demo-request-leo", from: "demo-leo", to: "demo-asha", introduction: "We share a hometown. Would you like to compare first-week questions?", status: "pending", createdAt: BASE_DATE }];
        threads = [{ id: "demo-conversation-mira", participants: ["demo-asha", "demo-mira"], connectedAt: BASE_DATE, read: {}, messages: [
                    { id: "demo-message-1", conversationId: "demo-conversation-mira", clientMessageId: null, senderId: "demo-asha", body: "Hi Mira, what helped you feel settled during your first week?", sentAt: BASE_DATE },
                    { id: "demo-message-2", conversationId: "demo-conversation-mira", clientMessageId: null, senderId: "demo-mira", body: "For me, a campus walking tour and meeting the community society helped. What would you like to know?", sentAt: "2026-10-16T08:02:00.000Z" },
                ] }];
        notifications["demo-asha"] = [{ id: "demo-notification-1", kind: "request_received", text: "Leo sent you a connection request.", href: "/connections", createdAt: BASE_DATE, read: false }];
        reports = [{ id: "demo-report-1", reason: "spam_scam", subjectType: "member", severity: "standard", status: "open", createdAt: BASE_DATE, reportedMember: ref("demo-noor"), assignee: null, reporter: ref("demo-leo"), details: "Synthetic moderation exercise: review a reported unsolicited promotional request. No real person is involved.", reportedMessage: null, notes: [], history: [], outcome: null }];
        hub.setStatus("open");
        changed();
    }
    seed();
    const api: ConnectAbroadApi = {
        async getSession() { if (!actor || expires <= now()) {
            actor = null;
            return null;
        } return copy(current()); },
        async register(input) {
            const address = email(input.email);
            validText(input.displayName, "displayName", 80);
            validText(input.password, "password", 128, 10);
            if (!input.confirmAdult || !input.acceptTerms)
                fail("validation", "Confirm the adult-only policy and terms.");
            if (!people.some((p) => p.email === address)) {
                const p = copy(person("demo-new"));
                p.profile.id = id("member");
                p.profile.displayName = input.displayName.trim();
                p.email = address;
                p.settings.email = address;
                p.password = input.password;
                p.verified = false;
                people.push(p);
                tokenFor(p.profile.id, "verify");
            }
            return { status: "verification_sent" };
        },
        async login(input) {
            if (scenario === "unavailable")
                fail("unavailable", "Demo service unavailable. Choose Normal to recover.");
            const p = people.find((v) => v.email === input.email.trim().toLowerCase() && v.password === input.password);
            if (!p)
                fail("unauthorized", "Email or password is incorrect.");
            if (!p.verified)
                throw new ApiError("forbidden", "Confirm your demo email first.", { code: "email_unverified" });
            actor = p.profile.id;
            expires = now() + 60 * 60000;
            changed();
            return copy(current());
        },
        async logout() { actor = null; expires = 0; changed(); },
        async requestPasswordReset(address) { const p = people.find((v) => v.email === email(address)); if (p)
            tokenFor(p.profile.id, "reset"); },
        async resetPassword(token, password) { validText(password, "password", 128, 10); const p = consumeToken(token, "reset"); p.password = password; if (actor === p.profile.id)
            actor = null; },
        async verifyEmail(token) { consumeToken(token, "verify").verified = true; },
        async resendVerification(address) { const p = people.find((v) => v.email === email(address) && !v.verified); if (p)
            tokenFor(p.profile.id, "verify"); },
        async getOwnProfile() { return copy(active().profile); },
        async updateOwnProfile(update) {
            const p = active();
            const next = { ...p.profile };
            for (const key of ["displayName", "country", "city", "hometown", "college", "community", "lookingFor", "bio"] as const)
                if (update[key] !== undefined) {
                    validText(update[key], key, key === "bio" ? 1500 : 300, key === "displayName" ? 1 : 0);
                    next[key] = update[key].trim();
                }
            if (update.journey !== undefined) {
                if (update.journey !== "preparing" && update.journey !== "living_abroad")
                    fail("validation", "Choose your journey.", { journey: "Choose your journey." });
                next.journey = update.journey;
            }
            if (update.languages) {
                if (update.languages.length > 10 || update.languages.some((v) => typeof v !== "string" || v.length > 40))
                    fail("validation", "Check the language list.");
                next.languages = [...new Set(update.languages.map((v) => v.trim()).filter(Boolean))];
            }
            if (update.helpTopics) {
                if (update.helpTopics.some((v) => !HELP_TOPICS.includes(v)))
                    fail("validation", "Choose supported topics.");
                next.helpTopics = [...new Set(update.helpTopics)];
            }
            if (update.completeOnboarding) {
                if (!next.journey || !next.country || !next.lookingFor || !next.helpTopics.length)
                    fail("validation", "Complete your journey, country, topics and connection goal.");
                next.onboardingComplete = true;
                p.settings.discoverable = true;
            }
            p.profile = next;
            changed();
            return copy(next);
        },
        async uploadAvatar(file) {
            const p = active();
            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024 || !file.size)
                fail("validation", "Use a PNG, JPEG or WebP up to 2 MB.");
            p.profile.avatarUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new ApiError("validation", "The photo could not be read.")); reader.readAsDataURL(file); });
            return copy(p.profile);
        },
        async removeAvatar() { const p = active(); p.profile.avatarUrl = null; return copy(p.profile); },
        async getDiscoveryFilters() {
            const viewer = active().profile.id;
            const visible = people.filter((p) => p.profile.id !== viewer && p.profile.onboardingComplete && p.settings.discoverable && !blocked(viewer, p.profile.id));
            return { countries: [...new Set(visible.map((p) => p.profile.country))].sort().map((country) => ({ value: country, label: country, count: visible.filter((p) => p.profile.country === country).length })), topics: HELP_TOPICS.map((topic) => ({ value: topic, label: topic.replaceAll("-", " "), count: visible.filter((p) => p.profile.helpTopics.includes(topic)).length })) };
        },
        async searchMembers(query) {
            const viewer = active().profile.id;
            const q = query.q?.trim().toLowerCase();
            const visible = scenario === "empty" ? [] : people.filter((p) => p.profile.id !== viewer && p.profile.onboardingComplete && p.settings.discoverable && !blocked(viewer, p.profile.id)).map((p) => projection(p.profile.id, viewer));
            return page(visible.filter((p) => (!q || [p.displayName, p.city, p.college, p.hometown, p.country].some((v) => v.toLowerCase().includes(q))) && (!query.journey || p.journey === query.journey) && (!query.country || p.country === query.country) && (!query.topic || p.helpTopics.includes(query.topic)) && (!query.shared || p.sharedContext.length > 0)), query.page);
        },
        async getMember(memberId) { const viewer = active().profile.id; const p = person(memberId); if (memberId !== viewer && (blocked(viewer, memberId) || !p.settings.discoverable || !p.profile.onboardingComplete))
            fail("not_found", "This profile is not available."); return projection(memberId, viewer); },
        async listRequests(direction) { const viewer = active().profile.id; return copy(requests.filter((r) => (direction === "received" ? r.to === viewer : r.from === viewer) && !blocked(r.from, r.to)).map((r) => requestView(r, viewer))); },
        async sendRequest(memberId, introduction) {
            const viewer = active().profile.id;
            validText(introduction, "introduction", 600, 10);
            if (connection(viewer, memberId).status !== "none" || !person(memberId).settings.discoverable)
                fail("conflict", "A new request is not available for this member.");
            const r: RequestRecord = { id: id("request"), from: viewer, to: memberId, introduction: introduction.trim(), status: "pending", createdAt: stamp() };
            requests.push(r);
            notify(memberId, { kind: "request_received", text: `${ref(viewer).displayName} sent a connection request.`, href: "/connections" });
            hub.emit({ type: "connection.updated" });
            return copy(requestView(r, viewer));
        },
        async acceptRequest(requestId) {
            const viewer = active().profile.id;
            const r = requests.find((v) => v.id === requestId && v.to === viewer) ?? fail("not_found", "This request is not yours to accept.");
            if (r.status !== "pending" || blocked(r.from, r.to))
                fail("conflict", "This request is no longer available.");
            const t: Thread = { id: id("conversation"), participants: [r.from, r.to], connectedAt: stamp(), messages: [], read: {} };
            threads.push(t);
            requests = requests.filter((v) => v !== r);
            notify(r.from, { kind: "request_accepted", text: `${ref(viewer).displayName} accepted your request.`, href: `/messages/${t.id}` });
            hub.emit({ type: "connection.updated" });
            return copy(connectionView(t, viewer));
        },
        async declineRequest(requestId) { const viewer = active().profile.id; const r = requests.find((v) => v.id === requestId && v.to === viewer && v.status === "pending") ?? fail("not_found", "This request is not yours to decline."); r.status = "declined"; hub.emit({ type: "connection.updated" }); },
        async cancelRequest(requestId) { const viewer = active().profile.id; const r = requests.find((v) => v.id === requestId && v.from === viewer && v.status === "pending") ?? fail("not_found", "This request is not yours to cancel."); requests = requests.filter((v) => v !== r); hub.emit({ type: "connection.updated" }); },
        async listConnections() { const viewer = active().profile.id; return copy(threads.filter((t) => t.participants.includes(viewer) && !blocked(...t.participants)).map((t) => connectionView(t, viewer))); },
        async listConversations() { const viewer = active().profile.id; return copy(threads.filter((t) => t.participants.includes(viewer)).map((t) => { const { other, restriction } = threadAccess(t.id); const last = t.messages.at(-1); return { id: t.id, member: ref(other), restriction, unreadCount: unread(t, viewer), lastMessage: last ? { body: last.body, sentAt: last.sentAt, fromSelf: last.senderId === viewer } : null }; })); },
        async getConversation(conversationId) { const { other, restriction } = threadAccess(conversationId); return copy({ id: conversationId, member: ref(other), restriction }); },
        async listMessages(conversationId, before) { const { thread, member } = threadAccess(conversationId); const end = before ? thread.messages.findIndex((m) => m.id === before) : thread.messages.length; if (end < 0)
            fail("not_found", "That message cursor is not in this conversation."); const start = Math.max(0, end - 20); return { items: copy(thread.messages.slice(start, end).map((m) => ({ ...m, clientMessageId: m.senderId === member ? m.clientMessageId : null }))), hasMore: start > 0 }; },
        async sendMessage(conversationId, input) {
            const { thread, member, other, restriction } = threadAccess(conversationId);
            validText(input.clientMessageId, "clientMessageId", 128);
            const body = validText(input.body, "body", 4000);
            const prior = thread.messages.find((m) => m.senderId === member && m.clientMessageId === input.clientMessageId);
            if (prior) {
                if (prior.body !== body)
                    fail("conflict", "This message key was already used for different text.");
                return copy(prior);
            }
            if (restriction)
                fail("forbidden", "This conversation is read-only. New messages are blocked.");
            if (scenario === "send_failure") {
                scenario = "normal";
                changed();
                fail("unavailable", "Demo: this message was not sent. Retry to send it once.");
            }
            const message: Message = { id: id("message"), conversationId, clientMessageId: input.clientMessageId, senderId: member, body, sentAt: stamp() };
            thread.messages.push(message);
            thread.read[member] = message.id;
            notify(other, { kind: "message_received", text: `${ref(member).displayName} sent a message.`, href: `/messages/${conversationId}` });
            hub.emit({ type: "message.created", message: copy(message) });
            return copy(message);
        },
        async markConversationRead(conversationId, lastMessageId) { const { thread, member } = threadAccess(conversationId); if (!thread.messages.some((m) => m.id === lastMessageId))
            fail("not_found", "This message is not in the conversation."); thread.read[member] = lastMessageId; },
        async listNotifications() { const values = notifications[active().profile.id] ?? []; return copy({ items: values, unreadCount: values.filter((n) => !n.read).length }); },
        async markNotificationRead(notificationId) { const n = (notifications[active().profile.id] ?? []).find((v) => v.id === notificationId) ?? fail("not_found", "This notification is not yours."); n.read = true; },
        async markAllNotificationsRead() { for (const n of notifications[active().profile.id] ?? [])
            n.read = true; },
        async createReport(input) {
            const viewer = active().profile.id;
            person(input.memberId);
            if (viewer === input.memberId)
                fail("validation", "You cannot report yourself.");
            validText(input.clientRequestId, "clientRequestId", 128);
            if (!REPORT_REASONS.includes(input.reason))
                fail("validation", "Choose a report reason.");
            validText(input.details, "details", 3000, 0);
            const key = `${viewer}:${input.clientRequestId}`;
            const serialized = JSON.stringify(input);
            const prior = reportKeys.get(key);
            if (prior) {
                if (prior.input !== serialized)
                    fail("conflict", "This report key was already used for different details.");
                const report = reports.find((r) => r.id === prior.id)!;
                return { id: report.id, receivedAt: report.createdAt };
            }
            const message = input.messageId ? threads.filter((t) => t.participants.includes(viewer)).flatMap((t) => t.messages).find((m) => m.id === input.messageId && m.senderId === input.memberId) : null;
            if (input.messageId && !message)
                fail("not_found", "Only a message visible to you from the reported member can be included.");
            const report: ReportDetail = { id: id("report"), reason: input.reason, subjectType: message ? "message" : "member", severity: input.reason === "safety_concern" ? "urgent" : "standard", status: "open", createdAt: stamp(), reportedMember: ref(input.memberId), assignee: null, reporter: ref(viewer), details: input.details, reportedMessage: message ? { id: message.id, body: message.body, sentAt: message.sentAt } : null, notes: [], history: [], outcome: null };
            reports.push(report);
            reportKeys.set(key, { input: serialized, id: report.id });
            return { id: report.id, receivedAt: report.createdAt };
        },
        async blockMember(memberId) { const viewer = active().profile.id; person(memberId); if (viewer === memberId)
            fail("validation", "You cannot block yourself."); if (!blocks.some((v) => v.from === viewer && v.to === memberId))
            blocks.push({ from: viewer, to: memberId, at: stamp() }); requests = requests.filter((r) => !((r.from === viewer && r.to === memberId) || (r.from === memberId && r.to === viewer))); hub.emit({ type: "connection.updated" }); const t = threadFor(viewer, memberId); if (t)
            hub.emit({ type: "conversation.updated", conversationId: t.id }); },
        async unblockMember(memberId) { const viewer = active().profile.id; blocks = blocks.filter((v) => !(v.from === viewer && v.to === memberId)); hub.emit({ type: "connection.updated" }); },
        async listBlocks() { const viewer = active().profile.id; return copy(blocks.filter((b) => b.from === viewer).map((b) => ({ member: ref(b.to), blockedAt: b.at }))); },
        async getAccountSettings() { return copy(active().settings); },
        async updateAccountSettings(update) { const p = active(); for (const key of ["discoverable", "openToRequests"] as const)
            if (update[key] !== undefined) {
                if (typeof update[key] !== "boolean")
                    fail("validation", "Choose a valid privacy setting.");
                p.settings[key] = update[key];
            } if (update.emailNotifications) {
            if (typeof update.emailNotifications.requests !== "boolean" || typeof update.emailNotifications.messages !== "boolean")
                fail("validation", "Choose valid notification preferences.");
            p.settings.emailNotifications = copy(update.emailNotifications);
        } return copy(p.settings); },
        async requestAccountDeletion(input) { const p = active(); if (input.confirmation !== "DELETE")
            fail("validation", "Type DELETE to confirm."); p.settings.deletionRequest ??= { requestedAt: stamp(), status: "received" }; return copy(p.settings.deletionRequest); },
        async listReports(query) { admin(); return page(reports.filter((r) => r.status === query.status).map(({ reporter: _reporter, details: _details, reportedMessage: _message, notes: _notes, history: _history, outcome: _outcome, ...summary }) => summary), query.page); },
        async getReport(reportId) { return copy(reportAccess(reportId)); },
        async assignReportToMe(reportId) { const r = reportAccess(reportId); if (r.status === "resolved")
            fail("conflict", "This report is already resolved."); r.assignee = ref(active().profile.id); r.status = "in_review"; audit(r, "Assigned to moderator"); return copy(r); },
        async addReportNote(reportId, body) { const r = reportAccess(reportId); r.notes.push({ id: id("note"), author: ref(active().profile.id), body: validText(body, "note", 3000), createdAt: stamp() }); audit(r, "Internal note added"); return copy(r); },
        async resolveReport(reportId, input) { const r = reportAccess(reportId); if (r.status === "resolved")
            fail("conflict", "This report is already resolved."); if (!["no_violation", "warning_recorded", "member_restricted"].includes(input.outcome))
            fail("validation", "Choose a supported outcome."); validText(input.note, "note", 3000, 10); r.notes.push({ id: id("note"), author: ref(active().profile.id), body: input.note.trim(), createdAt: stamp() }); r.status = "resolved"; r.outcome = input.outcome; if (input.outcome === "member_restricted") {
            const p = person(r.reportedMember.id);
            p.settings.discoverable = false;
            p.settings.openToRequests = false;
        } audit(r, `Resolved: ${input.outcome}`); notify(r.reporter.id, { kind: "report_update", text: "Your demo report has been reviewed. No real moderation action occurred.", href: "/settings/privacy" }); return copy(r); },
    };
    const realtime: Realtime = { status: hub.status, onStatus: hub.onStatus, subscribe(listener) { hub.eventListeners.add(listener); return () => { hub.eventListeners.delete(listener); }; } };
    const controls = {
        subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
        snapshot: () => version,
        get state() { return { actor, scenario, latestLink }; },
        reset: seed,
        enter(persona: DemoPersona) { scenario = "normal"; actor = DEMO_PERSONAS[persona]; expires = now() + 60 * 60000; hub.setStatus("open"); changed(); return copy(current()); },
        setScenario(value: DemoScenario) { scenario = value; hub.setStatus(value === "unavailable" ? "offline" : "open"); changed(); },
        expire() { actor = null; expires = 0; changed(); },
        incomingReply() {
            const viewer = active().profile.id;
            const t = threads.find((v) => v.participants.includes(viewer) && !blocked(...v.participants)) ?? fail("not_found", "Accept a connection before simulating a reply.");
            const sender = t.participants.find((v) => v !== viewer)!;
            const message: Message = { id: id("message"), conversationId: t.id, clientMessageId: null, senderId: sender, body: "Synthetic reply: happy to share my experience. What is your next practical question?", sentAt: stamp() };
            t.messages.push(message);
            notify(viewer, { kind: "message_received", text: `${ref(sender).displayName} replied.`, href: `/messages/${t.id}` });
            hub.emit({ type: "message.created", message: copy(message) });
            changed();
            return copy(message);
        },
    };
    return { api, realtime, controls };
}
export type DemoRuntime = ReturnType<typeof createDemoRuntime>;
