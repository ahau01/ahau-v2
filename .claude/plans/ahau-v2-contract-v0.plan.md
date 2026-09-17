# Plan: Āhau v2 — Data-Access Contract v0

**Source PRD**: `.claude/prds/ahau-v2-repo-foundation.prd.md`
**Selected Milestone**: 2 — Data-access contract v0
**Complexity**: Large

## Summary

Stand up the `ahau-v2` repository and express the 68 kept accessors from
Milestone 1 as a typed, backend-agnostic data-access contract — the definition
of what any backend must provide. The contract is authored in TypeScript in its
own repo so `tsc --noEmit` is a real gate; an unchecked type contract is prose
with angle brackets.

Scope decision taken with the product owner: `ahau-v2` is created at this
milestone rather than Milestone 3, as a local git repo **and** a GitHub repo
under `ahau01`. This front-loads a decision the PRD still lists as open — see
Risks.

## Patterns to Mirror

`ahau-v2` has no existing code, so there is no in-repo pattern for its contract,
its tests, or its layout. That is stated rather than invented. What follows is
what genuinely exists and should be carried forward.

| Category | Source | Pattern |
|---|---|---|
| Requirements | `plans/data-access-triage.json` | 77 decisions with purpose and reason; the 68 `keep` entries are this milestone's input |
| Evidence | `plans/data-access-inventory.json` | Per-accessor domain, variables, SSB flags, fragment inheritance, call-site counts |
| Domain grouping | 16 domains derived from module paths | Already-validated split; `getCollection` is misfiled and should join `collection` |
| Completeness gating | `scripts/inventory-data-access.mjs` `--ci` | A mechanical gate that fails while work is incomplete, rather than a checklist someone remembers to read |
| Operation shape being replaced | `ui/src/store/modules/person/apollo-helpers.js:11` | `(args) => ({ query, variables, fetchPolicy })` — what the contract supersedes |
| Naming to correct | triage entries for `getMembers`, `deleteSubGroup`, `DELETE_ARTEFACT`, `listGroupApplications` | Names that misdescribe behaviour; contract uses honest ones |
| Tests | none | No test pattern exists for `ahau-v2`. Establishing one is part of Task 1, not inherited. |

## Files to Change

Spans two repositories.

**New — `ahau-v2`**

| File | Action | Why |
|---|---|---|
| `package.json`, `tsconfig.json`, `.gitignore` | CREATE | Minimal TS toolchain so `tsc --noEmit` gates the contract |
| `src/contract/capabilities.ts` | CREATE | Capability declaration and negotiation types |
| `src/contract/semantics.ts` | CREATE | Cross-cutting shapes: deletion, write acknowledgement, atomicity, traversal |
| `src/contract/types/*.ts` | CREATE | Domain record types (identity, group, person, profile, link, story, collection, artefact, submission, application, credential, pataka) |
| `src/contract/operations/*.ts` | CREATE | The 68 operations, grouped by domain |
| `scripts/check-contract-coverage.mjs` | CREATE | Cross-references contract operations against the triage; fails on drift |
| `docs/contract-decisions.md` | CREATE | Why each cross-cutting semantic was settled as it was |

**Updated — this repo**

| File | Action | Why |
|---|---|---|
| `.claude/prds/ahau-v2-repo-foundation.prd.md` | UPDATE | Milestone 2 → `in-progress`, `Plan` cell → this plan |

Nothing under `ui/src` is modified.

## Tasks

### Task 1: Stand up `ahau-v2`
- **Action**: Create the repo locally and on GitHub under `ahau01`. Add a minimal TypeScript toolchain — no framework yet, since the shell is Milestone 3 — with `tsc --noEmit` and a test runner wired as scripts. Pin one Node version and record it.
- **Mirror**: Nothing to mirror; this is greenfield. Deliberately avoid inheriting this repo's split Node requirements (`>=18 <19` at root versus `12.19.0` in mobile), which is one of the PRD's stated evidence points.
- **Validate**: A fresh clone runs `npm install && npx tsc --noEmit` cleanly on one Node version.

### Task 2: Derive the operation manifest mechanically
- **Action**: Generate the list of 68 operations from `plans/data-access-triage.json` rather than transcribing it, carrying each operation's purpose, domain, read/write kind and SSB flags across. The 6 drops must be absent; the 3 merges must appear only as their targets.
- **Mirror**: `scripts/inventory-data-access.mjs` — derive from data, never retype it.
- **Validate**: Manifest contains exactly 68 entries, 28 reads and 40 writes, and no entry named `getArtefact`, `getArtefacts`, `getCommunity`, `updateAutoPrune`, `disableAutoPrune`, `getAutoPruneConfig`.

### Task 3: Settle the cross-cutting semantics first
- **Action**: Decide and document, before writing any operation, the four themes Milestone 1 surfaced: what deletion guarantees (9 accessors), what a write returns (every `save*`), whether paired writes are atomic (`deleteTribe`, `updateTribe`, `deleteSubGroup`), and whether traversal is expressed as a walk or a filter (`getDescendantLinks`, `getFamilyLinks`, `getAllStoriesByMentions`). Record the reasoning, not just the choice.
- **Mirror**: The triage's own discipline — purpose and reason recorded per decision, in `docs/contract-decisions.md`.
- **Validate**: Each of the four has a written decision naming the accessors it governs and what each candidate backend can honour.

