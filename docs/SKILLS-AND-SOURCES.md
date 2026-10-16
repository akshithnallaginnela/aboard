# Project skills, setup and research provenance

Prepared 16 October 2026; revised for the user's fresh-build and zero-spend instruction. This package includes four project workflows and a pinned copy of the requested **UI UX Pro Max** skill. This turn updates plans only; it does not create the app, install application dependencies, or purchase a service. The future Claude prompt is authorized to scaffold the new frontend in `frontend/` without waiting for legacy application source.

## 1. Included workflows

| Skill | Purpose | Main reference |
| --- | --- | --- |
| `connectabroad-delivery` | Complete a bounded fresh-build product ticket with permission/state tests and release evidence | Implementation plan §§4–5, 11 |
| `connectabroad-design` | Apply the bespoke screen contracts and use relevant upstream design research | Design specification |
| `connectabroad-growth` | Validate a cohort, capacity, one acquisition/revenue experiment and labor-inclusive economics | Business playbook; canonical metrics in main plan §8 |
| `connectabroad-seo` | Audit and implement public content/indexing without exposing members | SEO audit |
| `ui-ux-pro-max` | Search local design/interaction guidance from the requested upstream GitHub project | Upstream SKILL.md and project-specific design decisions |

The four project skills were authored for this product using Skill Creator guidance. They contain instruction workflows and reuse the maintained planning files rather than copying whole specifications into every skill.

Each skill is present under `.claude/skills/{name}/` and `.agents/skills/{name}/`. The `.claude/skills/` copy is the editing source for this package; keep its Codex copy synchronized if changing a skill. Shared instructions live once in `AGENTS.md`; `CLAUDE.md` imports them.

