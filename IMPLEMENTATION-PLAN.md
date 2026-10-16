# ConnectAbroad: implementation and operating plan

Revised 16 October 2026 · Fresh build from scratch · ₹0 additional-spend budget · All dates use Asia/Kolkata.

The user has explicitly chosen a new application. This revision supersedes earlier instructions to locate/preserve an existing codebase or stop when application source is absent. Build new code in `frontend/` and later `backend/`; retain this planning package and its original Word source. The 15 November milestone is a conditional learning target, not a greenfield delivery guarantee.

Build a small community where someone preparing to move abroad can find a relevant person already there, start a respectful conversation, and receive a useful reply. Make that loop reliable, distinctive, and repeatable before expanding the feature list.

This is an executable plan, not evidence of a working application, product-market fit, search rankings, or revenue. The inspected folder contains the original Word blueprint and planning/skill files, with no application source, deployment URL, analytics, or customer research records. References in the original blueprint to an existing application and past bugs are historical background; no implementation is assumed reusable. This turn updates the plan and handoff prompt; it does not build the application.

## 1. What to preserve, and what changes

Source: `ConnectAbroad_Product_and_First100_User_Blueprint (1).docx`. The original remains unchanged. The pasted design notes are an aesthetic brief, not measured usability research. GitHub supplies implementation guidance; Reddit supplies hypotheses to test, not representative demand evidence.

| Original decision | Implementation decision here |
| --- | --- |
| One community before broad expansion | Keep. Choose a cohort the founder can personally reach; recruit helpful residents before increasing demand. |
| Previously described Spring backend and unspecified frontend | Start fresh: React/Vite/TypeScript frontend; new OpenJDK/Spring Boot backend with Spring Security, PostgreSQL and WebSockets. Podman and Caddy provide the self-hosted baseline. |
| 100 registrations, 50 activated users, 25 two-way interactions | Keep as working targets; define deduplication, maturity windows, helper capacity, and useful outcomes. |
| 9 October start | Rebase from 16 October. Earlier work is unknown, not assumed complete. |
| General landing-page copy and three benefit blocks | Replace the repetitive feature grid with a specific cohort promise, evidence of relevance, a clear journey, and honest trust information. |
| Signup-focused funnel | Add supply coverage, time to first reply, return cohorts, and explicit low-density states. |
| Monetization largely deferred | Add a sequenced willingness-to-pay experiment and labor-inclusive economics; keep the core peer network free during validation. |
| Little explicit SEO specification | Add public/private route rules, editorial briefs, metadata, crawl checks, and evidence requirements. |
| One long agent prompt | Shared instructions and skills now authorize greenfield scaffolding. A dedicated frontend prompt completes the interface with isolated demo data before backend integration. |
| Budget initially allowed hosting/domain purchases | Hard ₹0 additional spend: open-source software, existing hardware/access, no required paid account, domain, API, asset, trial or automatic upgrade. |

Supporting specifications:

- [Design system and screen contracts](docs/DESIGN-SYSTEM.md)
- [Business, growth, and monetization](docs/BUSINESS-AND-GROWTH.md)
- [SEO audit and applied plan corrections](docs/SEO-AUDIT.md)
- [Copy-ready execution prompts](docs/AGENT-PROMPTS.md)
- [Claude frontend prompt: build from scratch](docs/CLAUDE-FRONTEND-PROMPT.md)
- [Skill setup and upstream provenance](docs/SKILLS-AND-SOURCES.md)

## 2. Product thesis and launch boundaries

**Proposed positioning:** “Find people who share your roots and have made a similar move.”

**Launch promise:** “Meet relevant peers, ask practical questions, and learn from their lived experience.” Use it only when discovery and contact work. Avoid promises of visas, admissions, jobs, housing, identity verification, or guaranteed response times.

**Choose the wedge by 18 October.** Score candidate communities on founder access, at least five reachable residents/helpers, repeated concrete questions, a responsive community organizer, and permission to recruit. Five helper commitments qualify a candidate; eight consenting, available helpers are the proposed minimum before opening the initial beta. Choose one origin community plus one destination corridor. An Indian college alumni group moving to one UK city is an example, not a selected market. If access is weak, choose a different cohort before building destination pages.