### Task 4: Define capability negotiation
- **Action**: Express how a backend declares what it cannot do, so the contract is not flattened to the intersection of Holochain and nostr. Must cover the cases already found: field-level approval (`allowedFields`), group membership enforcement (`acceptGroupApplication`, `addAdminsToGroup`), name search (`findPersonByName`), server-side traversal, and paired-write atomicity.
- **Mirror**: None — this is the PRD's central design question and has no precedent in the codebase.
- **Validate**: For each of those five cases the contract can express "this backend does not provide this", and a caller can detect it without exception handling.

### Task 5: Define domain record types
- **Action**: Type the records the operations exchange, replacing SSB constructs with backend-neutral equivalents — identity in place of `feedId`, visibility in place of `recps`, membership in place of authorship for `getMembers`. Keep `person` and `profile` distinct; keep public/private group records paired.
- **Mirror**: `plans/data-access-inventory.json` `ssbFlags` and `flagsViaFragments` — flags inherited through a fragment are one decision for every operation using it, not many.
- **Validate**: No contract type names `feedId`, `recps`, `authors`/`intervals`, `tombstone` or `originalAuthor`; each has a documented replacement.

### Task 6: Express the 68 operations
- **Action**: Write the operations grouped by domain, each carrying its purpose from the triage. Apply the corrections recorded there: honest names, merges folded into targets, `getCollection` grouped with `collection`, permission decisions moved backend-side (`loadPersonList`, the `approve*` dispatch).
- **Mirror**: Domain grouping from the inventory; naming corrections from triage reasons.
- **Validate**: `npx tsc --noEmit` passes; every operation carries a purpose.

### Task 7: Completeness gate
- **Action**: Write `scripts/check-contract-coverage.mjs` cross-referencing contract operations against the triage: every `keep` maps to exactly one operation, every operation traces to a `keep`, no `drop` appears, each merge resolves to its target.
- **Mirror**: `scripts/inventory-data-access.mjs` `--ci` — a gate that fails loudly, as the unresolved-accessor guard did.
- **Validate**: Exits 0 on a complete contract, non-zero when an operation is removed or invented.

## Validation

```bash
npx tsc --noEmit
```

```bash
node scripts/check-contract-coverage.mjs --ci
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Contract inherits GraphQL-over-SSB shape, since its only source is GraphQL-era accessors | High | Task 6 works from the triage's recorded *purpose* rather than its query shape. That field exists precisely for this, and was written before any decision. |
| Designed twice-blind — no screen consumes it, no backend implements it — and proves wrong at Leg 2 | High | Carried from the PRD and not solvable here. Treat v0 as provisional and expect revision; Task 3's written reasoning lets Leg 2 re-derive rather than re-guess. |
| Capability negotiation over-engineered before any adapter exists | Medium | Restrict Task 4 to the five cases Milestone 1 actually evidenced. Do not generalise beyond them. |
| 68 operations designed in one pass without feedback | Medium | Tasks 3–5 settle the cross-cutting shapes first, so Task 6 is largely mechanical. If Task 6 keeps forcing changes back into Task 3, stop: that is evidence the semantics are unsettled, not that the operations are hard. |
| Creating the GitHub repo answers the PRD's open licence and repo-home questions by default rather than by decision | Medium | Flagged explicitly. The repo can be created private and unlicensed for now; record it as still open rather than treating creation as settlement. |
| Contract drifts from triage as it is written | Medium | Task 7's gate, plus Task 2 deriving the manifest mechanically instead of by transcription. |

## Acceptance

- [ ] All tasks complete
- [ ] Validation passes
- [ ] `ahau-v2` exists locally and on GitHub, and a fresh clone typechecks on one Node version
- [ ] All 68 kept accessors map to exactly one contract operation each
- [ ] The 6 dropped accessors appear nowhere in the contract
- [ ] The 3 merges appear only as their targets
- [ ] The four cross-cutting semantics are decided in writing, with reasoning
- [ ] Capability negotiation covers all five evidenced cases
- [ ] No contract type names an SSB construct
- [ ] No files under `ui/src` modified

---
*Status: COMPLETE. Delivered in https://github.com/ahau01/ahau-v2 — 65 operations covering all 68 kept accessors, gated by scripts/check-contract-coverage.mjs.*

## Deviations from this plan, as built

- **14 domain files, not 16.** `tribe`, `subtribe` and `community` are one
  concern and were triaged together; `getCollection` moved to `collection`,
  which the triage recorded as misfiled. The manifest's domains come from
  source file paths, so following them exactly would have reproduced a layout
  the triage criticised.
- **65 operations, not 68.** The four typed approvals collapse into one. Triage
  kept them apart and recorded the collapse as a Milestone 2 decision; this was
  that decision. Each kept accessor still maps to exactly one operation.
- **`ahau-v2` created at this milestone rather than Milestone 3**, agreed with
  the product owner so the contract could be authored typechecked.
