# Root-Level Dev Commands for Āhau and Pātaka

## Problem
Developers working in the ahau-monorepo currently have to run multiple `npm run dev`-style commands across different subdirectories, each in its own terminal window, to start either app's full dev environment (desktop + ui for `ahau`, backend + ui for `pataka`). This friction didn't exist before the monorepo consolidation — each app previously lived in its own repo with its own separate local dev routine — and is now newly visible now that both apps are colocated.

## Evidence
- Direct, first-hand friction reported by both developers currently working in the monorepo (a 2-person team) — informal, not externally documented, but consistent and from the actual primary users

## Users
- **Primary**: The two developers actively working in this monorepo
- **Not for**: End users of the Āhau/Pataka apps; CI or any automated pipeline

## Hypothesis
We believe **unified root-level dev commands** will **eliminate the need to run multiple dev commands across subdirectories and terminals** for **the developers working in this monorepo**.
We'll know we're right when **a developer can start either app's full dev environment with a single command run from the repo root**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Root dev commands exist and work | 2 commands (one for `ahau` desktop+ui, one for `pataka`) | Manual verification — run each from root, confirm the full dev environment starts |
| Commands needed to start a dev environment | Down from multiple per-subdirectory commands to 1 per app | Before/after comparison, informal |

## Scope
**MVP** — Two root-level commands: one starts `ahau`'s desktop + ui dev environment, one starts `pataka`'s dev environment (backend + ui). Both runnable from the repo root without `cd`-ing into subdirectories.

**Out of scope**
- Release or production build pipelines — deferred, dev-only concern
- Mobile app dev/build commands — not part of this problem
- CI integration — no automation implied
- Any behavior beyond starting the existing dev-mode workflows already used per-app

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Root dev commands added | A single root-level command starts each app's full dev environment (desktop+ui for ahau, backend+ui for pataka) | complete | [plan](../plans/root-dev-commands.plan.md) |

## Open Questions
- [x] Exact command naming and invocation approach — Resolved: `apps/pataka`'s scripts restructured to mirror `apps/ahau`'s existing `dev`/`dev:ui`/`dev:desktop` trio exactly (as `dev`/`dev:ui`/`dev:backend`), then two thin root delegators (`dev:ahau`, `dev:pataka`) via `npm run dev --workspace=apps/{name}`.
- [x] Does "runnable from root" require literal root-level script names? — Resolved: yes, literal root-level `npm run dev:ahau` / `npm run dev:pataka`, not just workspace-flag invocation.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `pataka` lacks `ahau`'s existing unified dev script, so it needs more new wiring than `ahau` | Medium | Low | Scope is limited to startup convenience, not new dev-server behavior — `/plan` can address the asymmetry directly |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
