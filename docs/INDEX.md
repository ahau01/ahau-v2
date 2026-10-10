# Docs index

Everything under `docs/` in one place. The top of `docs/` holds `ahau-v2`'s
own, living documentation. `docs/history/` holds finished work: the completed
Leg 1 docs (`history/leg1/`) and migrated reference material from
`ahau-monorepo`, frozen at the point it was copied.

## Living — ahau-v2's own

| Location | Contents |
|---|---|
| [`../openspec/`](../openspec/) | `specs/` — what the system does now, the only live spec. `changes/` — work in flight. `changes/archive/` — finished changes, kept for their reasoning. `docs/` below is supporting evidence and history, not authoritative for current specs or decisions. |
| [`plans/`](plans/) | `group-permissions.md` — a draft problem statement and evidence for group permissions, not an approved spec; becomes requirements once a change adopts it. `ahau-monorepo`'s own plans live in that repo. |
| [`research/`](research/) | Research notes citing primary sources: `pataka-always-online-peer.md` — issue #22, whether an always-online peer is still needed on Holochain, the open questions, and recommended sequencing; `holochain-group-permissions.md` — group-permissions research on Holochain; `2026-10-04-rust-holochain-learning-tickets.md` — Rust/Holochain learning tickets. |
| [`agents/`](agents/) | How agent skills should consume this repo: `openspec.md` (the OpenSpec flow and where things live), `issue-tracker.md` (GitHub Issues via `gh`), `triage-labels.md` (backlog labels), `domain.md` (where `CONTEXT.md` lives). Read alongside the root [`CLAUDE.md`](../CLAUDE.md), which carries the project's kaupapa principles. |
| `capability-inventory.md` | A checklist of what the old app's data layer could do, used so nothing is dropped in the rebuild — not a spec to copy screen by screen. |
| `contract-decisions.md`, `token-verification.md`, `design-parity.md` | Leg 1 outcome docs that still apply — why the contract's cross-cutting semantics are shaped as they are (reasoning carries forward from the capability-driven redesign), how tokens were verified, how design parity is judged. |
| [`old-app-capture/`](old-app-capture/) | Screenshots of the old app's screens plus the `capture.mjs` script that took them, used as a visual reference for parity work. |
| [`parity/`](parity/) | The v2 equivalents of the old-app captures, plus the `shoot.mjs` script that took them. |

## History

| Location | Contents |
|---|---|
| [`history/leg1/`](history/leg1/) | Finished Leg 1 work: the 2 Leg 1/Leg 2 rebuild PRDs (`ahau-v2-repo-foundation.prd.md`, `ahau-v2-frontend-rebuild.prd.md` — the latter superseded by the redesign around user capabilities directly on Holochain, kept as record), the 5 completed Leg 1 milestone plans (`ahau-v2-*.plan.md`), and `contract-friction.md`, `writing-an-adapter.md`, `decentralized-backend-research.md` (where the contract resisted implementation, how to write an adapter, research into candidate Leg 2 protocols). `ahau-monorepo`'s own PRDs and plans live in that repo. |

### A note on paths inside the Leg 1/Leg 2 PRDs and plans

Relative paths inside `history/leg1/ahau-v2-*.prd.md` and
`history/leg1/ahau-v2-*.plan.md` are written from the old `ahau` repository's
root (e.g. `plans/data-access-triage.json`, `plans/data-access-inventory.json`) — that
repo is now confirmed stale and out of scope for this migration, so those
paths won't resolve here and aren't being fixed retroactively; they're a
record of where the inventory work actually happened. The equivalents this
repo actually reads are vendored under
`reference/leg1-contract/contract-source/`, which is what the manifest
derivation and coverage scripts there use. They're a frozen snapshot.

The plans' "Files to Change" tables and task steps name `ahau-v2` files at the
paths they had when each plan was written (e.g. `docs/contract-friction.md`,
`docs/prds/…`), before these docs moved to `history/leg1/`; they're left as
written.

`ahau-v2` is now the canonical home for this reasoning — `ahau` was a mirror
of the pre-monorepo repo and is superseded, `ahau-monorepo` is a separate,
still-live effort (plugin consolidation) that these Leg 1/Leg 2 documents
never depended on. There's no other copy to keep in sync with.

### Migrated from ahau-monorepo, reference only

| Location | Contents |
|---|---|
| [`history/knowledge-base/`](history/knowledge-base/) | ~40 files, one per legacy pre-monorepo repo (`ahau`, `pataka`, the `ssb-*` plugins), each documenting that repo's own history including old GitLab MRs. A separate project done outside the monorepo; kept as its own subtree, not restructured. Start at `history/knowledge-base/INDEX.md` or `cross_cutting.md`. |
| [`history/handoffs/`](history/handoffs/) | PR handoff docs written mid-work in `ahau-monorepo` (e.g. `pr-3-6-7-handoff.md`). References to files that only exist on unmerged `ahau-monorepo` branches are noted inline where found, not fixed — those branches' PRDs/plans/learnings docs were deliberately left unmigrated (active in-progress work, not settled history), decided in [Wayfinder ticket #12](https://github.com/ahau01/ahau-v2/issues/12); the concrete evidence they surfaced is instead captured in [`history/why-the-rewrite.md`](history/why-the-rewrite.md). |
| [`history/ahau-monorepo-codebase-map.md`](history/ahau-monorepo-codebase-map.md) | Auto-generated map of `ahau-monorepo`'s own code layout (1549 files, mapped 2026-09-09). Describes that repo's structure, not `ahau-v2`'s — useful for tracing where a piece of history came from, nothing more. |

## Where things came from

This migration is tracked as a Wayfinder map:
[Wayfinder map: migrate ahau-monorepo history into ahau-v2](https://github.com/ahau01/ahau-v2/issues/1).
Its Decisions-so-far section is the audit trail for what moved, from where,
and any reconciliation done along the way.
