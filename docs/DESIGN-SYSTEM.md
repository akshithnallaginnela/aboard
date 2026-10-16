# ConnectAbroad design and UX implementation specification

Prepared 16 October 2026; updated for the user's authorized fresh build. This is a proposed product direction and implementation contract, not a claim that screens, members, photos, accessibility compliance, or backend capabilities already exist. Read it with [the implementation plan](../IMPLEMENTATION-PLAN.md) and [SEO audit](SEO-AUDIT.md). The supplied blueprint supplies the product mission; the new greenfield/zero-spend instruction supersedes its existing-code assumptions. This turn updates planning only; the future Claude prompt creates the application.

## 1. Product feeling and scope

**Direction: Letters across borders.** Make ConnectAbroad feel like a thoughtful introduction from someone who knows the place. Use legible ink, warm paper, documentary portraits, useful explanations of shared background, and confident action labels. The distinctive asset is a member's specific reason to help, not a decorative airport globe.

The first screen must answer: Who is this for? Who might I meet? What can I safely share? What happens when I join? The application must help an anxious person make one respectful connection on a phone. A dramatic landing page cannot compensate for empty discovery or an unanswered request.

Build the new frontend in `frontend/` with React, Vite, TypeScript, Tailwind CSS, and React Router. Inspect the folder to avoid overwriting documents or unrelated work, then scaffold and continue: missing application source is expected and is not a blocker. Choose compatible stable versions at implementation time, verify official documentation, and commit the dependency lockfile. The planned backend is OpenJDK/Spring Boot/Spring Security/PostgreSQL/WebSocket, with Podman and Caddy for local/deployment operations; frontend work must not quietly implement or claim that backend.

Assumptions requiring founder validation: one reachable origin/destination cohort; adult beta members; English interface; permission to use any member stories. The product stack, assets, and browser tests require no purchase: no premium UI blocks, paid icons/fonts/photos, hosted auth/database dependency, paid analytics, runtime AI, domain purchase, or paid browser service. Development on the current machine can cost no additional money; public hosting, email deliverability, hardware, connectivity, and a custom domain are not inherently free or already provided. Keep launch claims within the actual available infrastructure.

