# Plan: Āhau v2 — Fixture Reference Implementation

**Source PRD**: `docs/history/leg1/ahau-v2-repo-foundation.prd.md`
**Selected Milestone**: 4 — Fixture reference implementation
**Complexity**: Medium

## Summary

Implement the contract's 65 operations in memory over realistic whakapapa
sample data, proving it is implementable at all — and finding out where it is
wrong. The contract was written twice-blind, with no screen consuming it and no
backend satisfying it, so this is the first real feedback available on it.

**Scope note.** The PRD states this milestone's outcome as "the contract is
satisfied in memory *and the shell runs* on realistic whakapapa data". The
shell is Milestone 3 and does not exist, so the second half is out of reach
here. Taken deliberately out of order, on the reasoning that writing 65 method
bodies against the contract surfaces its defects in hours, whereas building a
shell first means building on a contract nobody has tried to satisfy.
Milestone 3 inherits the "shell runs on fixtures" half.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Contract surface | `ahau-v2` `src/contract/operations/*.ts` | 65 operations across 14 domain interfaces, composed as `DataAccess` |
| Capability declaration | `src/contract/capabilities.ts` | `EnforcementLevel` and `Supported<T>`; refusal is a value, not an exception |
| Cross-cutting shapes | `src/contract/semantics.ts` | `WriteResult`, `PairedWriteResult`, `RecordStatus`, `TraversalRequest` |
| Tests | `src/contract/capabilities.test.ts` | `node:test` against compiled output; control tests in both directions |
| Gating | `scripts/check-contract-coverage.mjs` | A gate that fails loudly and is proven able to fail |
| Decision records | `docs/contract-decisions.md` | Reasoning recorded, not just conclusions |

## Files to Change

**New — `ahau-v2`**

| File | Action | Why |
|---|---|---|
| `src/fixtures/data.ts` | CREATE | Sample whakapapa: a small community with people, links, groups, stories |
| `src/fixtures/store.ts` | CREATE | In-memory store with retraction, visibility filtering and membership |
| `src/fixtures/backend.ts` | CREATE | `createFixtureBackend(profile)` returning a `DataAccess` |
| `src/fixtures/profiles.ts` | CREATE | Capability profiles, including degraded ones |
| `src/fixtures/*.test.ts` | CREATE | Behavioural tests per domain |
| `docs/contract-friction.md` | CREATE | Where the contract resisted implementation, and what it implies |

**Updated — this repo**

| File | Action | Why |
|---|---|---|
| `docs/prds/ahau-v2-repo-foundation.prd.md` | UPDATE | Milestone 4 → `in-progress`, `Plan` cell → this plan |

## Tasks

### Task 1: Sample whakapapa data
- **Action**: Build a small but structurally real dataset — a group with a public and private face, a subgroup, people spanning several generations with parent and partner links, at least one retracted record, stories mentioning people, and a pending submission and application. Fictional names throughout; no real whakapapa.
- **Mirror**: Record shapes in `src/contract/types/records.ts`.
- **Validate**: Data typechecks against the contract types with no casts.

### Task 2: In-memory store
- **Action**: Implement storage with the behaviours the contract promises rather than a plain map: retraction hides records from reads without erasing them, visibility filters results by the caller's membership, and paired writes are applied together or reported as independent according to the active profile.
- **Mirror**: `RecordStatus`, `Visibility`, `Membership` in `src/contract/types/primitives.ts`.
- **Validate**: A retracted record is absent from reads but still present in the store; a record scoped to a group is invisible to a non-member.

### Task 3: Capability profiles
- **Action**: Provide at least two profiles: one where everything is enforced, and one degraded to resemble a weak backend — advisory permissions, no name search, shallow traversal, non-atomic paired writes, non-propagating retraction. The fixture reads its profile rather than hard-coding capability answers.
- **Mirror**: `Capabilities` and `EnforcementLevel`.
- **Validate**: The same operation returns a value under one profile and a `Supported` refusal under the other, with no change to calling code.
- **Why this matters**: it lets Milestone 5's conformance suite exercise capability negotiation before any real adapter exists, which is otherwise untestable until Leg 2.

### Task 4: Implement the 65 operations
- **Action**: Implement every operation on `DataAccess`. Where the contract is awkward to satisfy, implement it as specified and record the friction rather than quietly redesigning the contract mid-implementation.
- **Mirror**: The domain interfaces; each operation's doc comment states its source accessor and intent.
- **Validate**: `tsc --noEmit` passes with the fixture typed as `DataAccess` — no missing members, no casts.

### Task 5: Behavioural tests
- **Action**: Test what the contract promises, not what the fixture happens to do: retraction hides but does not erase, visibility excludes non-members, paired writes report honestly under both profiles, traversal respects depth limits, refusals are values.
- **Mirror**: `src/contract/capabilities.test.ts`.
- **Validate**: `npm test` green; each test names the contract promise it covers.

### Task 6: Record the friction
- **Action**: Write `docs/contract-friction.md` — every place the contract was awkward, ambiguous, or wrong, with what it suggests. This is the milestone's most valuable output: the first evidence about a contract designed without a consumer.
- **Mirror**: `docs/contract-decisions.md`.
- **Validate**: Every friction entry names the operation or type involved and says what it would take to resolve it.

## Validation

```bash
npm test
```

```bash
npm run check:coverage
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| The fixture quietly reshapes the contract to whatever is easy to implement, destroying its value as a test of the contract | High | Task 4 implements as specified and records friction instead. Contract changes are a separate, deliberate step after the friction is written down. |
| Milestone 5's conformance suite later over-fits these fixtures, since the same author wrote both | High | Carried from the Milestone 1 plan. Milestone 5 must derive cases from the triage's recorded purposes, not from fixture behaviour. A test the fixture passes trivially is evidence of nothing. |
| An in-memory implementation satisfies the contract easily and is mistaken for proof of portability | Medium | An in-process store can enforce anything; that is why Task 3's degraded profile exists. Say plainly in the friction document that passing here proves implementability, not portability. |
| Sample data is too thin to exercise the hard paths | Medium | Task 1 requires multi-generation links, a retracted record, a subgroup and a pending submission specifically, because those are where the contract's harder promises live. |
| Fictional whakapapa is mistaken for real | Low | Invented names throughout, stated in the file header. No real genealogy enters the repository. |

## Acceptance

- [ ] All tasks complete
- [ ] Validation passes
- [ ] The fixture is typed as `DataAccess` with every operation implemented and no casts
- [ ] Two capability profiles, and the same call path works under both
- [ ] Retraction hides without erasing; visibility excludes non-members
- [ ] Friction document written, with each entry naming what would resolve it
- [ ] No contract change made silently during implementation

---
*Status: COMPLETE. 69 operations implemented, 36 tests passing, in https://github.com/ahau01/ahau-v2*

## Outcome

Eleven friction findings, seven resolved during this milestone. The three
significant ones were acted on, and acting on the first exposed a twelfth
problem the contract could not have revealed by inspection: a submission
recorded what it targeted but not what it proposed, so approval was specified to
do something impossible.

Findings 5 and 6 turned out to be symptoms of a method failure rather than
design faults. Seven inline gql templates were never triaged in Milestone 1, and
its --ci gate reported complete work anyway because it counted accessors only.
Four operations were recovered from them. The gate now counts both sets.

The shell half of this milestone as the PRD states it belongs to Milestone 3,
which remains pending.
