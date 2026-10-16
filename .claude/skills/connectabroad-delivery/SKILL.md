---
name: connectabroad-delivery
description: Create, implement, or verify a ConnectAbroad product slice from scratch under the zero-spend stack and authorization contracts. Use for frontend foundations, account, profile, discovery, connections, messaging, moderation, analytics, or release work.
---

# ConnectAbroad delivery

Paths below are relative to the project root. Read `IMPLEMENTATION-PLAN.md` sections 3–5 and 11 and `docs/AGENT-PROMPTS.md`. The user explicitly selected a fresh build with ₹0 additional spend; historical preserve-existing-code instructions are superseded.

## Start from evidence

- Inspect the root to avoid overwrites, then create requested new code in `frontend/` or `backend/`. Missing application source is expected and does not block authorized scaffolding. As code accumulates, inspect affected callers/contracts/tests before changing behavior.
- Use React/Vite/TypeScript, React Router Framework Mode with build-time public prerendering, Tailwind/custom shadcn; later OpenJDK/Spring Security/PostgreSQL/WebSockets. Keep dependencies open-source and required cash spend zero.
- For a fix, reproduce the failure. For new behavior, define acceptance and denied/error cases. Historical errors in the source are test ideas, not observed defects in the new application.

## Deliver the complete slice

- Establish only the layers/components needed for the current slice, reuse them as code grows, and add a focused test for non-trivial logic. Complete the full scoped frontend when that is the requested task.
- Frontend demo fixtures are synthetic, isolated and visibly labeled. Production defaults to real API behavior; no silent demo fallback, fake persisted account or misleading report success. Missing backend does not block independent frontend work.
- Profiles use explicit safe projections. Private messages/reports require resource-level authorization. WebSocket connection authentication alone does not authorize a destination, subscription or message.
- Check accepted-connection and block state for new contact. Preserve historical evidence according to the declared retention policy; blocking must not silently erase a conversation.
- Keep migrations compatible with the agreed rollback path. Do not reset data or weaken authorization to pass tests.
- Delegate read-only investigation/review freely where useful. Parallel writes need disjoint files or isolated worktrees and test databases; one agent owns schema changes.

## Verify and hand off

Run discovered project checks and the ticket's actual acceptance scenarios. Record command, environment and result. A plan, a mocked happy path and agent self-report do not prove a deployed core loop.

Return: result, changed paths, actual validation, demo versus real integration status, unresolved limits and next dependency. Stop once requested acceptance passes. No purchases, card trials or paid upgrades are allowed. Publication, deployment and destructive data work require authorization for the actual task.
