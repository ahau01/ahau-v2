# Planning documents

Copies of the requirements and plans that produced this repository, brought over
from the `ahau` repository so `ahau-v2` carries its own reasoning rather than
depending on a repository it exists to replace.

| Document | Covers |
|---|---|
| `prds/ahau-v2-repo-foundation.prd.md` | **Leg 1** — repo, contract, fixtures, conformance suite. Complete. |
| `prds/ahau-v2-frontend-rebuild.prd.md` | **Leg 2** — protocol adapters and the agnosticism proof. Not started. |
| `plans/ahau-v2-repo-foundation.plan.md` | Milestone 1 — data-access inventory |
| `plans/ahau-v2-contract-v0.plan.md` | Milestone 2 — the contract |
| `plans/ahau-v2-shell.plan.md` | Milestone 3 — the Svelte shell |
| `plans/ahau-v2-fixtures.plan.md` | Milestone 4 — reference implementation |
| `plans/ahau-v2-conformance-suite.plan.md` | Milestone 5 — conformance suite |

## Which copy is canonical

**These are copies.** The originals live in `.claude/` in the `ahau` repository,
alongside the inventory and triage that several of them depend on.

Duplicated documents drift. The intended direction of travel is that `ahau`
becomes read-only and this repository takes over, at which point these copies
become canonical and the originals should be removed rather than left to
disagree. Until someone makes that call, treat `ahau` as the source and refresh
from it rather than editing both.

## A note on paths inside these documents

Relative paths in these documents are written from the `ahau` repository's root.
`plans/data-access-triage.json` and `plans/data-access-inventory.json` refer to
files there, not here.

The equivalents in this repository are vendored under `contract-source/`, which
is what the manifest derivation and the coverage gate actually read. Refresh
them with `npm run refresh:source`.

## Where the outcomes are recorded

The plans describe what was intended. What actually happened, including where
the contract was wrong, is in `docs/`:

| Document | Contents |
|---|---|
| `docs/contract-decisions.md` | Why the four cross-cutting semantics are shaped as they are |
| `docs/contract-friction.md` | Thirteen findings from implementing and consuming the contract; eleven resolved, two open |
| `docs/token-verification.md` | Which design tokens were confirmed, corrected, or chosen rather than recovered |
| `docs/design-parity.md` | How parity is judged, and what it does not cover |
| `docs/writing-an-adapter.md` | How to implement the contract and run the conformance suite |

`contract-friction.md` is the most useful of these to read first if you are
picking up Leg 2. It records what the contract got wrong, which is more
informative than what it got right.
