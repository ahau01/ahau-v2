# Docs index

Everything under `docs/` in one place. `docs/history/` is migrated reference
material from `ahau-monorepo`, frozen at the point it was copied. Everything
else here is `ahau-v2`'s own, living documentation.

## Canonical — ahau-v2's own

| Location | Contents |
|---|---|
| [`adr/`](adr/) | Architecture decision records for `ahau-v2` itself (currently holds the one migrated from `ahau-monorepo`, `0001-consolidate-plugin-ecosystem-into-monorepo.md` — read it as historical context on the monorepo consolidation, not a decision about `ahau-v2`'s own architecture). New ADRs for `ahau-v2` go here. |
| [`prds/`](prds/) | Problem/requirements specs: the 2 Leg 1/Leg 2 rebuild PRDs (`ahau-v2-repo-foundation.prd.md`, `ahau-v2-frontend-rebuild.prd.md`), plus 2 migrated from `ahau-monorepo` (`ahau-monorepo-consolidation.prd.md`, `root-dev-commands.prd.md` — about that repo's own consolidation work, kept for reference). |
| [`plans/`](plans/) | Milestone/execution plans: 5 for the Leg 1/Leg 2 rebuild, plus 7 migrated from `ahau-monorepo`'s own consolidation and tooling work. |
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
manifest derivation and coverage gate use. Refresh them with
`npm run refresh:source`.

`ahau-v2` is now the canonical home for this reasoning — `ahau` was a mirror
of the pre-monorepo repo and is superseded, `ahau-monorepo` is a separate,
still-live effort (plugin consolidation) that these Leg 1/Leg 2 documents
never depended on. There's no other copy to keep in sync with.

## Historical — migrated from ahau-monorepo, reference only

| Location | Contents |
|---|---|
| [`history/knowledge-base/`](history/knowledge-base/) | ~40 files, one per legacy pre-monorepo repo (`ahau`, `pataka`, the `ssb-*` plugins), each documenting that repo's own history including old GitLab MRs. A separate project done outside the monorepo; kept as its own subtree, not restructured. Start at `history/knowledge-base/INDEX.md` or `cross_cutting.md`. |
| [`history/handoffs/`](history/handoffs/) | PR handoff docs written mid-work in `ahau-monorepo` (e.g. `pr-3-6-7-handoff.md`). References to files that only exist on unmerged `ahau-monorepo` branches are noted inline where found, not fixed — see [Decide how to handle 3 open/unmerged ahau-monorepo PRs' PRDs and plans](https://github.com/ahau01/ahau-v2/issues/12). |
| [`history/ahau-monorepo-codebase-map.md`](history/ahau-monorepo-codebase-map.md) | Auto-generated map of `ahau-monorepo`'s own code layout (1549 files, mapped 2026-09-09). Describes that repo's structure, not `ahau-v2`'s — useful for tracing where a piece of history came from, nothing more. |

## Where things came from

This migration is tracked as a Wayfinder map:
[Wayfinder map: migrate ahau-monorepo history into ahau-v2](https://github.com/ahau01/ahau-v2/issues/1).
Its Decisions-so-far section is the audit trail for what moved, from where,
and any reconciliation done along the way.
