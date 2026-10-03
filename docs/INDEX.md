# Docs index

Everything under `docs/` in one place. `docs/history/` is migrated reference
material from `ahau-monorepo`, frozen at the point it was copied. Everything
else here is `ahau-v2`'s own, living documentation.

## Canonical — ahau-v2's own

| Location | Contents |
|---|---|
| [`adr/`](adr/) | Architecture decision records for `ahau-v2` itself (numbering starts at 0002; 0001 was `ahau-monorepo`'s own ADR and lives in that repo): `0002-rewrite-instead-of-continuing-to-patch-ssb-architecture.md` (`ahau-v2`'s own — why the contract/adapter rewrite continues rather than reverting to feature work on `ahau-monorepo`'s SSB stack, grounded in concrete evidence from 3 in-flight `ahau-monorepo` PRs); `0003`–`0005` (2026-09-23, `ahau-v2`'s own — Leg 2's protocol direction (Holochain, single-adapter validation, narrower than originally planned), frontend continuity (Svelte, Gramps.js deferred), and data-migration stance (clean-slate, GEDCOM acknowledged as a future need)); `0006` (2026-10-03 — redesign around user capabilities directly on Holochain; the Leg 1 contract is frozen as an SSB-era reference and verification checklist). New ADRs for `ahau-v2` go here. |
| [`prds/`](prds/) | Problem/requirements specs: the 2 Leg 1/Leg 2 rebuild PRDs (`ahau-v2-repo-foundation.prd.md`, `ahau-v2-frontend-rebuild.prd.md` — the latter superseded by ADR-0006, kept as record). `ahau-monorepo`'s own PRDs live in that repo. |
| [`plans/`](plans/) | The 5 completed Leg 1 milestone plans (`ahau-v2-*.plan.md`), plus `group-permissions.md` — the functional spec for the first Holochain slice. `ahau-monorepo`'s own plans live in that repo. |
| [`agents/`](agents/) | How agent skills should consume this repo: `issue-tracker.md` (GitHub Issues via `gh`), `domain.md` (where `CONTEXT.md`/`docs/adr/` live). Read alongside the root [`CLAUDE.md`](../CLAUDE.md), which carries the project's kaupapa principles. |
| `contract-decisions.md`, `contract-friction.md`, `token-verification.md`, `design-parity.md`, `writing-an-adapter.md` | Leg 1 outcome docs — what the contract got right/wrong, how tokens were verified, how to write an adapter. Read `contract-friction.md` first if picking up Leg 2. |
| `decentralized-backend-research.md` | Research into candidate Leg 2 protocols. |

### A note on paths inside the Leg 1/Leg 2 PRDs and plans

Relative paths inside `prds/ahau-v2-*.prd.md` and `plans/ahau-v2-*.plan.md`
are written from the old `ahau` repository's root (e.g.
`plans/data-access-triage.json`, `plans/data-access-inventory.json`) — that
repo is now confirmed stale and out of scope for this migration, so those
paths won't resolve here and aren't being fixed retroactively; they're a
record of where the inventory work actually happened. The equivalents this
repo actually reads are vendored under `contract-source/`, which is what the
manifest derivation and coverage gate use. They're a frozen snapshot
(ADR-0006).

`ahau-v2` is now the canonical home for this reasoning — `ahau` was a mirror
of the pre-monorepo repo and is superseded, `ahau-monorepo` is a separate,
still-live effort (plugin consolidation) that these Leg 1/Leg 2 documents
never depended on. There's no other copy to keep in sync with.

## Historical — migrated from ahau-monorepo, reference only

| Location | Contents |
|---|---|
| [`history/knowledge-base/`](history/knowledge-base/) | ~40 files, one per legacy pre-monorepo repo (`ahau`, `pataka`, the `ssb-*` plugins), each documenting that repo's own history including old GitLab MRs. A separate project done outside the monorepo; kept as its own subtree, not restructured. Start at `history/knowledge-base/INDEX.md` or `cross_cutting.md`. |
| [`history/handoffs/`](history/handoffs/) | PR handoff docs written mid-work in `ahau-monorepo` (e.g. `pr-3-6-7-handoff.md`). References to files that only exist on unmerged `ahau-monorepo` branches are noted inline where found, not fixed — those branches' PRDs/plans/learnings docs were deliberately left unmigrated (active in-progress work, not settled history), decided in [Wayfinder ticket #12](https://github.com/ahau01/ahau-v2/issues/12); the concrete evidence they surfaced is instead captured in [ADR-0002](adr/0002-rewrite-instead-of-continuing-to-patch-ssb-architecture.md). |
| [`history/ahau-monorepo-codebase-map.md`](history/ahau-monorepo-codebase-map.md) | Auto-generated map of `ahau-monorepo`'s own code layout (1549 files, mapped 2026-09-09). Describes that repo's structure, not `ahau-v2`'s — useful for tracing where a piece of history came from, nothing more. |

## Where things came from

This migration is tracked as a Wayfinder map:
[Wayfinder map: migrate ahau-monorepo history into ahau-v2](https://github.com/ahau01/ahau-v2/issues/1).
Its Decisions-so-far section is the audit trail for what moved, from where,
and any reconciliation done along the way.
