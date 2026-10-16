# Claude prompt: build ConnectAbroad frontend from scratch

Open this workspace in Claude Code and paste the following. This is a complete frontend implementation task. Application creation has not been performed by writing this prompt.

```text
Act as the senior frontend engineer and product designer building ConnectAbroad.

WE ARE STARTING EVERYTHING FROM SCRATCH. There is no existing application to
locate or preserve. I authorize creating the complete frontend in frontend/.
Inspect the workspace to avoid overwriting documents or user changes, then
proceed from scaffolding through implementation and verification in this task.
The backend will be developed separately; its absence must not block the UI.

Read AGENTS.md, CLAUDE.md, IMPLEMENTATION-PLAN.md, docs/DESIGN-SYSTEM.md,
docs/SEO-AUDIT.md, docs/SKILLS-AND-SOURCES.md, and the relevant skill files:
.claude/skills/connectabroad-design/SKILL.md
.claude/skills/connectabroad-delivery/SKILL.md
.claude/skills/ui-ux-pro-max/SKILL.md
This request supersedes historical instructions to stop without existing code.

BUDGET AND STACK
- Hard budget: ₹0 additional spend. All required packages, components, assets
  and fonts must be free/open-source. Preserve their license notices.
- Use React + TypeScript + Vite and npm with a committed lockfile.
- Use React Router Framework Mode with ssr:false and an explicit approved
  public-page prerender list. Production output is static; no Node SSR server.
- Use Tailwind CSS through its supported Vite integration and only the needed
  shadcn/ui components with Radix primitives. Customize them to our brand.
- Use compatible supported package versions and current official setup docs.
- No paid themes, APIs, icons, photos, subscriptions, billing accounts, card
  trials, hosting purchases, runtime AI, Next.js or extra backend framework.
- Backend target is OpenJDK/Spring Boot/Security/PostgreSQL/WebSockets.
  Document its expected contracts without implementing that backend now.

DESIGN
Follow “Letters across borders” in the design specification:
paper #F7F3E9; surfaces #FFFFFF; ink #193744; green #23594B;
marigold #E3AF51. Use semantic tokens and documented contrast pairs.
Use Newsreader editorial headings and Public Sans application text, locally
available or freely licensed with a good fallback. Bundle only needed weights.

Create an intentional editorial landing page, scannable member discovery,
and a clear mobile conversation experience. Establish shared components on
these screens, then finish all routes. Use the pinned UI UX Pro Max skill for
targeted guidance; reject generic results that conflict with the product brief.
Keep accessible controls, familiar icons and consistent spacing. No fake
testimonials, verification, affiliations or member counts. Use typography and
original simple graphics if permissioned photography is unavailable.

COMPLETE THESE SCREENS AND ACTIONS
- Public landing, how-it-works, about and safety pages.
- Signup, login, recovery/verification UI with honest integration status.
- Onboarding, own profile creation/editing, member profile.
- Discovery with supported filters, reset, result count and pagination.
- Incoming/outgoing requests, accept/decline/cancel and connections list.
- Conversation list, chat composer, send/retry and reconnect states.
- Notifications, account/privacy settings, logout/deletion-request UI.
- Report/block flows and a demo admin report queue/detail.
- Public policy-page layouts, navigation, mobile navigation, access denied,
  loading, empty, unavailable and not-found screens.
Use approved policy text when present; mark missing legal copy as a publication
blocker instead of inventing legal assurances. No jobs, payments or social feed.

DEMO AND API BOUNDARIES
Build a small typed API boundary in frontend/src/lib/api.ts or the equivalent
Framework Mode app/lib/api.ts location. Follow one coherent source layout.
Document request/response/error shapes needed by the future Spring backend.
Use native fetch and router/React state first; avoid unnecessary state libraries.
Use relative /api and /ws URLs with Vite development proxy configuration and
planned same-origin Caddy routing. Document session-cookie credentials and the
CSRF contract; no secrets belong in browser-exposed environment variables.
Split-domain free hosting remains demo-only until actual cookie, credentialed
fetch, narrow CORS and CSRF behavior are tested with the future backend.

Provide an explicit development demo mode with deterministic synthetic users,
long names, missing avatars, empty results and interaction scenarios. Display
a persistent “Demo — sample data” banner. Keep demo state in memory, provide
reset behavior and explain that refresh resets it. Never store real passwords,
tokens or private messages in fixture files or browser storage.

Implement functional demo navigation, profile edits, filters, connection state
changes, simulated messaging, blocking/reporting and moderation. Label outcomes
as local demonstrations. Demo admin switching is never real authorization.
Preserve acceptance-before-message, block/new-contact restrictions and history
retention behavior in these demonstrations.

Default production builds use API mode; backend absence produces an honest
unavailable/retry state. No silent fallback to fixtures, fake account creation,
fake report receipt or claimed server persistence. A separately invoked demo
preview may use only synthetic data and must remain labeled and non-indexable.
Keep personal data off public build output. Frontend route guards are UX;
future Spring authorization is the actual security boundary.

INTERACTIONS AND ACCESSIBILITY
Finish idle/loading/submitting/success/error/pending/blocked/expired/offline
states. Preserve form entries after recoverable failures; prevent duplicate
submits and recover safely from failed actions. Use labels, inline errors and
an accessible error summary. Keep password-manager/paste support.
Use semantic controls, logical focus order, visible focus and useful status
announcements. Dialogs need focus management, Escape, cancel and focus return.
Respect reduced motion and zoom. Ensure mobile keyboard does not cover chat
controls. Keep readers in position while reviewing older messages.

PUBLIC HTML AND HOSTING READINESS
Prerender only approved public marketing/info pages with real visible content,
unique metadata and headings. Draft/unapproved guide or community pages remain
unpublished. Member screens and demo fixtures never enter public prerendering.
Create sitemap/canonical configuration without inventing a production domain.
Noindex utility/demo pages and document private-route deployment handling.
Check static public files resolve before known app-route fallbacks; unknown
public paths require a true 404, not a success-page catch-all.
Document local preview and Caddy/static-host needs without deploying or buying.

WORK METHOD
Keep a short screen/action checklist. Make routine decisions autonomously.
Use native subagents for disjoint screen groups and independent review if
available through existing access; otherwise work sequentially. One owner
controls shared tokens/components/contracts. Integrate every delegated result.
Continue until all scoped frontend screens are implemented and available
checks pass. Record exact external blockers while completing independent work.

VERIFICATION AND DELIVERY
Create local scripts for dev, build, typecheck, lint, focused tests and browser
checks. Use Vitest/React Testing Library for meaningful state logic and
Playwright for the demo core journey, failures and key accessibility behavior.
Keep tests deterministic and independent of paid services or a real backend.
Verify generated public HTML and that it contains no synthetic member data.

Inspect actual UI at 320, 390, 768, 1024 and 1440 CSS px; correct overflow, clipped
copy, focus/keyboard issues, dialog errors, weak contrast, zoom/reflow problems
and mobile composer issues. Capture and inspect screenshots if browser tools
are available. Otherwise name the unavailable checks honestly.
Run the actual build/typecheck/lint/tests and fix relevant failures. Review the
complete frontend against the specification before finishing.

Return completed routes, important decisions, changed files, exact commands
and results, screenshot paths, local startup instructions and backend contract
gaps. Distinguish verified demo behavior from pending real authentication,
persistence, authorization, email and realtime integration. No deployment or
purchase is part of this task. Complete the frontend implementation now.
```
