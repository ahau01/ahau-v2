# Plan: Āhau v2 — Conformance Suite

**Source PRD**: `.claude/prds/ahau-v2-repo-foundation.prd.md`
**Selected Milestone**: 5 — Conformance suite
**Complexity**: Medium

## Summary

Make adapter correctness executable. A Leg 2 adapter author should be able to
run one suite against their backend and learn whether it satisfies the
contract — and where it does not, whether that is a legitimate declined
capability or a failure.

This is the last milestone of Leg 1 and the thing that makes Leg 2 possible for
anyone who did not write the contract.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Requirements | `contract-source/data-access-triage.json` | 77 decisions, each with a recorded **purpose** — the source of test cases |
| Leakage requirements | `contract-source/data-access-leakage-triage.json` | 6 further decisions, 4 of them kept |
| Contract surface | `src/contract/operations/*.ts` | 69 operations across 14 domains, composed as `DataAccess` |
| Capability handling | `src/contract/capabilities.ts` | `Supported<T>`, `EnforcementLevel`; declining is a value |
| Test style | `src/fixtures/backend.test.ts` | `node:test`, each test named for the contract promise it covers |
| Gating | `scripts/check-contract-coverage.mjs` | Both directions, control-tested, fails loudly |
| Two-profile technique | `src/fixtures/profiles.ts` | The same call path under a strong and a weak backend |

## Files to Change

**New — `ahau-v2`**

| File | Action | Why |
|---|---|---|
| `src/conformance/suite.ts` | CREATE | The suite: takes a `DataAccess`, returns results |
| `src/conformance/cases/*.ts` | CREATE | Cases grouped by domain, each naming its source purpose |
| `src/conformance/report.ts` | CREATE | Pass / fail / declined, with the capability behind each decline |
| `src/conformance/index.ts` | CREATE | Entry point an adapter author calls |
| `src/conformance/*.test.ts` | CREATE | The suite run against the fixture under both profiles |
| `scripts/check-conformance-coverage.mjs` | CREATE | Every kept operation has at least one case |
| `docs/writing-an-adapter.md` | CREATE | How to implement the contract and run the suite |

**Updated — this repo**

| File | Action | Why |
|---|---|---|
| `.claude/prds/ahau-v2-repo-foundation.prd.md` | UPDATE | Milestone 5 → `in-progress`, `Plan` cell → this plan |

## Tasks

### Task 1: Suite architecture
- **Action**: A suite that takes any `DataAccess` and returns structured results, rather than a test file that only runs in this repo. An adapter in another repository must be able to consume it.
- **Mirror**: `DataAccess` composition; `Supported<T>` for declines.
- **Validate**: The suite runs against the fixture without importing anything fixture-specific.

### Task 2: Three outcomes, not two
- **Action**: Every case reports pass, fail, or **declined**. Declining a capability the backend never claimed is not a failure; claiming a capability and then not honouring it is. The report must distinguish them, and must fail a backend that declares `enforced` and behaves advisorily.
- **Mirror**: `EnforcementLevel`, and the fixture's two profiles.
- **Validate**: The degraded profile produces declines and no failures; a deliberately mislabelled profile produces failures.

### Task 3: Derive cases from purposes, not from the fixture
- **Action**: Write each case from the **purpose** recorded in triage, citing it. Where a case cannot be written from the purpose alone, that is a finding about the purpose, not a licence to read the fixture.
- **Mirror**: The triage's own discipline.
- **Validate**: Each case names its source accessor and quotes or paraphrases the recorded purpose.
- **Why this matters**: the standing risk since Milestone 1 is that the suite over-fits the fixture, because the same author wrote both. A test the fixture passes trivially is evidence of nothing.

### Task 4: Cover the promises, not just the surface
- **Action**: Cover the four cross-cutting semantics explicitly — retraction hides without erasing, writes acknowledge honestly, paired writes report atomicity, traversal respects declared depth — plus the cascades that exist only in doc comments, such as `retractPerson` retracting links.
- **Mirror**: `docs/contract-decisions.md`.
- **Validate**: Each of the four semantics has cases that fail a backend ignoring it.

### Task 5: Coverage gate
- **Action**: `check-conformance-coverage.mjs` fails when a kept operation has no case, or a case names an operation that does not exist.
- **Mirror**: `check-contract-coverage.mjs`, including its both-directions design — and finding 11, which is why the set being counted matters more than the count.
- **Validate**: Exits 0 when complete; non-zero when a case is removed or invented. Control tested.

### Task 6: Adapter authoring guide
- **Action**: `docs/writing-an-adapter.md` — what to implement, how to declare capabilities honestly, how to run the suite, and how to read a declined result.
- **Mirror**: `docs/contract-decisions.md` and `contract-friction.md`.
- **Validate**: The guide's steps can be followed against the fixture without consulting the source.

## Validation

```bash
npm test
```

```bash
npm run check:conformance
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| The suite over-fits the fixture, since the same author wrote both | High | Task 3 derives cases from recorded purposes and cites them. Standing risk since Milestone 1; it does not go away by being noticed. |
| A backend passes by declaring capabilities dishonestly | Medium | Task 2 fails a backend whose declared enforcement does not match its behaviour. Declaring `advisory` is always allowed; declaring `enforced` is a claim the suite checks. |
| Cases test the fixture's incidental behaviour rather than contract promises | Medium | Task 4 targets the four decided semantics and the documented cascades specifically. |
| The suite covers the surface but not the hard paths, and Leg 2 inherits false confidence | Medium | Task 5 gates operation coverage; Task 4 gates promise coverage. Surface coverage alone is the weaker of the two and must not stand in for the other. |
| Coverage is gated against the wrong set, as in finding 11 | Medium | Count both triage files, as `check-contract-coverage.mjs` now does. Name the set in the report so it is visible rather than assumed. |

## Acceptance

- [ ] All tasks complete
- [ ] Validation passes
- [ ] The suite runs against any `DataAccess` without fixture-specific imports
- [ ] Pass, fail and declined are distinguished; a dishonest capability claim fails
- [ ] Every kept operation has at least one case, gated mechanically
- [ ] All four cross-cutting semantics have cases, plus documented cascades
- [ ] Each case cites the recorded purpose it derives from
- [ ] An adapter author can follow the guide without reading the contract source

---
*Status: COMPLETE. 77 cases across 69 operations, 43 tests passing, in https://github.com/ahau01/ahau-v2*

## Outcome

The suite runs against any `DataAccess` with no fixture imports, reports pass /
fail / declined, and fails a backend that declares a capability it does not
honour. Coverage is reported in two parts: 7 operations behaviourally, 62 by a
presence check alone — counted separately so existence cannot stand in for
behaviour.

Worth recording: the honesty test needed a second attempt. The fixture derives
its behaviour from its capabilities, so it cannot lie by construction, and the
first version of the test merely produced a stronger backend. Overriding the
declaration while leaving weak behaviour in place is the actual shape of an
adapter that overclaims.
