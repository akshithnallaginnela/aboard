# ConnectAbroad: prelaunch SEO audit and implementation specification

Audit date: 16 October 2026 (Asia/Kolkata). Scope: the supplied `ConnectAbroad_Product_and_First100_User_Blueprint (1).docx`, the refined planning pack, and the user's greenfield/₹0 direction. This is a **plan audit** for a new application: React + Vite + TypeScript frontend, Spring Boot + PostgreSQL + WebSockets backend, and a local Podman/Caddy baseline. No implementation, production URL, Search Console property, traffic data, crawl, or performance measurements are claimed. New application work can start from this specification; an old repository is not a prerequisite. No numeric SEO score, ranking forecast, keyword volume, or market-leading claim is justified.

## Executive decision

Carry forward the source plan's strongest product choices: one reachable cohort, useful introductions, honest claims, privacy, and founder-led recruitment. Build a small, carefully edited public website around the new private product. Keep additional spending at ₹0: use local/open-source build and inspection tools, no purchased domain, paid keyword service, SEO subscription or extra rendering service. SEO should compound useful community knowledge over time; it is not the dependable acquisition channel for the 15 November first-100-users milestone.

The competitive opportunity is original, permissioned knowledge from a useful cohort: specific questions, candid resident experiences, transparent community availability, and safe introductions. An AI-written destination directory cannot substitute for actual community supply. Google's guidance favors original, useful information and identifiable authorship; apply that to the editorial workflow. [People-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Findings and corrections applied to this specification

Severity means launch priority, not an observed production failure. **Applied** below means the plan now contains the correction; every code check remains **pending implementation**. Owners are roles to assign, not people already hired.

| ID / priority | Evidence in current source plan | Correction applied here | Implementation acceptance / owner |
|---|---|---|---|
| SEO-01 / P0 | §§3–4 require profile privacy but do not define public indexing boundaries. | Public-route allowlist; member discovery, profiles and conversations private at launch. | Anonymous requests and shared caches reveal no member data; route matrix tested. Backend owner + security reviewer. |
| SEO-02 / P0 | §1 proposes discovery through college, hometown and destination; no policy for generated combinations. | Only a manually approved, genuinely useful cohort hub may be indexed. No automatic city × college × language directory. | No combination URLs in sitemap or crawlable public navigation. SEO + frontend owners. |
| SEO-03 / P0 | §§2 and 9 prohibit false claims; no editorial provenance workflow exists. | Author, source, consent and review requirements; official sources for consequential facts. | Review a complete draft and its evidence before publication. Founder/editor. |
| SEO-04 / P0 | §§3 and 10 lack a rendered-page contract; the chosen Vite SPA does not itself provide route-specific public HTML. | Build-time rendering of approved public routes; public content/links in initial HTML; per-page metadata and real HTTP status codes. | Inspect generated files and HTTP responses for every public template; test a nonexistent public URL returns 404. Frontend owner. |
| SEO-05 / P1 | §6 favors organic recruitment but does not define search conversion attribution. | Track organic landing → registration → activation with consistent windows and privacy limits. | One test journey appears once in the funnel; no sensitive fields or message text collected. Analytics owner. |
| SEO-06 / P1 | No sitemap, canonical or URL retirement policy. | Canonical production URLs, allowlisted sitemap, tested deletion/unpublish handling. | Sitemap contains only eligible 200-status public pages; deleted pages disappear from sitemap. Backend owner. |
| SEO-07 / P1 | No external-link or UGC search-spam policy. | Moderation, `ugc` links, disclosed sponsored links; no purchased ranking links. | Rich-text sanitization and link-attribute fixtures pass. Backend + moderation owners. |
| SEO-08 / P1 | No performance evidence or budget; richer design is newly requested. | Public pages get an explicit performance gate and mobile interaction review. | Lab baseline recorded; field CWV evaluated only when data exists. Frontend owner. |
| SEO-09 / P1 | No structured-data strategy. | Minimal truthful Organization/Breadcrumb markup; optional Article for actual guides. No FAQ rich-result promise. | Markup matches visible content; validators run for implemented types. SEO owner. |
| SEO-10 / P2 | No international-content maintenance plan. | One English version first; localized versions only with human review and ongoing maintenance. | No unreviewed machine-translated pages or unsupported destination claims. Editor. |