Use semantic HTML/native controls for simple interactions and a small set of custom-styled shadcn/Radix primitives for complex dialogs, menus, tabs, and disclosures where justified. Both [shadcn/ui](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) and [Radix primitives](https://github.com/radix-ui/primitives/blob/main/LICENSE) use the MIT license; retain applicable notices. [Tailwind CSS is MIT licensed](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE). Add only used components and style them with this document's tokens. Component provenance does not prove the composed screen accessible. Do not adopt the stock shadcn appearance or a paid template, and do not add a second component suite or animation library for minor effects.

Design ownership: one designer/frontend owner keeps the shared tokens and components consistent. A separate reviewer checks accessibility and task completion. Parallel agents may implement independent screens after the common components and API shapes are agreed; two agents must not change the same theme or shared component simultaneously.

## 2. Research interpreted for this product

The requested [UI UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) was inspected, including its [actual skill instructions](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/56ea9cf174ed86786187daa9de0e6247cb0747e4/.claude/skills/ui-ux-pro-max/SKILL.md), search entry point, and references. Its relevant process is to select a product-wide direction, inspect search fit, query a detected stack separately, and prioritize accessibility and interaction. Its recommendations do not override repository rules or replace user testing. The pinned source is MIT licensed; retain its license when vendoring. See `SKILLS-AND-SOURCES.md` for the installation and execution record.

The vendored search scripts were reviewed and run locally. The design-system query **peer community warm editorial** suggested Minimalism & Swiss Style, a generic hero/features/CTA structure, black/pink, and Outfit/Work Sans. The narrower retry **alumni peer mentoring community** still proposed the generic structure and fonts, now with purple/green. Both were rejected as brand prescriptions for this community; no generated MASTER was persisted. The product query **community social network** matched broad social-media/anonymous-community patterns rather than this product's specific need. Targeted **error summary validation** results supported focusable, announced error recovery and were adopted. **keyboard focus modal** and the retry **dialog focus trap return** returned general focus guidance, not a verified specific dialog-contract match. The [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) is the primary-source fallback for that contract. This document's palette and composition remain deliberate project choices, not a claimed generated match.

This document's palette, layouts, and copy are bespoke proposals. A search result is evidence to consider, not an instruction to copy a fashionable template. Use only the domains needed for the task. Do not include private member information in skill queries. The [upstream quick reference](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/56ea9cf174ed86786187daa9de0e6247cb0747e4/.claude/skills/ui-ux-pro-max/references/quick-reference.md) usefully distinguishes a 24 CSS pixel web minimum from larger native touch guidance; this product deliberately chooses a larger 44 CSS pixel target for its primary controls.

| Reference | What to learn | What to create for ConnectAbroad |
|---|---|---|
| [Are.na's own product explanation](https://www.are.na/) | Explain a network through concrete actions and what people contribute. | A short discover → introduce → reply explanation, written for movers and residents. Do not copy its positioning or assume its business model transfers. |
| [USWDS collection component](https://designsystem.digital.gov/components/collection/) | Scannable repeated information with meaningful titles and supporting metadata. | People results whose shared context and help topics are readable before opening a profile. Keep relevant profile attributes together. |
| [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/) | Make validation recoverable with a summary linked to each invalid field and local explanations. | Signup, onboarding, settings, and report forms that preserve entered values after failure. Share one consistent field/error component. |

These are content/interaction references inspected through published pages, not a screenshot-based visual competitor audit. Collect a small screenshot reference board during frontend discovery: one useful people-search result, one approachable consent form, and two real editorial photo compositions. Label the specific lesson and source; do not reproduce another brand's page.

**Reddit, treated as anecdotal and re-read for this revision:** in a [July 2026 discussion](https://www.reddit.com/r/webdesign/comments/1us1u6l/what_color_paletts_scream_ai/), commenters call out cream/orange too, one emphasizes photography, and another says to judge the entire design rather than just colors or fonts. In a [June discussion](https://www.reddit.com/r/webdesign/comments/1uhuovu/preventing_the_ai_slop_look/), commenters recommend following the client's visual identity and looking beyond website templates for inspiration. These are opinions from self-selected commenters, not conversion evidence or proof that any font is bad. Retain this palette because its legibility, shared-context layouts, real content, and calm tone fit the product; validate the result through task completion.

## 3. Brand tokens and typography

Use semantic variables; no repeated hex values in individual components. Colors below are proposed defaults, not existing brand assets.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F7F3E9` | Warm page background, particularly public/editorial pages |
| `surface` | `#FFFFFF` | Forms, results, conversation canvas |
| `ink` | `#193744` | Body text, headings, icons |
| `muted-ink` | `#536266` | Dates, helper text, supporting metadata |
| `primary` | `#23594B` | Primary action, selected navigation, links with underline |
| `on-primary` | `#FFFFFF` | Text on primary actions |
| `accent` | `#E3AF51` | Sparse editorial highlight with ink text; never white text |
| `soft-context` | `#DCE7DF` | Shared-background context, received-state supporting panel |
| `danger` | `#A4462F` | Error text, destructive action, paired with explicit wording |
| `control-border` | `#7B8580` | Input boundary and necessary control outlines |
| `divider` | `#D7DDD6` | Decorative separation only, not the only input boundary |

Contrast was calculated locally using the WCAG sRGB relative-luminance formula. Results are rounded for display only; all tested values exceed their stated threshold before rounding. These calculations cover opaque pairs only; later opacity, overlays, images, hover states, disabled states, and new tokens require checks.

| Foreground / background | Ratio | Intended use |
|---|---:|---|
| Ink / canvas | 11.34:1 | All text |
| Ink / white | 12.57:1 | All text |
| Muted ink / canvas | 5.73:1 | Supporting text |
| Muted ink / white | 6.35:1 | Supporting text |
| White / primary | 8.07:1 | Buttons |
| White / danger | 6.01:1 | Destructive buttons |
| Ink / accent | 6.29:1 | Highlight labels |
| Ink / soft context | 9.90:1 | Shared-context panel |
| Control border / white and canvas | 3.81:1 / 3.44:1 | Necessary control boundary |

Normal text needs at least 4.5:1; large text has a 3:1 threshold. Treat contrast as part of component acceptance, including placeholders and helper text. Do not put body text over photography. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

**Typography:** Newsreader 500 for public hero/editorial headings; Public Sans 400/600 for application headings, body text, forms, and controls. Avoid mixing serif into dense chat and moderation tables. Use these two families only, with Georgia/system sans fallbacks while font assets load. The repositories include SIL OFL 1.1 licenses: [Newsreader](https://github.com/google/fonts/blob/main/ofl/newsreader/OFL.txt), [Public Sans](https://github.com/google/fonts/blob/main/ofl/publicsans/OFL.txt). Preserve notices with distributed font files. Self-host only the needed subsets/weights, use `font-display: swap`, and verify fallback layout. Neither assets nor language coverage have been installed or measured here.

| Role | Mobile → desktop size | Line height | Rule |
|---|---|---|---|
| Public hero | 38 → 64 px, fluid and capped | 1.06–1.12 | 10–14 characters per visual line where copy permits; no forced line breaks on small screens |
| Page title | 30 → 40 px | 1.15 | One clear H1 |
| Section title | 24 → 32 px | 1.2 | Content first, no decorative all-caps sentences |
| App section heading | 20 → 24 px | 1.25 | Public Sans 600 |
| Body | 16 → 18 px | 1.5–1.6 | Public copy width about 60–68 characters |
| Form input | 16 px minimum | 1.5 | No tiny text to fit more fields |
| Metadata | 14 px | 1.45 | Do not use for critical consent or error information |

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Desktop public sections use 64 or 96 px vertical separation; mobile 32 or 48 px. Application panels use 16 or 24 px padding and 12 or 16 px within one group. Group closely related details, leave more distance between tasks. Keep rhythm consistent; visual personality comes from content scale and composition, not random offsets.

Radius: 4 px inputs; 6 px buttons; 10 px ordinary panels; circles only for avatars or genuinely circular controls. Status labels use compact rectangles. Elevation: normal pages rely on surface/border contrast; a dialog/popover may use one restrained shadow. No glowing borders. Use a two-layer focus indicator: a 2 px white inner halo and a 3 px ink outer ring, so a layer contrasts with each light/green surface. CSS outline-offset alone is transparent and does not create that halo. Verify composed states and forced-colors mode.

## 4. Layout and visual identity

Public content max width 1200 px, application content max width 1360 px. Use 20 px side gutters at narrow widths, 24 px at tablet, 32–48 px on desktop. Layout changes are content driven; initial thresholds are 640 and 1024 CSS px. At 320 CSS px, forms and reading content must reflow without sideways scrolling; wide tables get their own labeled scroll region or stacked representation. [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

Public desktop hero: about 7/12 width copy, 5/12 width real member story/photo. A small caption explains the person's shared background and destination only with consent. Below it, one numbered three-step sequence separated by rules, then an honest community story and safety explanation. Use no fake member faces, testimonial stars, logo wall, countdown, or invented community size. If permissioned photography is unavailable, launch with an intentional typographic composition and a factual explanation of the founding cohort; do not pretend a stock model is a member.

Product identity appears in three places: a thin route line between an optional origin and destination; a specific shared-context sentence on a person result; and a short member-written help statement. Do not repeat passport stamps, flags, flight paths, or suitcases across every component. Origin/destination never implies nationality or immigration status.

**Asset brief:** two consented founder/community portraits in ordinary lived settings; one environment image relevant to the first corridor; one real product screenshot after the feature works. Record creator, license, consent scope, alt text, crop, and file dimensions. Avoid publishing precise residences, document numbers, or identifiable bystanders. Use responsive AVIF/WebP with fallback as supported, fixed aspect ratios, focal points, and an initial compressed hero budget of 150–250 KB. Do not lazy-load the likely LCP image. These are engineering budgets to test, not measured results.

## 5. Screen contracts and route copy

Paths below are the new application's canonical frontend routes, implemented through one React Router route definition. Use React Router Framework Mode with Vite, `ssr: false`, and an explicit prerender allowlist of approved public routes; no Node SSR production service is required. Public server fallback/status behavior must follow the implementation plan and SEO audit; a plain Vite SPA build alone does not satisfy that public-page contract. Member discovery and chat must not enter the public prerender list. [React Router prerendering](https://reactrouter.com/how-to/pre-rendering), [SPA mode](https://reactrouter.com/how-to/spa)

Complete every core screen below, plus password recovery/reset, supported email-verification states, shared application navigation, not-found/access-denied states, and the public how-it-works/safety/privacy/terms surface in the main plan. Start with representative screens to agree the shared UI, then finish the full frontend. Do not expand into feeds, jobs, paid ranking, or other deferred product modules. Draft policy copy cannot claim legal review or capabilities that do not exist.

Until backend implementation, use one typed API module and explicitly labeled deterministic local demo/test fixtures to exercise the screens, including success and failure. Show **Sample data** and keep the demo session in memory. Demo data and authentication are not real services: never transmit credentials to third parties, publish fictional member counts, or fall back to simulated success when a real API fails. Keep the fixture switch explicit and disabled in a production build. Normal API mode shows unavailable/error states until Spring endpoints exist; it must never claim a real account, saved report, or persisted message. Record endpoint/request/response needs for the future Spring backend. Frontend completion and integrated product readiness are separate milestones.

| Screen / proposed path | Main composition and copy | Primary action and done condition |
|---|---|---|
| Landing `/` | H1: **Move abroad with people who understand your journey.** Subhead: **Find people preparing for a similar move and people already living there, through the communities and experiences you share.** Only say this after those flows work. | **Join the founding community** opens working signup. **See how it works** jumps to a real explanation. |
| Signup `/signup`, login `/login` | Simple single-column form; explain early access and link privacy/terms before submission. Keep email/password labels persistent. Do not bundle marketing consent into account acceptance. | **Create account** / **Log in**. One in-flight request, clear recovery on failure, no dead CTA. |
| Onboarding `/onboarding` | At most three small steps: **Your journey**, **Shared background**, **How you'd like to connect**. Show text progress and Back. | **Save and continue**, then **Find people**. A usable profile is saved; optional details remain skippable. |
| Discovery `/people` | H1: **Find people with a shared starting point.** Search and a small set of supported filters, results list, shared context, current/planned location, help topics. Desktop narrow filter rail plus readable rows; mobile filter disclosure and one-column rows. | **View profile**. Filters have real results and are recoverable with Back. |
| Member profile `/people/:id` | Name, self-described journey, shared context, short bio, **I can share experience with...**, connection state. Keep details aligned in one reading column and contextual panel. | **Ask to connect** opens an optional introduction. No message button before access policy permits it. |
| Own profile `/settings/profile` | Editable labels, explicit field visibility explanation, preview of what another member sees. Optional avatar and background fields. | **Save profile**. Saved state only after server success; failures preserve edits. |
| Connections `/connections` | **Requests** and **Your connections**, with separate received/sent states. Rows show introduction and clear Accept/Decline/Cancel controls. No feed-like noise. | **Accept request**, then **Start conversation** where live. Changes reflect confirmed server state. |
| Chat `/messages/:id` | Desktop conversation list + transcript, mobile one view at a time with labeled Back. Participant name and accessible actions menu remain visible. | **Send message**. Persisted message shows server-confirmed state, failed send offers retry without duplicate creation. |
| Report `/report` or contextual dialog | H1: **Tell us what happened.** Reason, optional details, relevant item context, privacy explanation, separate block choice. | **Submit report**. Server-confirmed receipt; **Block member** separately executes and reports its own result. |
| Account/privacy `/settings/privacy` | Visibility explanation, blocked members, notification preferences if supported, deletion/contact process. | Clear save and deletion request outcomes; deletion requires explicit confirmation and truthful retention wording. |
| Admin `/admin/reports` | Efficient queue, reason, time, severity, status, owner. Detail view separates submitted evidence from moderator notes and actions. | **Assign**, **Resolve report**, or contextual moderation action. Server role checks and audit record required. |

### Onboarding specifics

Ask only for what makes the launch network useful: display name, planning/already abroad journey, destination/current country, one relevant community or background signal, and a short connection intent. Actual required fields follow the backend validation and founder interviews. Include **Prefer not to share** where a field is optional. College, hometown, languages, and community are self-described; do not infer ethnicity, religion, visa status, or nationality.

Visibility copy must reflect real policy: for example, **Visible to signed-in members** only when the API enforces that. Email, private messages, reports, and exact residence are never part of the member-visible profile preview. Profiles remain private at beta launch. Do not collect passport scans, visa documents, precise moving dates, exact home addresses, or a phone number to increase completion. If a profile completion checklist exists, reward relevance, not excessive disclosure.

### People discovery and profiles

Use one result type, not a bento arrangement of people. Name links to profile; connection actions are separate buttons rather than nested interactive elements. Display an actual matching explanation such as **You both listed the same college** only if both attributes may be shared. Never fabricate a match score or label someone **Verified** because they confirmed an email.

Show only supported filters with meaningful inventory. Persist non-sensitive filter state through React Router search parameters; never put private query content into analytics automatically. Provide **Clear filters**, result count, bounded pagination, and a useful no-results route. No-results copy: **No matching members yet. Try fewer filters, or return as the founding community grows.** Invite sharing is optional and never a prerequisite for discovery.

### Connections and chat

Design explicit connection states: self, eligible to request, sending, request sent, incoming request, accepting, connected, declined/cancelled, blocked, and unavailable. Decline and cancellation semantics must match the server. Do not reveal a block through a public badge. Avoid optimistic success for requests, reports, blocking, and moderation actions.

Suggested introduction helper: **Mention what you share and one question you'd like to ask.** Optional example: **We studied at the same college. I'd like to learn about settling into university life.** Do not send any text automatically. Resident availability is self-reported if supported; no invented response-time promises.

An accepted connection is required to start/send in beta. Blocking stops new contact and removes mutual discovery; historical conversations follow the documented retention policy and are not silently deleted. Mirror these states in the UI and enforce them server-side.

Chat states: loading history, empty conversation, sending, sent, failed, offline/reconnecting, older history loading, blocked/restricted. Display dates and sender labels without relying on bubble color alone. Do not claim read receipts, encryption properties, online presence, or delivery guarantees unless implemented. When new messages arrive, keep readers in place if they are reviewing older history and offer **New messages**. Preserve an unsent draft in the current session; persistent draft storage needs a separate privacy decision. Test mobile keyboard and safe-area behavior so the composer and Send button remain reachable.

### Reports and moderation

Keep safety actions easy to find from profile and conversation. Receipt copy: **Your report was received. The moderation team will review it.** Add a response window only when the operating team can meet it. If reports save but blocking fails, say so clearly; two outcomes must not be combined into a false success message. Moderators should see the least information needed for their task. No unrestricted chat browsing by default.

## 6. Shared interaction and accessibility acceptance

Each async task needs idle, submitting/loading, success, recoverable error, and access-denied states. Reserve loading space. Keep errors near the field and provide a linked summary after submission; focus the summary, preserve entries, and make messages specific. For account login, use a generic credential error that does not reveal which account exists. These recovery choices follow the [GOV.UK validation pattern](https://design-system.service.gov.uk/components/error-summary/).

Use semantic links for navigation and buttons for actions. Every input has a visible label and programmatic association; help/error IDs are associated with the field. Keep password-manager and paste support. A visible password toggle announces its state. Do not set positive `tabindex`. Icon-only actions have names; decorative icons beside text are hidden from the accessibility tree.

Primary controls aim for 44 × 44 CSS px with about 8 px separation; dense text links may remain inline with clear focus. This exceeds the [WCAG 2.2 minimum target-size rule](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) in ordinary controls. Measure rendered hit areas, not just SVG dimensions.

Dialogs have an accessible name, initial focus, contained keyboard navigation, Escape/visible close behavior, and focus restoration. Destructive confirmations explain the consequence and keep a clear cancel route. Use a tested headless primitive and verify the composed dialog rather than recreating focus trapping. [WAI modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

Maintain visible focus, logical DOM order, skip navigation, clear current-page indication, and screen-reader announcements for meaningful completion/failure. Sticky headers, mobile navigation, and cookie banners must not cover focused elements or form errors. Do not announce the entire chat transcript again for each message. Respect reduced motion and high-contrast preferences.

Motion is optional polish after reliability: 120–180 ms color/opacity feedback; a 160–220 ms dialog transition. No scroll-jacking, animated counters, auto-playing carousel, parallax, cursor replacement, or forced page reveal. Essential content is visible without animation. Use CSS transitions; a simple hover transition does not justify a new dependency.

## 7. Apply the ten pasted design concerns with judgment

| Pasted concern | ConnectAbroad decision | Guardrail |
|---|---|---|
| Purple/indigo gradients | Solid paper, ink, green actions, sparse marigold | Color expresses this identity; purple itself is not a usability defect. |
| Everything heavily rounded | Defined small radii; circular portraits | Reuse functional component shapes; do not make inputs hard to recognize for novelty. |
| Generic type | Editorial Newsreader headings plus Public Sans UI | Readability, real content, and hierarchy matter more than a font blacklist. |
| Uniform thin icons | Choose one free/open-source icon family only if needed for actions; remove redundant heading decoration | Bespoke icon libraries and emoji do not inherently improve usability. Use labels and accessible names; retain the selected set's license. |
| Dark by default | Warm light public and app surfaces | Defer a second theme until there is demand and a full state audit; respect forced-colors now. |
| Border glows/glass | Opaque surfaces, necessary control borders, restrained overlays | Separation must remain perceptible on low-quality screens. |
| Repeated three-card sections | Numbered process, story split, useful result rows | Discovery benefits from consistency; do not turn people into arbitrary bento sizes. |
| Pill over every headline | Early access explained in ordinary text where relevant | Keep genuine status labels inside task contexts. |
| No authentic photography | Consent-based portraits and a real product screenshot | No stock-person testimonial, invented biography, or generated face presented as a member. |
| Mechanically balanced spacing | Vary public section rhythm and information hierarchy | Keep grid alignment, grouping, reading order, and stable hit areas; never add overlaps just to appear human. |

## 8. Build order, evidence, and stop condition

1. Inspect the destination folder to avoid overwrites, then scaffold `frontend/` using the chosen stack. Establish canonical routes, semantic tokens, API types, and the explicit demo/test fixture boundary. Do not wait for nonexistent legacy source.
2. Build and review the representative landing/discovery/mobile-chat slice, then complete every core frontend screen and state. With no backend, demonstrate the loop using labeled fixtures and list integration gaps; never label that proof of persisted real conversations.
3. Establish the shared components used by these routes: page container, button, form field, alert, person result, status, dialog, avatar fallback, and navigation. Add only what actual screens need; do not build a new generic design-system package.
4. Review landing, discovery, and profile at mobile/desktop before filling in remaining routes. Capture deterministic synthetic fixtures with long names, absent avatars, zero matches, many topics, slow network, error, blocked state, and two roles. Never seed invented social proof into production.
5. Test with five target users across movers and residents. Give tasks without directing their clicks: explain the service, create a profile without exposing an email, find a relevant person, make a respectful request, and find report/block. Record observed completion, hesitation, and errors. Working target: at least four of five independently finish each critical task; failures drive fixes rather than a claim of statistical validation.
6. Capture final screenshots and an evidence checklist after the frontend exists. A reviewer checks the following gates and records actual results; blank evidence means unverified.

| Gate | Measurement / proof |
|---|---|
| Responsive | 320, 360/390, 768, 1024, 1440 CSS px; no page overflow, clipped labels, covered CTA, or overlapping text |
| Content stress | Long multilingual names, large font settings, 200% zoom, 320 CSS px reflow; no essential ellipsized consent or actions |
| Keyboard | Entire signup-to-connection path, visible focus, modal close/return, filter reset, report submission |
| Screen reader | Manual smoke test in one available browser/screen-reader pairing; labeled fields, meaningful errors, correct status announcement and chat reading order |
| Contrast | All real component pairs and states checked, including focus, link/hover, disabled explanatory text, image captions, selected filters |
| Async | Slow/offline/reconnect, repeated tap, invalid input, expired session, server failure, empty result, stale connection state, failed report and block independently |
| Visual | Consistent tokens, 1 clear primary action per task region, permissioned assets, no fake metrics or testimonials, no placeholder/dead links |
| Performance | Repeatable mobile lab run and asset inspection; field LCP/INP/CLS after sufficient live traffic, as specified in SEO audit |
| Safety | Profile preview agrees with API visibility; blocked people cannot bypass UI restriction through the API; report receipt is real; private data absent from search previews and telemetry |

Automated accessibility checks help find defects but do not establish compliance. Do not promise a Lighthouse score before a site exists. Frontend completion requires every scoped route and state, passing local build/type/lint checks and focused interaction tests, responsive screenshots, and manual keyboard/error recovery evidence. Do not stop after the representative slice. Real backend authorization/persistence, five-user walkthroughs, production hosting, and field performance are separate integration/release evidence; mark unavailable checks pending without claiming them passed or halting independent frontend work. Once all frontend acceptance conditions are met, stop adding visual features and hand off the exact integration gaps.

Not checked here: scaffold/build, asset availability, browser/screen-reader behavior, backend integration, or actual performance; this revision changes plans only. The future Claude task is authorized to create the frontend now. Its finished demo must remain distinguishable from a launched product, and no design choice guarantees conversion or market leadership.
