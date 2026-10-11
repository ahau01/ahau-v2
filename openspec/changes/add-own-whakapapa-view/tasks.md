# Tasks

Starts after #47 (edit your profile) ships; group 3 depends on #47 for the profile-edit step in 3.6.

Order is bottom-up: the integrity rules first, because they are what the kaupapa promises rest on, then the walk, then the conductor tests that hold those promises, then the client and the page. Each group lands its own tests.

There are no two-devices-offline-then-sync tasks, and design D8 is why: no whakapapa entry is published, so there is no sync, and no entry can be updated, so there is no conflicting edit to merge. What that rule protects here is two sources asserting contradictory relationships, and 3.1 tests exactly that against a real conductor.

## 1. The whakapapa integrity zome (design D1–D3, D6)

- [ ] 1.1 Create `dnas/ahau/zomes/integrity/whakapapa/` with the `Person` (`Myself` | `Described`), `Assertion` (`ParentOf` | `PartnerOf` | `SiblingOf`, subject and object as `ActionHash`) and `Retraction` entry types, all `visibility = "private"`, and no owner, subject-agent or source field on any of them. Add it to both `dnas/ahau/workdir/dna.yaml` and `dnas/ahau/test/workdir/dna.yaml`. Verify: `npm run build:happ` packs the DNA and `npm run test:zomes` compiles.
- [ ] 1.2 Refuse every `Update` of a whakapapa entry type in `validate`, with a named reason constant as the profiles zome does. Verify: a `cargo test` case per entry type asserts the refusal on `StoreRecord`, `StoreEntry`/`RegisterUpdate` and `RegisterAgentActivity`, so no authority can hold a rewritten assertion as valid.
- [ ] 1.3 Refuse every `Delete` of a whakapapa entry type, with a reason naming retraction as the way to correct. Verify: `cargo test` cases for `StoreRecord`, `RegisterDelete` and `RegisterAgentActivity`.
- [ ] 1.4 Refuse a `Retraction` whose named assertion was authored by anyone other than the retractor, using `must_get_action` on the retracted action. Verify: `cargo test` cases — same author accepted, different author refused, on both the record and the agent-activity op.
- [ ] 1.5 Accept `Person::Myself` and `Person::Described`, and accept an assertion whoever authored the people it references. Verify: `cargo test` cases, including an assertion by one author referencing a `Person` authored by another, which must be valid (a source may describe a relationship between people another source described).
- [ ] 1.6 Document the kaupapa reasoning in the module doc comment as `profiles/src/lib.rs` does: the author is the source, there is no owner field, an assertion is never updated, and a retraction binds only its own source. Verify: the comment names CLAUDE.md rules 1 and 2 and contract-decisions §1, and `cargo test` still passes.

## 2. The whakapapa coordinator zome (design D4–D5, D7)

- [ ] 2.1 Add a call to `dnas/ahau/zomes/coordinator/profiles/` returning only the public `Profile` for the calling agent, with no `PersonalInformation` in its return type. Verify: a `cargo test` or type-level check that its return type has no personal field, and `npm run test:conductor` still passes for the existing profile tests.
- [ ] 2.2 Create `dnas/ahau/zomes/coordinator/whakapapa/` with `create_person`, `create_assertion` and `create_retraction`. Verify: a conductor test writes one of each and reads them back off the author's chain.
- [ ] 2.3 Implement `get_my_whakapapa(max_depth)`: query the author's own chain, drop assertions the author retracted, find the roots (people with no active asserted parent), walk out from each with a visited set and a depth cap, and return flat `people` and `relationships` with the authoring agent as `source` on every one, plus `roots` and `truncated`. No DHT read, no links. Verify: a conductor test on a three-generation fixture returns the expected roots, people and relationships, each stamped with the author.
- [ ] 2.4 Project `Person::Myself` details through the 2.1 call, with an explicit field-by-field mapping and no spread or flatten, and no copy stored in any entry. Verify: a conductor test reads a whakapapa containing the author's self-person and gets their profile's name.
- [ ] 2.5 Return a person with no details, rather than inventing any, when the projection finds no profile. Verify: a conductor test on a cell whose agent has no profile but has written a self-person.

## 3. Conductor tests for the kaupapa promises (design D8, D11)