Google treats low-value pages produced mainly to manipulate rankings as scaled content abuse, regardless of production method. Similar location pages funneling to the same destination can also be doorway abuse. These policies support SEO-02; they do not prohibit genuinely useful, distinct community pages. [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

## Route and indexability contract

The deployment baseline is one origin: Caddy serves static public/app files and proxies `/api` and `/ws` to Spring. A Pages frontend and Render API on separate provider domains require real credentials/CORS/CSRF/cookie-policy testing before member accounts are enabled; otherwise keep that split-host preview synthetic/demo-only. Frontend noindex or route guards do not resolve cross-site session behavior.

Define these routes under `frontend/` using React Router **Framework Mode on Vite**, with `ssr: false` and an explicit public `prerender` path list. One shared route inventory classifies approved public pages, public utilities, private application paths and the not-found route; build output, metadata and sitemap must agree with it. Dynamic private paths never become a public page-generation input. “Eligible” never promises Google indexing. [React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering).

| Route / resource | Anonymous visibility | Search policy | Sitemap |
|---|---|---|---|
| `/` | Accurate product description and working join CTA. | Eligible; self-canonical. | Yes. |
| `/how-it-works`, `/about`, `/safety` | Real process, team/contact facts, safety limits. | Eligible when substantive. | Yes when published. |
| `/communities/{chosen-cohort}` | Curated overview, real availability, approved editorial contributions. | Eligible only after publication gate below. | Yes after approval. |
| `/guides/{slug}` | Complete useful editorial article. | Eligible after editorial review. | Yes after approval. |
| `/privacy`, `/terms`, `/community-guidelines` | Full current policies; always easy to find. | Public; normal crawlable pages. No search-traffic target. | Optional, consistent with site policy. |
| `/login`, `/signup`, reset/verify pages | Forms only; reset/verify tokens never exposed to crawlers or analytics. | `noindex`; no token-bearing URLs in public navigation. | No. |
| Member search, filters, feeds, connections, notifications, saved items | Authentication plus intended authorization. | Private; `noindex` on any non-sensitive HTML shell as defense in depth. | No. |
| Member profiles | Private at launch; only authorized member fields. | Private, excluded. Future public mode requires separate explicit opt-in and revocation tests. | No at launch. |
| Chats, admin, reports, account data, private media/API endpoints | Server-enforced authentication/authorization; private caching rules. | Private; never rely on robots directives for access control. | No. |
| Preview/staging/test builds | Deployment-level access control. | Excluded; `noindex` on accessible non-sensitive previews as backup. | No. |
| Unknown, removed or invalid public URLs | Helpful explanation with no removed personal content. | True `404` or `410`, not a 200 error page. | No. |

The table specifies the production security contract for the future Spring backend. A static application shell can be public if it contains no member data; Spring must authenticate/authorize every protected request before returning any private content. Client redirects and demonstration fixtures do not establish security. Keep synthetic fixtures in development/test builds; a demo must identify its status and never claim it has real members or protected production data.

Use `noindex` for crawlable public utility pages; Google must be able to fetch the page to see the directive. `robots.txt` controls cooperative crawling and cannot secure data or reliably remove an already known URL from results. For private pages, enforce access immediately; never open private data to let a crawler read `noindex`. [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

Member search stays behind authentication, avoiding a public filter URL space. If public filters are introduced later, document a separate crawl strategy before release. Do not combine a robots disallow with an expectation that the same page's `noindex` will be read. Avoid publishing endless parameter permutations. [Faceted-navigation guidance](https://developers.google.com/crawling/docs/faceted-navigation).

**Community hub publication gate:** the named cohort actually exists; there is a named editor/moderator; the page answers a distinct user need; any statistics are dated and auditable; contributors approved publication; an anonymous visitor receives useful information before signup; the advertised connection path works. No fixed word count or invented minimum-member threshold establishes quality. If supply disappears, remove misleading availability claims, preserve useful editorial material if still accurate, otherwise unpublish.

**Profile opt-in, if later justified:** separate consent for public web/search visibility; show exactly the fields that will be published; default off; never publish contact information, precise address, documents, or sensitive migration status. On revocation, immediately stop anonymous access, purge public caches/previews, remove sitemap/internal public references, and return a generic non-identifying 404 at the former public URL. Search removal is not instantaneous; use the removal process for urgent exposure. [Google removal guidance](https://developers.google.com/search/docs/crawling-indexing/remove-information).

## Public page implementation requirements

1. Build public pages with React Router Framework Mode's Vite integration and built-in pre-rendering: set `ssr: false`, explicitly list approved public paths, and emit meaningful route-specific HTML at build time. No custom ReactDOM renderer, production Node SSR server or paid prerender service is required. Include descriptive `<a href>` links, correct metadata and useful text in the initial response. A default Vite SPA shell or client-only metadata update does not satisfy this contract. [React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering), [JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
2. Give each eligible page a descriptive title, visible main heading and accurate meta description. Avoid repeated boilerplate and exaggerated claims. Titles/snippets may be rewritten by Google; length previews are editorial aids, not guarantees. [Title guidance](https://developers.google.com/search/docs/appearance/title-link), [snippet guidance](https://developers.google.com/search/docs/appearance/snippet).
3. For a public deployment, configure its actual HTTPS hostname and a consistent slash policy; a paid domain is not required. Use absolute self-canonical URLs for eligible pages. Tracking variants should canonicalize to the clean equivalent; unrelated pages must never canonicalize to the homepage. Canonicals, internal links and sitemap must agree. A local-only build does not publish a sitemap or advertise `localhost` as a production canonical. [Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
4. Maintain one small sitemap from explicitly published public pages. Include absolute canonical URLs, not private routes, search results, redirects, errors, unapproved drafts or thin placeholders. Only change `lastmod` for a substantive update. Submit after production checks; submission guarantees neither crawling nor indexing. [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
5. Add descriptive image alt text where informative, proper dimensions, compressed modern images, readable text, keyboard navigation and visible focus. Do not put essential copy solely in an image or animated globe.
6. Start with truthful Organization metadata on the home page and BreadcrumbList where visible hierarchy exists. Use Article only for actual editorial articles with real authors/dates. Never invent ratings, jobs, credentials or affiliation. Structured data must describe visible content and does not guarantee an enhanced result. [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
7. Keep useful on-page questions and answers if users need them. Do not implement FAQPage markup for a Google FAQ rich-result objective: Google stopped showing that feature from 7 May 2026 and removed its documentation in June. [Google documentation updates](https://developers.google.com/search/updates).
8. Sanitize submitted HTML/URLs and moderate spam before it becomes public. Mark member-submitted external links `rel="ugc"` (plus `nofollow` when appropriate), paid/affiliate placement links `rel="sponsored"`, and visibly disclose sponsorship. Link attributes do not replace moderation or security validation. [Outbound-link guidance](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

### Build output and hosting gate

Use the framework's built-in pre-rendering instead of writing a rendering framework. Configure an explicit path array from the approved public-page inventory; do not use `prerender: true` to indiscriminately render every static application route. Public route modules supply their truthful content, title/description/canonical/robots metadata. Utility pages may also get static documents with `noindex` and no sitemap entry. Private member records, authenticated loaders and development fixtures never enter public build artifacts. [React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering).

Private routes are client-rendered from a non-sensitive application shell and call the Spring API through the agreed `api.ts` client. Configure the host to use the framework-generated SPA fallback for declared client-route patterns; verify its actual filename/output with the selected version rather than assuming a generic `index.html`. Serve generated public files before application rewrites. Never apply a blanket “every unknown path → SPA shell, status 200” fallback to the public website: `/guides/not-a-real-guide` must receive a genuine 404. Keep a helpful `404.html`; redirects, utility pages and the SPA shell are not sitemap entries. No private media/API payload belongs in the public static directory. [React Router SPA hosting](https://reactrouter.com/how-to/spa).

The local baseline is Caddy serving the static output and routing API/WebSocket requests to Spring. Configure its known application-route patterns separately from public-file and not-found handling. Verify known public routes, known application routes, trailing slashes, removed pages and nonexistent public routes over HTTP. A static-file existence check alone cannot prove HTTP status behavior.

An optional free static host, such as Cloudflare Pages, is a proprietary hosted service, not fully open-source infrastructure. Before adopting it, verify current free limits, deployment rules, route rewrites, 404 handling and actual HTTP responses. It does not host Spring/PostgreSQL merely because the frontend deploys. If the chosen free host cannot meet the route/status contract, retain the local Caddy baseline; do not add a paid service or another SSR server. A public hostname, reachable backend, safe persistence and uptime remain separate deployment prerequisites. Local development does not prove production availability at ₹0.

Required small build self-check: for every generated public route, assert its expected heading/useful body text and title are in the HTML before JavaScript, internal public links resolve, metadata and sitemap agree, and neither private routes nor development fixture markers appear in the public sitemap/output. Fail on duplicate canonical destinations, missing content or a private payload. Then run the Caddy/selected-host HTTP checks above. These checks are specified, not yet executed.

## Copy and URL examples

These are drafts, not published claims. Use the community variant only after selecting a real corridor and passing the publication gate. No actual destination is chosen by this audit.

| Page | Proposed title | Proposed main heading | Proposed meta description |
|---|---|---|---|
| `/` | `ConnectAbroad — Meet People Before You Move Abroad` | `Move abroad with people who understand your journey.` | `Find people with shared roots and lived experience abroad. Join ConnectAbroad's founding community to ask practical questions and make relevant connections.` |
| `/how-it-works` | `How ConnectAbroad Works — From Profile to Connection` | `Find a relevant person. Start a useful conversation.` | `See how profiles, discovery and connection requests work, what members can see, and how to report a concern before joining ConnectAbroad.` |
| `/safety` | `Safety and Privacy — ConnectAbroad` | `Connect with clear boundaries.` | `Understand profile visibility, respectful introductions, reporting and the limits of peer advice on ConnectAbroad.` |
| `/communities/{approved-cohort-slug}` | `[Real cohort] Community Abroad — ConnectAbroad` | `Meet people from [real cohort] making a similar move.` | `Explore practical questions and approved experiences from [real cohort]. See who this founding community serves and how to join.` |
| `/guides/contact-alumni-abroad` | `How to Contact Alumni Abroad — Message Examples` | `Ask alumni abroad for help without making it awkward.` | `Use a short, respectful introduction, choose specific questions, and set clear boundaries when contacting alumni living abroad.` |

For a prelaunch waitlist, replace “join”/connection claims with accurate waitlist wording and expose the real status. Never show “verified residents”, live member counts, response-time claims, official college logos or testimonials without evidence and permission. The source blueprint already requires this honesty; SEO implementation must preserve it.

## First five content briefs

These are **intent hypotheses**, selected for fit with the core product rather than measured keyword demand. Validate wording in interviews and Search Console after launch. Publish one excellent piece first; the list is a backlog, not permission to generate five thin posts.

| Priority / URL | Reader intent / draft title | Required original value and evidence | Reader's next action / owner |
|---|---|---|---|
| 1. `/guides/contact-alumni-abroad` | “How do I approach someone from my college?” — *How to contact alumni abroad: respectful message examples*. | Three founder-tested message examples, what a useful question looks like, consented feedback from alumni, follow-up boundaries. No scraped LinkedIn profiles. | Use an example; join the actual cohort. Founder/editor. |
| 2. `/guides/questions-before-moving-abroad` | “What should I ask someone already there?” — *Questions to ask a resident before your move*. | Original interview synthesis separated into daily life, settling in, social support and experience limits; date/location context and official-source links for changing facts. | Save questions; ask a relevant member. Editor + resident reviewer. |
| 3. `/guides/share-experience-safely` | “I live abroad; how can I help without being overwhelmed?” — *Share your experience with boundaries*. | Examples of a bounded introduction, availability wording, information to keep private, and how to decline politely; real resident review. | Set availability and privacy preferences. Community operator. |
| 4. `/guides/evaluate-peer-advice` | “Can I trust advice in a group?” — *How to evaluate peer advice about moving abroad*. | Concrete verification checklist; distinguish lived experience from professional advice; official authority handoff for visa/legal/financial decisions; reporting examples. | Check sources; learn the safety/report flow. Trust/safety editor. |
| 5. `/communities/{approved-cohort-slug}` | “Are there people from my community in my destination?” — *[Real cohort]: practical connections abroad*. | Unique approved interviews, genuine community scope, dated availability, responsible moderator and working join path; no personal member directory by default. | Join the actual cohort or see honest availability. Founder + cohort moderator. |

Every brief must produce a source log, real byline, relevant author background, publication/review date, approved quotation permissions and a correction/contact route. For consequential or changing facts, verify current official authority pages at publication and schedule a review; do not substitute an AI disclaimer for factual review. Write about lived experience within its limits. [People-first content and authorship](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Agent workflow and editorial controls

The SEO/content agent receives the real cohort brief, approved page inventory and evidence log. It proposes a single page with search intent, reader task, title, heading, internal links, source dates and an honest CTA. The design agent checks readability/mobile layout; the security reviewer checks data exposure; the editor approves factual claims and publication consent. One integrator owns shared templates and final merge.

Agents may draft, check links, compare metadata and prepare a QA report. They must not fabricate interviews, credentials, demand estimates, communities, testimonials or firsthand experience. Public posting, outreach, paid placement and publication remain separate authorized actions. No autonomous bulk content, backlink purchasing or mass Reddit promotion is part of this plan.

## Launch QA: evidence required before public promotion

- [ ] Founder assigns backend, frontend, editorial, moderation and analytics owners; unowned blockers stay closed.
- [ ] Run the build self-check and inspect each generated public page as an anonymous visitor at mobile and desktop widths; meaningful content and primary links are present before JavaScript, then remain correct after it loads.
- [ ] Anonymous/member/admin tests prove private routes and APIs expose only permitted data. Check page source, JSON hydration, Open Graph previews, sitemap, analytics and caches for leakage.
- [ ] Crawl only the allowlisted public surface with local/free tools. Check links, 200/redirect/404 behavior, unique descriptive titles, headings, canonicals, image alternatives and complete useful content. Request an unknown public route directly to detect a soft 404 from a blanket SPA fallback.
- [ ] Check `robots.txt`, robots meta/headers and environment access controls together. Confirm production eligible pages are not accidentally `noindex`; confirm previews and utilities are excluded.
- [ ] Compare sitemap URLs with actual published eligible pages; every entry is canonical, 200-status, anonymously accessible and intended for search.
- [ ] Run structured-data validation for each implemented type. Record errors and fixes; do not treat a passing validator as a rich-result guarantee.
- [ ] Inspect mobile performance for `/`, an approved guide and an approved hub; record test URL, commit, device/network settings and results. Test signup separately as a conversion path.
- [ ] Target field p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1, segmented by mobile/desktop when enough real visits exist. At launch record lab diagnostics; Lighthouse alone cannot prove real-user INP or a field CWV pass. [Web Vitals guidance](https://web.dev/articles/vitals).
- [ ] If a public deployment exists, verify Search Console ownership using the verification methods available for its actual hostname, submit the verified sitemap and inspect representative public URLs. Check security/manual-action reports after access is available. No purchased domain or paid SEO tool is required; local-only builds have no live search coverage to inspect.
- [ ] Run one privacy-respecting organic-source test journey through registration and activation; exclude staff/test activity and verify no duplicate events.
- [ ] Test unpublishing a guide and revoking any future public profile: content and caches stop being public, sitemap updates, old URL behavior is correct, urgent removal procedure is documented.
- [ ] Review every advertised feature, logo, number and quote against evidence. Remove unsupported claims before publication.

## Weekly measurement and decision rules

| Measure | Definition / interpretation | Action |
|---|---|---|
| Eligible pages vs indexed pages | Compare the approved inventory with Search Console's actual coverage and inspected samples. Excluded private pages are expected. | Investigate unexpected exclusions; never make private pages public to improve an index count. |
| Organic impressions, clicks and CTR | Segment by page, query, country and device; separate brand/non-brand where data allows. Low-volume results remain uncertain. | Improve intent match and factual usefulness before adding pages. |
| Organic registration conversion | Successful registrations attributed to organic landing sessions, with an explicitly documented attribution window. | Diagnose broken links/signup friction; avoid comparing incompatible analytics/Search Console denominators. |
| Organic cohort activation | Within seven days: profile completion plus the agreed meaningful action. Report count and rate, with cohort size. | Favor pages attracting relevant members over traffic that never activates. |
| Successful connections / replies | Aggregate outcomes for the agreed seven-day window; no message bodies in analytics. | Check whether acquired users find actual value and available peers. |
| Performance and safety | Available field CWV, failed public page requests, spam reports and exposed-data incidents. | Fix privacy/reliability first; remove abused pages from public access while resolving incidents. |

At 30 days, inspect which useful pages attracted relevant members and what questions remain unanswered. At 60–90 days, expand only if original contributions and editorial capacity support another cluster. These are review cadences, not promises that SEO will deliver a particular number of users or revenue.

## Audit completion status

Applied to the planning specification: greenfield React/Vite route boundaries, build-time public HTML without an additional SSR service, the ₹0/local-hosting constraint, content quality gate, metadata examples, editorial briefs, publication controls, measurement definitions and launch checks. Start the application from this specification. Pending after implementation: the build self-check, local HTTP/accessibility/performance checks, and backend privacy tests. Pending only if/when a public deployment exists: live crawl, Search Console verification, production performance/indexing observations and production data-removal tests.

Skipped: paid keyword tools/domains/prerender services, fabricated volumes/scores, programmatic destination pages and bulk AI publishing. Risk: public availability at ₹0, indexing, acquisition, retention and revenue remain unproven until the real product, deployment and cohort supply are tested.