**Who is served first:** people preparing for that move; residents willing to answer a bounded number of questions; one founder/community operator. Proposed beta policy: adults only until age handling and safeguarding have been deliberately designed. Confirm this audience choice with the founder during implementation.

**The loop:** eligible visitor → verified account access → minimum useful profile → relevant discovery → contextual request → acceptance → message → reply → optional invitation after value.

**Core scope:** account access/recovery, minimum profiles and privacy, discovery, connection requests, persistent messaging if marketed, block/report, a small moderation queue, essential notifications, truthful public pages, and minimal measurement.

**Defer:** general social feeds, jobs marketplace expansion, paid ranking, badges/rewards, AI chat inside the product, advanced matching, native apps, public member directories, multi-country SEO factories, subscriptions/payments before demand, and infrastructure added for hypothetical scale. Build only the agreed core modules; no legacy implementation is assumed.

**Early product advantage to test:** shared context plus a manageable request queue gets a more relevant response than the user's existing group. Visual quality should make the service clearer and more credible; it cannot substitute for available people.

## 3. Chosen stack, budget and delivery milestones

### Stack for the fresh application

| Layer | Required choice and boundary |
| --- | --- |
| Frontend | React + TypeScript + Vite in `frontend/`; React Router Framework Mode for routes and build-time public-page rendering. No production Node rendering server required. |
| Styling | Tailwind CSS via its supported Vite integration; only the needed MIT-licensed shadcn/ui components with Radix primitives, customized to the documented tokens. No paid themes, icon packs or animation library. |
| Rendering | `ssr: false` plus an explicit public-page `prerender` allowlist. Private member screens use client rendering; never prerender demo member records. React Router supports build-time prerendering without a runtime rendering server. [Official rendering guidance](https://reactrouter.com/how-to/pre-rendering) |
| Backend, later phase | OpenJDK LTS + Spring Boot modular monolith in `backend/`, REST APIs and Spring WebSockets. Pick compatible supported versions when implementing and pin dependencies. |
| Authentication | Spring Security as the only production authority; secure HttpOnly browser-session cookies with CSRF protection and server-side authorization. No paid identity provider. JWT is optional only for a justified later client/API requirement. |
| Browser/API origin | Same-origin baseline: Caddy serves the static app and proxies `/api` and `/ws` to Spring; Vite uses equivalent local dev proxies. Use relative URLs and document CSRF bootstrap/header behavior. No credentials in public frontend environment variables. |
| Data | PostgreSQL, SQL migrations, bounded pagination and measured indexes. Keep transactions and private data in the backend; the browser never connects directly to PostgreSQL. |
| Uploads | Local persistent private storage for self-hosted beta, bounded sizes/types, authenticated access and backups. No upload storage in an ephemeral free-host filesystem. Optional remote storage must meet the same ₹0 constraints. |
| Local runtime | Podman and a compatible open-source Compose provider; Caddy for static serving, HTTPS/routing when publicly deployed. Node is a build/dev tool, not a required public frontend server. |
| Tests | Vitest + React Testing Library for meaningful frontend logic; Playwright for browser flows. Backend later uses JUnit and PostgreSQL integration tests; no paid test service. |
| Design guidance | Pinned MIT UI UX Pro Max + project design skill; source/Reddit interpretation in the design document. Skills guide decisions and do not become runtime dependencies. |

Use npm and a committed lockfile for the new frontend. React Router's Vite integration supplies prerendering; do not introduce a separate meta-framework or custom rendering engine. Install only required free/open-source packages, retain license notices, and use current official integration instructions. [Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite), [shadcn Vite setup](https://ui.shadcn.com/docs/installation/vite)

### ₹0 operating contract

Baseline: run the software on an existing computer and internet connection. There are no required software license purchases, cloud subscriptions, domains, paid APIs, paid assets, paid agent services or payment-card trials. Electricity, connectivity, available storage and operator time are real constraints; zero additional spend is a planning limit, not a promise that infrastructure has no cost.

Optional public prototype: Cloudflare Pages static hosting, Render Free backend and Neon Free PostgreSQL, using provider subdomains and only permitted free quotas. These hosted services are not a fully open-source infrastructure stack. Recheck their terms/account requirements before deployment; accept suspension at hard limits instead of enabling paid overages. If a service requires spending or a billing commitment, keep the corresponding function local/unavailable and document it.

Separate Pages/Render provider domains are cross-site: do not assume browser-session cookies work unchanged. Before real accounts, test the exact credentialed fetch, narrow CORS allowlist, CSRF protection, cookie attributes and browser third-party-cookie behavior. Prefer the same-origin baseline or keep the split-origin prototype synthetic/demo-only until those tests pass; the free-service list is not a certified deployment recipe.

Known current limits: Render Free sleeps after 15 idle minutes; its free PostgreSQL expires after 30 days and is not the selected ongoing store. Neon has a limited free plan; Pages also has published limits. Do not promise dependable 24/7 service or unlimited free scale. Keep backups outside ephemeral instances. [Render Free limits](https://render.com/docs/free), [Neon Free plan](https://neon.com/pricing), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

Do not bypass quotas, create fake accounts, use keepalive traffic to defeat provider restrictions, or silently upgrade. No runtime AI API is needed. Use locally available/free development tools; this package does not purchase Claude, Codex or any model access. Email recovery/verification may be demonstrated locally with captured test mail; real user flows must remain honestly unavailable until a lawful reliable zero-budget delivery path is tested. Missing email delivery is a public-launch gate, not permission to weaken account security.

Working assumption: one experienced engineer with protected delivery time and a founder who owns recruitment/support; these may be the same person. If the founder has under approximately 20 engineering hours/week or required local tools/resources are unavailable, rebase the schedule and keep public promises at invitation/waitlist level until real release gates pass. Missing legacy source is expected and does not block the fresh frontend. Dates never waive launch gates.

| Window | Engineering outcome | Founder outcome | Exit gate |
| --- | --- | --- | --- |
| 16–18 Oct | Create the frontend foundation, route/API contract inventory, demo fixtures and first screen direction | Choose cohort, identify 10 design partners, secure helper commitments | Runnable fresh frontend; agreed stack and privacy boundaries; no invented production status |
| 19–25 Oct | Complete core frontend screens and interaction states; start backend/auth and real profile/connection loop | 25 cumulative registrations only if real beta gates pass; resident supply before broad invite | Demo frontend may finish independently; real registration counts require tested production backend |
| 26 Oct–1 Nov | Messaging persistence/reconnect, notifications, moderation/deletion handling; instrument agreed events; remaining core screens | 45 cumulative registrations; 15 total interviews; first consented story | Reply measurement works; report queue owned; no open critical privacy issue |
| 2–8 Nov | Mobile/accessibility/performance improvements; public page metadata and curated content; backup restore rehearsal | 70 cumulative registrations; repeat the best acquisition channel | Functional, security, visual and operational release evidence collected |
| 9–15 Nov | Critical fixes, release candidate, rollback check; no unrelated feature work | 100 cumulative registrations, review activation/replies/retention and payment interest | Honest launch review; public expansion only if gates pass |

Day 1 starts in this planning workspace. Inspect files to avoid overwriting user work, then scaffold the explicitly authorized fresh frontend in `frontend/`. The source's absence is expected. Complete the frontend using clearly labeled, synthetic development/demo fixtures while the backend is built separately. If greenfield work cannot safely meet November dates, report the actual gate status and rebase the schedule; never count fixture users as registrations.

## 4. New application architecture and implementation contract

Build a modular Spring Boot monolith and PostgreSQL alongside the static React frontend. Spring owns users, permissions, connections, messages and moderation. Keep the frontend's typed API boundary small; use native fetch and React state/router facilities first. Do not add Next.js, a second business API, Redis, queues or an agent framework merely because an example uses them.

Foundation outputs, recorded as code is created:

1. Selected compatible versions, frontend route map, package/build commands, backend build wrapper and migration tool when implemented.
2. Route → UI component/template → HTTP method/path → controller/service → data query map for the core journey.
3. Intended and then tested authentication/session storage, logout/revocation/expiry behavior, password reset and email-verification status.
4. Authorization matrix for anonymous, owner, other member, blocked member, and administrator.
5. New schema/index/constraint inventory and query plans as implemented; synthetic fixture behavior kept separate from real member data.
6. Tests and their actual outcomes, current deployment assumptions, backup/restore capability, and a ranked reproducible defect list.

Historical 401 login, 403 profile, HTTP-method mismatch, inert controls and port conflicts are useful test scenarios from the source, not defects to claim exist in this new application. Record expected policy separately from observed behavior.

### Domain rules for the responsible application layer

| Domain | Required invariant | Data/API implication |
| --- | --- | --- |
| Identity | Canonical email uniqueness; framework password encoder; safe browser-session lifecycle | Use Spring Security facilities; no custom crypto; document generic errors, CSRF, expiry and reset handling |
| Profiles | Only owner/admin may edit; discovery returns an explicit safe-field projection | Keep email, phone, exact address, documents, and sensitive status out of search payloads and page source |
| Discovery | Relevant cohort first; bounded pagination; block/visibility policy applied server-side | Consistent query/paging conventions; deterministic ordering and indexes guided by measured queries |
| Connections | No self/duplicate request; recipient controls acceptance; valid state transitions | Enforce one logical pair and concurrency-safe transitions using model/DB constraints |
| Messaging | Only participants can read; accepted connection required to start/send in beta; block stops new sends | Check membership and block state on REST, subscriptions, and each send; preserve reconnect correctness |
| Block/report | A block immediately stops new contact and removes mutual discovery; a report creates a private case | Enforce in server queries and live messaging; report idempotency/abuse limits; restricted moderation access |
| Moderation | Admin-only case handling, recorded actions, member appeal/support path | No unrestricted report exports or private-message browsing; any scoped abuse evidence access must be authorized and audited |
| Deletion | Clear deletion/deactivation policy across profile, discovery, sessions, content and backups | Specify retention/processing before schema changes; no ad hoc cascade that destroys another user's records |
| Notifications | Email contains minimal context; preference handling; transport failure does not corrupt account creation | Local test delivery first; real delivery only within verified zero-budget constraints; safe retries |

Blocked participants may retain access to their historical conversation according to the documented retention policy; blocking does not silently delete evidence. Recheck permission when state changes during an open socket session. Persist messages before acknowledging successful delivery; use message/request identifiers to handle duplicate retries without duplicate visible messages.

These are contracts for new implementation, not verified runtime/schema descriptions. Specify them before creating endpoints and migrations. Enforce resource authorization on the server; hiding controls in the browser does not enforce ownership. [OWASP broken access control guidance](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/)

WebSocket authorization needs its own tests. Select a supported compatible Spring version and implement against its matching documentation. Check inbound subscription/send destinations, allowed origins, connection authentication/expiry, size/rate limits and membership. Before adding a second realtime instance, verify cross-node delivery; an in-memory broker alone is not a clustering strategy. [Spring Security WebSocket guidance](https://docs.spring.io/spring-security/reference/servlet/integrations/websocket.html), [OWASP WebSocket guidance](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)

## 5. Ticket backlog: build vertically, integrate frequently

Every ticket carries: objective, current evidence, allowed files/modules, dependencies, exclusions, acceptance scenarios, validation commands, rollback implications and final evidence. Create runnable scripts/wrappers with the new application and report actual outcomes; commands in a plan are not proof they have run.

| ID / priority | Work and dependency | Acceptance evidence |
| --- | --- | --- |
| CA-001 / P0 | Create the fresh frontend foundation and contract inventory; no backend dependency | `frontend/` runs locally; dependencies pinned; routes, demo/API mode and checks documented; public rendering verified |
| CA-002 / P0 | Cohort and product/API contracts; may run alongside CA-001 | Named launch cohort, five helper commitments sought, field visibility and connection/block state decisions documented; provisional demo copy stays honest |
| CA-003 / P0 | Implement real Spring account access/recovery and authorization; CA-001/002 | New/returning account; wrong password, duplicate email, expiry, logout, CSRF, reset single use; allowed/denied resource access |
| CA-004 / P0 | Minimum profile and discovery; CA-002/003 | Owner edit; safe other-member view; realistic search/paging/empty state; no hidden-field exposure |
| CA-005 / P0 | Connection request loop; CA-004 | Two-account request/accept/decline/cancel policy; duplicate/self/concurrent request handling; blocked-member denial |
| CA-006 / P0 | Messaging and notification correctness; CA-005 | Persist/refresh/reconnect; outsider denied read/subscribe/send; block/expiry after connection; retry without duplication |
| CA-007 / P0 | Report/block/moderation and deletion path; CA-003; integrate CA-004–006 | Member files report; another member cannot read it; admin case action logged; block enforced immediately; deletion behavior tested |
| CA-008 / P1 | Complete the frontend from scratch; CA-001, independent of backend availability | All scoped routes/states work in explicit demo mode; API mode remains honest; responsive/keyboard checks, build/tests/screenshots and backend contract handoff |
| CA-009 / P1 | Funnel events and weekly report; CA-004–006 | Server-authoritative success counts; no message bodies in analytics; event deduplication; report reconciles with test records |
| CA-010 / P1 | Public SEO/content; CA-002/008 | Only approved public pages eligible for indexing/in sitemap; meaningful HTML and metadata/canonicals; guides genuinely reviewed; private route checks; actual index coverage monitored after launch |
| CA-011 / P0 | Deployment/recovery readiness; CA-001 onward | Clean staging startup; HTTPS, secret handling, alert path, backup restore and rollback evidence; no production data changed for tests |
| CA-012 / P0 | Real integrated release review; CA-003–011 | Full two-account core journey plus outsider/block/admin checks; mobile/keyboard pass; fixture-only checks never treated as production security evidence |
| CA-013 / P1 | First cohort learning loop; CA-002; live invites require CA-012 gate | Interviews and channel log; measured response capacity, activation, replies and mature return cohorts |
| CA-014 / Later | One willingness-to-pay experiment; useful retained cohort | Priced nonbinding expression of interest or explicit rejection; opportunity-cost model; no revenue claim, billing build or purchase |

CA-008 may finish before the backend. Agree typed request/response/error shapes and record them in `frontend/README.md`; one small API module may separate in-memory demo behavior from real HTTP calls. Demo mode uses no real account, stores no secrets and displays a persistent sample-data banner. Default production builds use API mode; never silently fall back to fixtures after an API error. The frontend can be verified as a demo while real authorization, persistence, notifications and email remain pending. CA-007 and real integration remain public-release blockers.

## 6. Design direction and review method

Use the detailed [design specification](docs/DESIGN-SYSTEM.md). Proposed direction: **Letters across borders**—warm paper, dark ink, restrained green, marigold accents, editorial headings, and authentic stories/photography where consent and rights permit. The reason is human belonging and practical trust, not fashion alone.

Build three representative screens first: public landing, member discovery, and a narrow mobile conversation. Review hierarchy, clarity, trust, and accessibility before producing the rest. Use the requested UI UX Pro Max search as design input, then edit its generated recommendations against the product's task and brand. A tool-generated style is a starting point, not approval evidence.

From the pasted notes: avoid default purple mesh/glass treatments, unexplained glowing borders, uniform giant radii, repeated icon-and-card grids, fake announcement pills, and invented member photography/testimonials. Keep consistent spacing, reusable components, readable body type, and familiar icons where useful. Deliberate asymmetry belongs in marketing composition; forms, keyboard navigation, and chat remain predictable. Replacing one template with another is not differentiation.

Create only the shared components used by the core routes, using customized shadcn/Radix primitives where useful. Use local design tokens, one restrained motion language, complete interaction states and actual product copy. Choose only free/open-source assets/fonts, retain license notices and use intentional typography when permissioned photographs are unavailable. No purchased design pack or image-generation API is required.

Proposed review rubric, scored by humans with screenshots and notes: relevance/truthfulness 25%, task clarity 25%, accessibility 20%, mobile quality 15%, visual distinctiveness 15%. A serious access or interaction failure blocks release regardless of weighted score. No fabricated “98/100 design” claim.

## 7. Agent execution: one integrator, bounded specialists

Use native agent capabilities already available through the user's existing access. No purchase, paid API usage, additional subscription or orchestration service is a project requirement. Skills are reusable workflows, not background employees or permission to publish. Use the same brief sequentially when subagents are unavailable.

| Role | Assignment | Output / boundary |
| --- | --- | --- |
| Lead integrator | Own backlog, architecture decisions, contracts, sequencing and integration | One current task ledger; reconciles competing recommendations; runs the final gate |
| Investigator | Read-only code/runtime audit and reproducible failures | Paths, observations, hypotheses, failing evidence; no speculative fixes |
| Backend implementer | One cohesive ticket in assigned service/controller/schema scope | Minimal patch + focused regression proof + migration note where needed |
| UI implementer | Agreed screens/components using approved tokens/contracts | Responsive states, keyboard behavior, screenshots; no unilateral API/schema changes |
| Independent reviewer | Review changed code and connected paths; check acceptance scenarios | Severity, path, concrete failure, reproduction, smallest fix; never claim unrun checks |
| Growth/SEO specialist | Review funnel, briefs and public-route/content work | Drafts/analysis and measurable experiments; no unrequested outreach, publishing or spending |

Normal parallelism is two active workstreams: one engineering slice and one independent design/research task. Add a third only with genuinely separate file ownership. Shared tokens/components/contracts have one owner. Use separate worktrees once this new project has a Git repository, or disjoint file scopes before then; one agent owns schema changes. Worktrees do not isolate databases—assign separate test databases/configuration too.

The handoff format:

```text
Ticket: CA-00X
Goal and user-visible result:
Known facts / assumptions:
Read these files first:
Allowed edit scope; excluded work:
Dependencies and agreed API/data contract:
Acceptance examples, including denied/error paths:
Validation commands discovered in this repository:
Return: changed files, result, commands+outcomes, remaining risks, next dependency.
```

Cycle: investigate → define acceptance/ownership → implement one slice → independent review → integrate → verify → update ledger. Save findings in short files so a new session can resume without rereading whole chat histories. Keep `AGENTS.md` short; load detailed skills only when relevant. [OpenAI guidance on focused skills and instructions](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)

Set a per-ticket time/token budget appropriate to the task. After two failed attempts on the same unexplained failure, stop speculative patching, collect logs/minimal reproduction, and revise the hypothesis. Do not repeat tests after they pass unless new changes or unresolved evidence justify it. Independent review can reject a change; the lead resolves it with evidence.

Runtime automation comes later: notification reminders, issue triage, content drafts and weekly metric summaries can be assisted. Humans retain ownership of publication, payouts/refunds, identity claims, legal content and consequential moderation decisions. Product agents must not read unrestricted private chats to manufacture marketing insights.

## 8. Measurement contract

Track the original targets, with the following proposed definitions:

| Metric | Exact working definition |
| --- | --- |
| Registered | Unique successful production accounts; exclude fixtures, bots and duplicate test accounts. Track verified email separately if supported. |
| Profile complete | All required discovery fields completed, visibility understood and saved; optional sensitive fields never required. |
| Activated in 7 days | Completed profile and sent/accepted one legitimate connection request or sent a first contextual message within 168 hours of registration. Count each user once. |
| Two-way conversation | Distinct participant pair with at least one delivered message from each participant; repeated messages do not create more pairs. |
| Useful outcome | Member explicitly reports their practical question helped, or founder records consented qualitative evidence; a reply alone is not proof of usefulness. |
| Time to first reply | Elapsed time between first legitimate request/message and first counterpart reply; report unreplied requests and observation window alongside median replied time. |
| Days 2–7 return | Registered users with a meaningful action 24–168 hours after signup, divided by users observed for a full 168 hours. Never label this strict day-7 retention. |
| Strict D7 retention | Meaningful action 168–192 hours after signup, divided by users observed for 192 hours. Report separately only if sample supports it. |
| Helper coverage | Members with at least one relevant, consenting helper currently open to requests / members seeking help in the cohort. |

Use registration-relative elapsed time for cohort calculations and one documented reporting timezone for calendar summaries. Registrations after 8 November have not all matured for a complete 7-day window at the 15 November review. Report immature cohorts separately. The stretch of 50 activations remains a working target, not an excuse to change the definition.

Start with a minimal weekly database/export report when the backend exists; demo events never enter real metrics. Events: signup outcome, profile completion, discovery, connection request/accept, message persisted, reply, report submission and deletion completion. No paid analytics platform is required. Anonymous landing measurement depends on the actual privacy/consent setup; do not force-identify visitors.

Required event envelope: event ID for deduplication, event name/version, UTC timestamp, minimal pseudonymous actor/cohort ID where needed, acquisition tag, outcome. Message-success/reply counts come from persisted server state. No email, phone, raw search text, message body, tokens, or document content. Define access and a short justified retention window before collecting events. A manual spreadsheet can track consented recruitment; never turn it into an uncontrolled copy of private chats.

## 9. Business model and the path to lower-touch income

Follow [the business playbook](docs/BUSINESS-AND-GROWTH.md). Required cash spend remains ₹0: no paid traffic, subscriptions or purchase-dependent experiments. Organizer revenue is a later earning hypothesis, not permission to spend on billing infrastructure. Organic search compounds later; warm recruitment and permission-based community partnerships own the first-100 target.

Suggested sequence:

1. Free focused beta: prove useful introductions without exhausting helpers.
2. Interview community organizers about a specific recurring coordination problem and budget; do not build a generic paid dashboard.
3. Test a priced nonbinding expression of interest for one fixed-scope organizer/community service. It is neither a payment nor revenue; no processor or billing setup is needed.
4. Consider actual paid fulfillment only after separate authorization and a lawful collection/receipt/refund method that fits the zero-spend constraint. Track unpaid support/moderation/content labor as opportunity cost, separately from cash expenditure.
5. Automate only observed repetitive work. Recurring organizer revenue requires real completed pilots and renewal evidence; it is a later hypothesis, not a subscription to buy now.

Optional later experiments—reviewed templates, sponsored placements or optional paid sessions—must have a clear buyer and delivery economics. Sponsorship never changes an undisclosed peer ranking or verification label. Do not build all revenue paths concurrently or charge to block/report/delete an account.

Low-touch operation is an operating target: fewer manual steps per useful connection, reliable response routing, repeatable onboarding, and retained paying organizers. A community product still requires support, security maintenance and moderation. No revenue, ranking, “best in market,” or passive-income outcome is promised.

## 10. SEO corrections applied to this plan

The [audit](docs/SEO-AUDIT.md) reviews planning readiness, not a live website. Its release-critical recommendations are incorporated here:

- Index only truthful public marketing pages, genuinely useful guides and curated community hubs with real maintained substance.
- Discovery, member profiles, connections, messages, reports and admin stay authenticated in the beta. Public profiles are deferred; public search visibility would require separate explicit opt-in and minimized fields.
- Do not expose personal profiles to attract traffic. Authentication protects private content; robots rules do not provide confidentiality.
- Do not mass-generate destination/college/hometown combinations. Empty or duplicate pages stay unpublished; real alternatives have useful content and distinct intent.
- Deliver meaningful crawlable public HTML with unique titles, descriptive headings, canonical URLs and a sitemap containing only indexable canonical pages.
- Provide useful first-hand guides with named accountable authors/reviewers, dates and official sources. Avoid automated visa/job/financial claims and unsourced “best” lists.
- Use structured data only for supported truthful content; do not invent reviews, verification, affiliations or rich-result eligibility.
- Test redirects, absent pages, staging indexing controls and private response caching. Inspect indexing after launch; never claim ranks or traffic before observing them.

These are specification changes made now. Metadata, response headers, robots rules, structured data, Search Console and production performance remain implementation/verification tasks; no live fixes have been claimed.

## 11. Release gates and evidence

Create standard local scripts for build, type checking, lint and focused tests. Use Vitest/React Testing Library and a compact Playwright core journey for the new frontend; JUnit/PostgreSQL integration checks follow with the backend. Test non-trivial state changes and denied/error paths. Do not build a broad test framework as a substitute for exercising the product; no paid testing service is required.

| Gate | Required evidence |
| --- | --- |
| Functional | Fresh and returning user signup/login/recovery/logout; profile/save; discovery; connection state transitions; two-way messaging if marketed; errors and retry states |
| Authorization | Anonymous, owner, other member, blocked member and admin matrix for relevant APIs; no ID swapping, private-field leaks or unauthorized socket subscriptions |
| Abuse/safety | Block enforced server-side; report works and is private; moderation owner sees case; spam/request rate controls fit early traffic; safe content rendering |
| Visual/accessibility | Actual 360/390 px mobile and 768/1440 px layouts; keyboard-only core flow; zoom/reflow; focus/error labels; contrast; reduced motion; loading/empty/error/success states |
| Performance | Proposed public-page budgets: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75 when field data exists. Before then report lab conditions and measured bottlenecks, not a field-data pass. [Core Web Vitals definitions](https://web.dev/articles/vitals) |
| Reliability | Persist/reconnect/retry; email failure does not undo successful account creation; duplicate actions do not corrupt state; critical errors alert an owner |
| Operations | Fresh staging startup; HTTPS; secret redaction; backups restored into isolated DB; rollback rehearsal with compatible DB schema; support/deletion ownership |
| SEO/privacy | Allowlisted public URLs only in sitemap; meaningful HTML/meta/canonical; private content protected with auth and no shared-cache leak; staging excluded; no placeholder proof claims |
| Product | Five target-user observed walkthroughs attempted; cohort has genuine helper availability; truthful copy matches live features; unresolved gaps visible in release decision |

Proposed infrastructure objective for a real-data beta: daily encrypted database backups, RPO ≤24 hours, RTO ≤4 hours, using available zero-budget storage and an assigned owner. These targets require a successful timed restore; if existing resources cannot meet them, withhold real-data public launch rather than buy services or waive recovery. Use compatible migrations and a tested pre-change backup for consequential data changes.

Do not declare release based only on agent self-report or passing unit tests. Keep actual commands, relevant screenshots, build/commit identifier, environment and denied-path results in the release record. If serious privacy, core-loop or recovery evidence is missing, stay invite-only or withhold the beta.

## 12. First execution session and stopping condition

Open this workspace in Claude Code or Codex. Read `AGENTS.md`, then paste [the frontend-from-scratch prompt](docs/CLAUDE-FRONTEND-PROMPT.md). The user explicitly authorizes new frontend scaffolding. Complete CA-001 and CA-008 through implementation and available verification; do not stop at a plan or the first three screens.

The frontend task is complete when the scoped screens, demo interactions, API boundary, public prerendering and available quality checks are implemented, with a short backend contract and exact remaining integration gaps. Missing backend source is expected at this stage and does not block independent frontend work. A runnable demo is not a claim of real authentication or production readiness.

The 15 November review records actual registrations, mature activation/return cohorts, two-way pairs, useful-outcome evidence, helper load, safety response, acquisition cost including labor, and payment evidence. Continue or expand only where those results support it. Otherwise narrow the cohort, repair the loop or revise the offer.

This package finishes the planning task. Application implementation, production SEO checks, customer interviews, outreach and paid experiments have not been performed.
