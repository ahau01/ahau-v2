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

## Significant

All three were acted on. The contract changed; the fixture and its tests were
updated to match. Acting on the first exposed a further gap, recorded as
finding 10.

### 1. Approval does not say what happens to the thing approved — **partly resolved**

`submissions.approveSubmissionFields` and `approveSubmission` accept a proposal
and return a `WriteResult`, but the contract never says the proposed change is
*applied*. The fixture marks the submission resolved and stops, because there
is nothing to implement — and no test could tell the difference between a
backend that applies changes and one that quietly discards them.

This is the most serious gap found. Approval is the entire point of the
submissions workflow, and the contract currently describes only its
bookkeeping.

**Resolved in the contract.** Both approvals now return `ApprovalResult`, which
names the submission, the records the approval applied, and how strongly any
field restriction was enforced. The contract now states the obligation: approval
applies the proposed change rather than merely resolving the proposal.

**Not resolved in the data model.** See finding 10 — a `Submission` records what
is targeted but not what is proposed, so there is still nothing for a backend to
apply.

### 2. Creating a group cannot tell you the group's identity — **resolved**

`group.createGroup` and `group.createSubgroup` return `WriteResult`, whose `id`
is a `RecordId`. Groups are keyed by `GroupId`. A caller therefore cannot learn
the identity of the group it just created, and the fixture fabricates one it
then cannot use.

The same shape affects anything whose identity is not a `RecordId`, which today
means groups and storehouses.

**Resolved.** `WriteResult<TId = RecordId>` is now parameterised by the kind of
identifier it returns, and `createGroup` and `createSubgroup` return
`WriteResult<GroupId>`. A caller can pass the result straight back into
`getGroup`, which is covered by a test. The fixture now genuinely creates groups
rather than fabricating an id it could not use.

### 3. Capability gating is applied inconsistently — **resolved**

Traversal and name search return `Supported<T>`, so a caller branches on
refusal. But `group.grantAdministration` depends on `membershipEnforcement` and
`submissions.approveSubmissionFields` depends on `fieldLevelApproval`, and both
return a plain `WriteResult` — a caller cannot tell from the result whether the
thing was enforced or merely recorded.

That is the difference between a permission and a suggestion, and on tribal
records it is not a detail.

**Resolved.** `PermissionWriteResult` extends `WriteResult` with the
`EnforcementLevel` actually applied, and `grantAdministration` and
`acceptApplication` now return it. `ApprovalResult` carries the same field.

Deliberately not `Supported<T>`: these operations are not refused. They succeed,
and the record is written — the rule behind them is simply not enforced. Calling
them a refusal would have been as misleading as saying nothing.

---

## Moderate

### 4. Create and update share an input type, and its optional id collides — **resolved**

`GroupFaceInput.id` is `RecordId | null` because the same type serves creation
and update, while `GroupFace.id` is `RecordId`. An input therefore cannot be
spread into a record, and the fixture destructures the id away at two call
sites to satisfy the compiler. Every `*Input` type in the contract has this
shape, so the problem is systemic rather than local.

**Resolved.** Inputs carry fields only and moved to `types/inputs.ts`; write
operations take the identifier as an argument, null to create and an id to
update. That removed the ambiguity without doubling the number of input types,
and the fixture no longer destructures ids away to satisfy the compiler.

Inputs moved beside the record types rather than staying with the operations
because a proposal carries one -- see finding 10.

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

## New, exposed by acting on finding 1

### 10. A submission records what is targeted, but not what is proposed — **resolved**

`Submission` carries `targetType` and `target`, plus comments and
dependencies — but no payload. There is no field holding the proposed person,
link or view.

So although the contract now says approval applies the change, no backend can
satisfy that: there is nothing recorded to apply. The fixture returns an empty
`applied` list, which is honest rather than lazy.

This was invisible until the return type forced the question. It is the clearest
demonstration in this milestone of why implementing a contract finds things
reading it does not.

**Resolved.** `Submission.proposal` is a discriminated payload mirroring the
propose operations, and `SubmissionTarget` is now derived from that union so the
two cannot drift apart. `targetType` is gone, and so is the redundant `target`
argument on `approveSubmissionFields` — the submission already knew what it
targeted, so passing it was the same inversion found in `loadPersonList` during
triage.

Approval now applies the proposal, and the difference between enforcement levels
is demonstrable rather than asserted: under `enforced` field approval only the
allowed fields are written, while under `advisory` the restriction is recorded
and the whole change lands anyway. Three tests cover it, including the advisory
case — which is the behaviour a community would most need warning about.

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
