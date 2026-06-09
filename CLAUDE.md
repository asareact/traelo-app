
## START HERE — Project status & continuation
**Read `ROADMAP.md` first.** It is the source of truth: current status, phases with
checkboxes, critical conventions (Next 16, Tailwind v4, Supabase, proxy-not-middleware,
push via SSH not gh), and how to continue with zero prior context. Keep it updated:
mark tasks `[x]` as you finish them and update the "Estado actual" section.
Also read `DESIGN.md` (design + business rules) and `SETUP.md` (env/auth) when relevant.

## Architecture — READ BEFORE WRITING CODE
**`ARCHITECTURE.md` is the source of truth for where code goes.** The project is
organized as a **modular monolith by features (vertical slices)** with a strict
dependency rule: `app/` → `features/` → `components/ui · lib · types · config`.
Arrows point down, never up. Before creating any file, place it by these rules:

- **`app/`** = routing only. Thin pages that compose features. No business logic,
  no ad-hoc SQL. If a page grows past ~40 lines of logic, move it into a feature.
- **`features/<domain>/`** = the domain. Each is a closed module: `domain/` (pure
  logic), `schemas.ts` (zod), `queries.ts` (reads, `server-only`), `actions.ts`
  (writes, `'use server'`), `components/`, `index.ts` (the only public surface).
  A feature is imported via its barrel `@/features/<name>`, never by inner files.
- **`components/ui`** = design-system primitives, business-agnostic. `lib/` = infra
  (supabase, utils, env), no business logic. `types/database.ts` = DB row shapes.
- **Validate every user input with zod server-side** (action/route), even if also
  validated client-side. The client is UX; the server is the trust boundary.
- **Client area is mobile-first** and wrapped in `<AppShell>` (bottom-nav).
- **Never show "casillero" to the client** — internal states map to neutral copy
  in `features/orders/domain/estados.ts`.

Two gotchas that bite: (1) don't re-export `queries.ts` (server-only) from a barrel
that a client component imports — pages import queries directly. (2) the same route
segment can't live in two route-group branches, so the mobile shell is a component
(`<AppShell>`), not a group layout. Full detail + recipe in `ARCHITECTURE.md`.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