Codex scans project `.agents/skills` for native skills; Claude Code scans project `.claude/skills`. `AGENTS.md` also supplies explicit paths if native selection is unavailable. Do not assume a previously open session refreshed its skill catalog. Start a new session/reload as required by the client, list available skills, and verify the intended file was loaded. [Official Codex skill locations](https://developers.openai.com/codex/skills/), [Claude Code skills](https://code.claude.com/docs/en/skills)

Claude supports imports such as `@AGENTS.md` in `CLAUDE.md`. Read this folder's instructions and avoid overwriting unrelated work when scaffolding. [Claude memory/import documentation](https://code.claude.com/docs/en/memory), [OpenAI AGENTS.md guidance](https://developers.openai.com/codex/guides/agents-md/)

### Invoke or load

In a client with native skill discovery, select the skill by name. Claude Code normally exposes `/connectabroad-delivery`; Codex supports skill selection/mention such as `$connectabroad-delivery`. If your client does not expose it, use this portable prompt:

```text
Read AGENTS.md and .claude/skills/connectabroad-delivery/SKILL.md, then perform
CA-001 from IMPLEMENTATION-PLAN.md in this project folder. This is a fresh
build: inspect the destination to avoid overwrites, then create frontend/;
the absence of legacy app source is expected, not a reason to stop.
```

Agent roles in this package are task briefs, not installed model-specific subagent configurations. Use native subagents when available; otherwise run the bounded roles sequentially. Do not add a new orchestration dependency just to reproduce a role table. Claude's documented custom-agent/worktree capabilities can be used when supported by the installed client. [Claude subagent documentation](https://code.claude.com/docs/en/sub-agents)

## 2. UI UX Pro Max provenance and contents

- Repository: [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
- Pinned commit: [`56ea9cf174ed86786187daa9de0e6247cb0747e4`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/56ea9cf174ed86786187daa9de0e6247cb0747e4), resolved from the public GitHub API during this work. A moving `main` branch or web cache may show a different revision later.
- License: MIT; original `LICENSE` retained in each project copy. No claim of third-party certification or exhaustive security audit.
- Copied upstream paths: `.claude/skills/ui-ux-pro-max/SKILL.md`; `src/ui-ux-pro-max/scripts/`; `src/ui-ux-pro-max/data/`; `.claude/skills/ui-ux-pro-max/references/`; root `LICENSE`.
- `UPSTREAM.json` records source and commit. Source files are retained without product-specific edits; project overrides live in `connectabroad-design` and `docs/DESIGN-SYSTEM.md`.
- Search runs locally with Python 3 and standard-library modules. Imports, search entrypoint, data resolution and persistence/network-sensitive operations were inspected before execution. Searches here used no persistence/overwrite flags, network generation, private user data or floating `npx` installer.
- This is the main design-intelligence skill and its required local resources, not the upstream repository's entire optional skill suite or installer CLI.

### Searches actually executed

Run from the project root; resolve an absolute script path if invoking from another directory. On Windows, `-X utf8` avoids console-encoding problems. Equivalent Codex-native script paths work too. Upstream examples mention `CLAUDE_PLUGIN_ROOT`, which is not automatically defined by a plain project-folder install.

```powershell
python -X utf8 .claude/skills/ui-ux-pro-max/scripts/search.py 'peer community warm editorial' --design-system -p 'ConnectAbroad' --format markdown
python -X utf8 .claude/skills/ui-ux-pro-max/scripts/search.py 'alumni peer mentoring community' --design-system -p 'ConnectAbroad' --format markdown
python -X utf8 .claude/skills/ui-ux-pro-max/scripts/search.py 'community social network' --domain product -n 2
python -X utf8 .claude/skills/ui-ux-pro-max/scripts/search.py 'error summary validation' --domain ux -n 2
python -X utf8 .claude/skills/ui-ux-pro-max/scripts/search.py 'keyboard focus modal' --domain ux -n 2
python -X utf8 .claude/skills/ui-ux-pro-max/scripts/search.py 'dialog focus trap return' --domain ux -n 2
```

| Search | Observed fit and decision |
| --- | --- |
| Warm editorial system | Returned Minimalism/Swiss style, a generic hero/features/CTA pattern, black/pink palette and Outfit/Work Sans. Useful hierarchy/performance reminders; rejected as a complete product-specific brand. |
| Narrower alumni system retry | Still generic composition/type, now purple/green. Did not establish a diaspora-specific match; rejected the palette and repetitive layout. No generated MASTER persisted. |
| Product domain | Social Media App and Anonymous Community categories are too broad to validate this service's positioning or visual identity. |
| Form validation | Returned focusable error summary and announced error guidance; adopted as interaction acceptance, alongside inline errors and field links. |
| Modal query and retry | Returned visible-focus/AAA indicator guidance, not the full requested modal interaction contract. No verified local dialog match; used primary WAI guidance for focus placement/containment, Escape and return focus. [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |

This is deliberate use of the skill with editorial judgment. The bespoke tokens, typography and screen compositions are proposals based on the product brief; they are not falsely attributed to generated recommendations. Contrast was calculated for documented opaque pairs, not measured on a live UI.

## 3. Research evidence and boundaries

The source Word blueprint established the product mission, historical stack claims, first-100 targets and trust requirements. The user's latest instruction supersedes preservation of an unavailable old app: the plan now selects a new React/Vite/TypeScript frontend, Tailwind/custom-styled shadcn components, React Router, and an OpenJDK/Spring Boot/Spring Security/PostgreSQL/WebSocket backend with Podman/Caddy. The pasted text supplied ten aesthetic concerns. Neither source provided implementation evidence or real customer outcomes.

### Styling research and skill decision for the fresh build

Keep the pinned MIT UI UX Pro Max skill plus `connectabroad-design`; this is sufficient for coherent visual guidance, screen contracts, and targeted UX searches. Do not add overlapping skill packs, premium design agents, or another template marketplace. No new skill was installed in this revision. The existing bespoke direction overrides poor-fit generic search output, while primary interaction references cover dataset gaps. A skill's code license does not make Claude Code, Codex, or their hosted models open-source or guarantee free usage; the product must have no dependency on those services at runtime.

| Primary GitHub source checked | License / scope | Decision |
| --- | --- | --- |
| [shadcn/ui source](https://github.com/shadcn-ui/ui), [license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) | MIT; customizable component source | Add only needed components, keep license notices, apply ConnectAbroad tokens rather than stock styling. No paid blocks. |
| [Radix primitives](https://github.com/radix-ui/primitives), [license](https://github.com/radix-ui/primitives/blob/main/LICENSE) | MIT; low-level UI primitives | Use for complex focus/keyboard interactions where useful; test composition and labels. This is not a second visual theme. |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss), [license](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE) | MIT; CSS tooling | Verify compatible stable integration at implementation time; lock versions. Premium Tailwind products are not required or authorized. |
| [Newsreader license](https://github.com/google/fonts/blob/main/ofl/newsreader/OFL.txt), [Public Sans license](https://github.com/google/fonts/blob/main/ofl/publicsans/OFL.txt) | SIL OFL 1.1 fonts | Self-host only needed weights/subsets with license notices; no paid font service. |

These moving-branch license links document the research, not a dependency lockfile. Check the actual selected package versions and transitive licenses when implementing; do not infer every asset in an ecosystem shares its core library's license.

Actual Reddit comments were read again for this revision. In [What color palettes scream AI?](https://www.reddit.com/r/webdesign/comments/1us1u6l/what_color_paletts_scream_ai/), commenters disagree on color bans, call out photography, and argue for judging the full visual system. In [Preventing the AI slop look](https://www.reddit.com/r/webdesign/comments/1uhuovu/preventing_the_ai_slop_look/), commenters prioritize the client's brand and reference books/magazines rather than copying another website. These are anecdotal design opinions, not evidence of conversion or product demand. Keep the proposed palette and readable fonts, but earn distinctiveness through useful shared-context layouts, original truthful copy, and consented imagery.

React Router Framework Mode with Vite, `ssr: false`, and explicit approved-public-route prerendering is the selected rendering contract. Do not confuse a client-only SPA shell with prerendered public HTML; keep member routes out of the public allowlist. [Official prerendering guide](https://reactrouter.com/how-to/pre-rendering), [SPA mode](https://reactrouter.com/how-to/spa)

Additional local searches executed for this revision: `forms accessible inputs --stack react -n 1` and `error summary validation --domain ux -n 1`. The latter again matched focusable linked error summaries. The former returned a controlled-input recommendation with an overbroad rejection of uncontrolled inputs; treat it as a state-management suggestion, not a rule that native forms or refs are inherently inaccessible. Verify actual input/event behavior against React documentation rather than copying a short search snippet as executable code.

Zero-spend styling means no premium templates/icons/assets, paid stock subscriptions, purchased domain, runtime model API, hosted auth/database dependency, or paid browser tool. Local open-source browser tests and manual checks are sufficient for implementation evidence. Public hosting capacity, email infrastructure, hardware, electricity, connectivity, and the user's development-agent access remain separate availability/cost constraints; software licenses alone do not provide them.

Primary sources are linked near the claims they support in each specification. The design document includes font licenses, W3C accessibility/interaction references and design-system examples. The business document includes official competitor offers and actual Reddit discussions read with counterexamples. The SEO audit links current Google Search Central and web.dev guidance. Reddit is anecdotal, not market-size, revenue, safety-prevalence or product-superiority proof.

GitHub skill popularity is not a product-quality guarantee. The exact requested source, actual files, license, pinned revision and runnable search behavior matter more than a fluctuating star/install count. No alternative skill pack or global agent configuration was installed merely to increase the tool list.

## 4. Validation and remaining work

Package validation covers project skill frontmatter, required upstream search resources, matching project skill copies, local document links, consistent metric/schedule contracts and selected business/design calculations. This is planning-package verification, not an application test suite.

Not performed: application scaffold/build/tests, live browser walkthroughs, production crawl/indexing, Search Console setup, field performance, legal review, user interviews, actual outreach, payments or revenue validation. The next implementation session creates the authorized frontend and records real commands/results; missing backend source is an expected integration gap and must not stop independently complete frontend work. Demo sessions/fixtures stay explicitly labeled and separate from unavailable normal API mode.
