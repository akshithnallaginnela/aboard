# ConnectAbroad working instructions

The user has explicitly chosen to build ConnectAbroad from scratch with a hard ₹0 additional-spend budget. This supersedes earlier preserve-existing-code/audit-first instructions. The planning folder has no application source; that is expected. Inspect files to avoid overwriting work, then create the requested frontend in `frontend/` and backend in `backend/` only when that phase is requested.

Read [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) before project delivery. Read only the supporting specification relevant to the task. The original Word document is background; this plan contains proposed refinements, not verified runtime facts.

## Delivery rules

- Chosen stack: React + TypeScript + Vite, React Router Framework Mode (`ssr: false`, explicit public prerender list), Tailwind/customized shadcn components; OpenJDK/Spring Boot/Security/PostgreSQL/WebSockets later. Podman/Caddy are the self-hosted baseline.
- No required paid account, domain, API, asset, subscription, card trial or automatic upgrade. Free hosted services are optional, limited, and distinct from the open-source/self-hosted baseline. Existing hardware, electricity and connectivity constrain availability.
- Greenfield frontend scaffolding is authorized for implementation tasks. Complete its screens using isolated, labeled synthetic demo fixtures while the backend is absent. Default production behavior uses real APIs and never silently substitutes sample success.
- Locate callers, contracts and existing tests before modifying shared behavior. Fix the narrowest responsible layer and include relevant regression proof.
- Treat profile visibility, resource ownership, WebSocket authorization, block/report, and accurate public claims as core behavior.
- Do not expose private profiles/messages for SEO. Do not create fake testimonials, users, affiliations, verification claims or benchmark results.
- Use small tickets with acceptance examples and explicit edit scope. One integrator owns contracts; parallel agents edit disjoint files or separate worktrees/test databases.
- Use only required tools and existing project conventions. Record actual validation commands/results and distinguish not-run checks.
- Work already authorized may proceed. Deployment, destructive data changes, outreach, publication and spending require the authorization appropriate to that actual action; this planning package does not grant it.

## Skills: load only the relevant workflow

Project skill bodies live in `.claude/skills/`; Codex-native copies are in `.agents/skills/` when installed. If native discovery is unavailable, explicitly read the listed SKILL.md rather than claiming a missing tool is available.

| Task | Skill to read |
| --- | --- |
| Create, implement or release one core product slice | `.claude/skills/connectabroad-delivery/SKILL.md` |
| Design or review screens and interactions | `.claude/skills/connectabroad-design/SKILL.md`; it routes to the requested upstream UI UX Pro Max skill |
| Validate acquisition, pricing or lower-touch operations | `.claude/skills/connectabroad-growth/SKILL.md` |
| Public content, crawl/indexing or launch SEO audit | `.claude/skills/connectabroad-seo/SKILL.md` |

Read [docs/SKILLS-AND-SOURCES.md](docs/SKILLS-AND-SOURCES.md) for setup and provenance. Use [docs/CLAUDE-FRONTEND-PROMPT.md](docs/CLAUDE-FRONTEND-PROMPT.md) for the complete frontend task. Do not load every skill into every task.

## Completion report

State the user-visible result, files changed, validation evidence, unresolved limits and the next dependency. Never call a plan-only recommendation implemented in production. Stop after the ticket's acceptance conditions pass; no unrelated cleanup.
