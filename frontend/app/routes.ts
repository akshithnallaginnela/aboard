import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public site: prerendered pages are listed in app/lib/site.ts.
  layout("routes/public-layout.tsx", [
    index("routes/home.tsx"),
    route("how-it-works", "routes/how-it-works.tsx"),
    route("about", "routes/about.tsx"),
    route("safety", "routes/safety.tsx"),
    route("community-guidelines", "routes/community-guidelines.tsx"),
    route("privacy", "routes/privacy.tsx"),
    route("terms", "routes/terms.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("forgot-password", "routes/forgot-password.tsx"),
    route("reset-password", "routes/reset-password.tsx"),
    route("verify-email", "routes/verify-email.tsx"),
    // Prerendered and copied to 404.html; the catch-all renders the same module client-side.
    route("not-found", "routes/not-found.tsx", { id: "not-found-page" }),
    route("*", "routes/not-found.tsx", { id: "catch-all" }),
  ]),

  // Member application: client-rendered, session required (frontend guard = UX only).
  layout("routes/app-layout.tsx", [
    route("onboarding", "routes/onboarding.tsx"),
    route("people", "routes/people.tsx"),
    route("people/:memberId", "routes/person.tsx"),
    route("connections", "routes/connections.tsx"),
    route("messages", "routes/messages.tsx", [
      index("routes/messages-index.tsx"),
      route(":conversationId", "routes/conversation.tsx"),
    ]),
    route("notifications", "routes/notifications.tsx"),
    route("settings/profile", "routes/settings-profile.tsx"),
    route("settings/privacy", "routes/settings-privacy.tsx"),
    route("admin/reports", "routes/admin-reports.tsx"),
    route("admin/reports/:reportId", "routes/admin-report.tsx"),
  ]),
] satisfies RouteConfig;