- [ ] 3.1 Two agents on one network each assert a different parent for the same child. Verify: both assertions are still readable from their own authors' chains afterwards, each naming its own source, and neither agent's `get_my_whakapapa` returns the other's assertion or the other's person.
- [ ] 3.2 A source retracts its own assertion. Verify: its tree no longer shows the relationship, the retracted assertion and the retraction are both still on its chain, and a second agent's identical assertion is unaffected in that agent's own read.
- [ ] 3.3 An agent attempts to retract an assertion another agent authored. Verify: the write is refused with the reason from 1.4.
- [ ] 3.4 An agent attempts to update and then to delete a stored assertion. Verify: both are refused with the reasons from 1.2 and 1.3, so correction can only be retraction plus a new assertion.
- [ ] 3.5 Add a `rogue_whakapapa` coordinator to `dnas/ahau/test/zomes/`, alongside `rogue_profiles`, and have it try to read another agent's whakapapa entries by every route it has. Verify: it gets none of them, matching the promise `validation.conductor.ts` already makes for personal information.
- [ ] 3.6 An agent with all six personal-information fields filled in, and a self-person in their whakapapa, edits their profile name (#47). Verify: the whakapapa read model contains the new name, no whakapapa entry was written in between, and the serialised read model contains no email, phone, address, postcode, city or country value.
- [ ] 3.7 Fixtures that break the walk: `parent-of(A, B)` with `parent-of(B, A)`, and a descent deeper than `max_depth`. Verify: the first returns and draws each person once per path, and the second comes back with `truncated` set.

## 4. The client boundary and the tree (design D9)

- [ ] 4.1 Create `src/whakapapa/client.ts` as the only code making whakapapa zome calls, with its own `ZOME`, its own exported function list holding the read call alone, and read-model types carrying `source` on every person and relationship. Verify: `npm run check:app` passes, and a test asserts the exported function list holds only the read call, so no write call is granted to the app.
- [ ] 4.2 Create `src/whakapapa/tree.ts`, plain TypeScript with no Svelte or Holochain import: takes the read model, returns one tree per root with partners and directly-asserted siblings beside a person and children below, repeated under each asserting parent, with its own visited guard. Verify with plain-TS tests, one per drawing scenario in the spec:
  - three generations descend in order
  - a child asserted under two separate parents appears under each, with neither marked as the real place
  - two unconnected roots give two trees
  - partners appear beside each other at one generation
  - a `sibling-of` with no asserted shared parent appears beside its sibling, and one with a shared parent is not drawn twice
  - an assertion retracted by its source does not appear
  - a cycle fixture returns rather than hanging
- [ ] 4.3 Keep the source on everything `tree.ts` returns, even though no screen reads it yet. Verify: a plain-TS test asserts every person and relationship in the returned trees names its source.

## 5. The page (design D9, `own-whakapapa` and `navigation` specs)

- [ ] 5.1 Replace `StillToCome` in `src/app/shell/WhakapapaPage.svelte` with the tree from `tree.ts`, read through the client on open and not again, with reading, empty, failed and populated states. The component makes no zome call and does no walking. Verify: `npm run check:app` passes and a Vitest test renders a three-generation fixture.
- [ ] 5.2 The empty state says nothing has been added yet, with a Whakapapa heading, no error, no sample people and no control that does nothing. Verify: a Vitest test with a client returning an empty read model.
- [ ] 5.3 The failed state says the whakapapa could not be read and does not say nothing has been added. Verify: a Vitest test with a client whose read rejects.
- [ ] 5.4 Say the whakapapa goes further than is shown when the read comes back `truncated`. Verify: a Vitest test on a truncated read model.
- [ ] 5.5 No add, edit, remove, import, export, share, submit or new-whakapapa control in any state. Verify: a Vitest test asserts none of those controls is present, on the empty, populated and truncated states.
- [ ] 5.6 Focus the page heading on navigation, as the other pages do with `focusOnMount`. Verify: a Vitest test activates Whakapapa in the side nav and checks `document.activeElement`.
- [ ] 5.7 Update the navigation tests that asserted Whakapapa says "still to come" and makes no zome call, to match the replaced requirements in `specs/navigation/spec.md`: Archive and the tribe list keep both promises, Whakapapa keeps neither. Verify: `npm run test:app` passes with no test still expecting the old Whakapapa behaviour.

## 6. Vocabulary and inventory (design D10)

- [ ] 6.1 Use `domain-modeling` to add Person, source, assertion, retraction and whakapapa to `CONTEXT.md`, each with what to avoid (edge, link, record owner, canonical person, merge). Verify: `CONTEXT.md` holds the five terms and Person says explicitly that it is not a Profile and not the person's identity.
- [ ] 6.2 Fill in the Keep? column in `docs/capability-inventory.md`'s "Single whakapapa" rows for what this slice covers (viewing a tree from a focus ancestor) and what the proposal flagged as not done. Verify: every row this slice touches has an answer, and no row claims something this change did not build.

## 7. Integration check

- [ ] 7.1 Whole-suite check. Verify each of: `npm test`, `npm run test:app`, `npm run check:app`, `npm run test:zomes`, `npm run test:conductor` all pass, and `production-build.test.ts` is still green.
- [ ] 7.2 Walk it by hand with `npm run dev` + `npm run conductor` after `hc sandbox clean`. Verify: a new agent creates a profile, opens Whakapapa and sees the empty state; after a fixture is written through the zome, the same page draws the tree; the other sections are unchanged.
- [ ] 7.3 Decide with the slice owner whether to capture the old app's whakapapa tree for a parity baseline, or to accept the code-read baseline (design, "Risks"). Verify: the decision is recorded in `docs/design-parity.md`, with any deliberate differences listed there as the shell slice did.

## Workflow follow-up

- Human review of `proposal.md` and `design.md` against CLAUDE.md before `/openspec-apply-change`, as `docs/agents/openspec.md` step 3 requires for anything touching relationship data.
- Open the PR, and open a GitHub issue for the write slice (adding and correcting whakapapa) carrying the "Flagged, not done" list forward.
- `/openspec-verify-change`, then `/openspec-archive-change` in the same PR.
