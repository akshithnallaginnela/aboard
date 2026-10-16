---
name: connectabroad-design
description: Design, implement, or review ConnectAbroad screens using its editorial visual system, truthful community content, and accessible interaction contracts. Routes to the project's pinned UI UX Pro Max skill for targeted design research.
---

# ConnectAbroad design

Paths below are relative to the project root. Read `docs/DESIGN-SYSTEM.md` and `docs/CLAUDE-FRONTEND-PROMPT.md`. The user explicitly authorizes a fresh frontend in `frontend/` with React/Vite/TypeScript, React Router Framework Mode (`ssr: false`, approved public prerender list), Tailwind and customized shadcn/Radix components. Inspect files only to avoid overwriting work; no existing application is required.

## Research only what affects the screen

Read `.claude/skills/ui-ux-pro-max/SKILL.md` (or its Codex-native copy). Resolve the skill directory to an absolute path and run its `scripts/search.py`; do not assume `CLAUDE_PLUGIN_ROOT` is set in a plain project install. Python 3 is sufficient; no package install is needed.

- For new direction, use one `--design-system` query; for a targeted issue, an explicit domain. React/Vite/TypeScript is selected; use verified applicable React/web guidance without pretending a Next.js-only rule applies. No additional paid or redundant skill pack is needed.
- Judge the returned category and guidance against the user's task. Retry once if off-topic. The existing executed community searches were generic: they do not validate the chosen brand or complete dialog behavior.
- Use W3C primary interaction guidance when the local dataset does not cover the needed behavior. Record the gap and fallback. Do not persist an off-topic generated master or overwrite the approved design specification.

## Build the agreed experience

Use the proposed ink/paper/green/marigold tokens and Newsreader/Public Sans pairing unless current constraints justify a documented adjustment. Test contrast for every actual state; token-table calculations alone do not prove a rendered screen accessible.

Establish landing, discovery and mobile conversation first, then complete every scoped frontend route in the same requested task. Show loading, empty, unavailable, error, success, pending, blocked and session-expired states. Keep shared-context copy specific and private fields private.

Use only free/open-source components, assets and fonts with license notices. No paid template, icon pack, photo, generation API or service is required. Prefer intentional typography without permissioned photos. Do not invent members, testimonials or verification; synthetic demo members stay clearly labeled and outside public prerendered content. Keep coherent icons, familiar controls and consistent spacing.

## Acceptance

Test narrow-screen reflow, keyboard order/focus, form labels/errors, dialog containment/Escape/return focus, reduced motion, contrast and readable zoom. Record real screenshots at the specified widths and unresolved gaps. Use existing test/browser tooling. Return why the design fits this cohort, changed screens/states, proof, and the smallest next fix.
