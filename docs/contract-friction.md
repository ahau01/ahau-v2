# Contract friction

What implementing the contract actually surfaced.

The contract was written twice-blind: nothing consumed it and nothing satisfied
it. The fixture is the first thing to try, so this is the first real evidence
about it. Every entry names the operation or type involved and what it would
take to resolve.

**What passing proves, and what it does not.** All 65 operations are
implemented and 23 behavioural tests pass, so the contract *is implementable*.
That is not the same as portable: an in-process store can enforce anything, and
enforcing everything is precisely what a relay-based backend cannot do. The
degraded capability profile exists to stop this fixture flattering the design,
but it is a simulation, not a protocol.

---

## Significant — should be settled before Milestone 5

### 1. Approval does not say what happens to the thing approved

`submissions.approveSubmissionFields` and `approveSubmission` accept a proposal
and return a `WriteResult`, but the contract never says the proposed change is
*applied*. The fixture marks the submission resolved and stops, because there
is nothing to implement — and no test could tell the difference between a
backend that applies changes and one that quietly discards them.

This is the most serious gap found. Approval is the entire point of the
submissions workflow, and the contract currently describes only its
bookkeeping.

**To resolve**: say whether approval applies the change, and if so what the
result identifies — the submission, or the record it altered. `allowedFields`
makes this sharper, since partial application must state what was applied.

### 2. Creating a group cannot tell you the group's identity

`group.createGroup` and `group.createSubgroup` return `WriteResult`, whose `id`
is a `RecordId`. Groups are keyed by `GroupId`. A caller therefore cannot learn
the identity of the group it just created, and the fixture fabricates one it
then cannot use.

The same shape affects anything whose identity is not a `RecordId`, which today
means groups and storehouses.

**To resolve**: let a write result carry the identity of what it created, or
give creation operations their own return types. This is a typing decision, not
a protocol one, and is cheap to fix now and expensive after adapters exist.

### 3. Capability gating is applied inconsistently

Traversal and name search return `Supported<T>`, so a caller branches on
refusal. But `group.grantAdministration` depends on `membershipEnforcement` and
`submissions.approveSubmissionFields` depends on `fieldLevelApproval`, and both
return a plain `WriteResult` — a caller cannot tell from the result whether the
thing was enforced or merely recorded.

That is the difference between a permission and a suggestion, and on tribal
records it is not a detail.

**To resolve**: either return `Supported<T>` wherever a declared capability
governs the outcome, or state explicitly that static `capabilities` inspection
is the only signal for write operations and that callers must check it first.
The current mixture invites treating an advisory backend as enforcing.

---

## Moderate

### 4. Create and update share an input type, and its optional id collides

`GroupFaceInput.id` is `RecordId | null` because the same type serves creation
and update, while `GroupFace.id` is `RecordId`. An input therefore cannot be
spread into a record, and the fixture destructures the id away at two call
sites to satisfy the compiler. Every `*Input` type in the contract has this
shape, so the problem is systemic rather than local.

**To resolve**: separate creation inputs from update inputs, or make update
take the id as an argument alongside a body with no id of its own.

### 5. Artefacts can be written but never read

`artefact.saveArtefact` and `retractArtefact` exist; no read operation does,
because `getArtefact` and `getArtefacts` had no call sites and were dropped
during triage. That was the right call on the evidence, but the consequence is
a record type that can only be written.

Stories and collections reference artefacts by `RecordId`, so a consumer
holding one has no contract operation to resolve it.

**To resolve**: either accept that artefacts are always delivered inline within
stories and collections — in which case `Artefact` should not be addressable by
id — or reinstate a read specified against a real requirement.

### 6. Storehouses can be blocked but never added

`storehouse.blockStorehouse` and `unblockStorehouse` take a `PeerId`, and
`listStorehouses` returns them, but nothing in the contract introduces one. The
fixture returns an empty list because it has no way to obtain a legitimate
`PeerId`.

**To resolve**: decide how a storehouse becomes known — discovery, invitation,
or configuration — and give it an operation. This was not visible during
triage because the source accessors had the same gap.

---

## Minor, but worth recording

### 7. `listPeople(group)` ignores its argument

Visibility filtering already scopes results to what the viewer may see, so the
`group` argument is redundant in the fixture. It is unclear whether the
contract intends it as an additional filter or as the scope itself.
**To resolve**: state which, or drop the argument.

### 8. Cascading effects are invisible to the type system

`person.retractPerson` also retracts the person's links, which is correct and
matches the source accessor, but it is expressed only in a doc comment. A
conformance suite can test for it; a contract reader may not notice it.
**To resolve**: nothing structural — but Milestone 5 must test cascades
explicitly, since nothing else records them.

### 9. `resetLocalStore` returns `void` while every other mutation returns a result

Defensible: it removes a store rather than a record, so there is no id to
return and nothing to acknowledge. Recorded only so the inconsistency is a
decision rather than an oversight.

---

## What did not resist

Worth noting, because it is evidence the shape is broadly right:

- **Retraction** was straightforward to implement and easy to test. Hiding
  without erasing fell out naturally, and the tests distinguishing the two are
  the clearest in the suite.
- **Visibility** worked without special cases. Public, group and restricted
  covered every record in the fixture, and a non-member sees exactly the public
  face of a group and nothing else.
- **`Supported<T>`** was pleasant to implement and to call. Refusal as a value
  meant no exception handling anywhere in the fixture or its tests.
- **The person/profile split** held up. They were never tempted to collapse.
- **Paired writes** reported honestly under both profiles with no branching in
  calling code, which is what the design was for.
