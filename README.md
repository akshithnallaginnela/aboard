# ConnectAbroad planning package

Start with [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md). It turns the supplied product blueprint and design notes into a staged delivery plan for Claude Code and Codex.

**Current direction: build everything from scratch with ₹0 additional spend.** Earlier preserve-existing-code instructions are superseded. The frontend uses React/Vite/TypeScript, React Router build-time prerendering, Tailwind and customized shadcn components; the backend later uses OpenJDK/Spring Boot/PostgreSQL/WebSockets. No application implementation or deployment is represented as completed by this planning update.

## Read what you need

| File | Purpose |
| --- | --- |
| [Implementation plan](IMPLEMENTATION-PLAN.md) | Scope, architecture contracts, tickets, dates, agents, metrics and release gates |
| [Design specification](docs/DESIGN-SYSTEM.md) | Brand direction, tokens, screen layouts, interaction states and visual QA |
| [Business and growth](docs/BUSINESS-AND-GROWTH.md) | First 100 users, helper supply, competitor research and monetization experiments |
| [SEO audit](docs/SEO-AUDIT.md) | Planning findings, applied corrections, content briefs and checks for implementation |
| [Agent prompts](docs/AGENT-PROMPTS.md) | Copy-ready audit, build, review, design, growth and SEO tasks |
| [Frontend prompt: start from scratch](docs/CLAUDE-FRONTEND-PROMPT.md) | Complete Claude handoff for the new frontend and explicit demo/API boundaries |
| [Skills and sources](docs/SKILLS-AND-SOURCES.md) | Installed project skills, UI UX Pro Max provenance and usage |

## Use with your coding agent

1. Open this planning workspace in Claude Code or Codex. Retain the documents, original Word file, skills and license notices.
2. Confirm the agent can read `AGENTS.md` and the relevant skills; refresh discovery if needed.
3. Paste [the frontend-from-scratch prompt](docs/CLAUDE-FRONTEND-PROMPT.md). It authorizes creating `frontend/`; no existing application repository is required.
4. Complete the core frontend with explicit synthetic demo data, real interaction states and local verification. Record the future Spring API contract.
5. Build/integrate the real backend in a later task. Demo-only authentication, messages and moderation do not establish production safety or persisted member data.

The open-source stack can run on existing hardware without software license purchases. Optional hosted free tiers have quotas, pauses and service restrictions; they do not promise free unlimited scale. No paid signup, deployment or purchase is authorized by this package.

The 15 November 2026 milestone is a working target. Ship dates follow evidence of a safe, useful core loop. Pricing, funnel rates and product advantages are hypotheses to test.
