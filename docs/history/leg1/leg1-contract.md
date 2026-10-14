# Leg 1 data-access contract (compressed record)

**Frozen historical record.** This is what the SSB-era Āhau app's data layer
could do, written down during Leg 1 as a backend-agnostic TypeScript contract.
It is a checklist against the capability inventory
([#13](https://github.com/ahau01/ahau-v2/issues/13),
[`docs/capability-inventory.md`](../../capability-inventory.md)), so nothing
gets dropped in the rebuild. It is **not** a spec and not an interface new
code must implement. Don't make Holochain code match it operation by operation.

It replaces the `reference/leg1-contract/` folder: 46 files of TS types, a
fixture backend, a conformance suite, coverage scripts and the vendored
inventory JSON. The full originals are in git history at commit `edf5a8c`:

```sh
git show edf5a8c:reference/leg1-contract/README.md
git ls-tree -r --name-only edf5a8c reference/leg1-contract
```

The reasoning behind the cross-cutting semantics is in
[`docs/contract-decisions.md`](../../contract-decisions.md). Where the contract
resisted implementation is in [`contract-friction.md`](contract-friction.md).

## How it was derived

1. **Inventory.** Every data accessor the old Vue frontend used (77) was
   catalogued, along with its GraphQL variables, SSB-specific fields and call
   sites (`data-access-inventory.json`).
2. **Triage.** Each accessor got a purpose and a decision (keep, merge or
   drop) with reasoning, judged by whether it leaked SSB constructs into what
   should be backend-agnostic (`data-access-triage.json`). A second pass
   (`data-access-leakage-triage.json`) decided 6 inline GraphQL queries that
   bypassed the accessors and that the first gate missed.
3. **Manifest.** `derive-manifest.mjs` turned the triage into
   `manifest.json`: 68 kept accessors (28 reads, 40 writes) across 16 old
   domains, with 6 dropped and 3 absorbed.
4. **Contract.** Those accessors became **69 operations** in 14 namespaces on
   one `DataAccess` interface. Several `approve*Submission` accessors merged
   into one operation, and 4 operations came from the inline-query triage.
   A test banned SSB constructs from the types, each with a named
   replacement: `feedId` split into `IdentityId` (who) and `PeerId` (where),
   `recps` became `Visibility`, `originalAuthor` became `Provenance`,
   `tombstone` became `RecordStatus`, and `intervals` became
   `Membership.since`/`until`.
5. **Fixture and conformance.** An in-memory backend implemented the contract,
   and a conformance suite ran a presence case per operation plus the semantic
   cases below. Coverage scripts checked that triage, contract and suite
   matched in both directions. Because it only ever ran against the fixture,
   it proved little.

## Cross-cutting semantics

Backends **declare** what they cannot guarantee (`Capabilities`) instead of
the contract flattening to the intersection of all backends:

| Capability | Meaning |
|---|---|
| `retractionPropagates` | A retraction reaches other parties, or only stops this backend returning the record. |
| `atomicMultiWrite` | Multi-record writes (such as a group's public and private pair) commit together. |
| `maxTraversalDepth` | The deepest graph walk served, where `null` means unbounded. Declared rather than silently truncated. |
| `fieldLevelApproval` | A kaitiaki accepting only some proposed fields is `enforced`, `advisory` or `unsupported`. |
| `membershipEnforcement` | Membership and admin rights are `enforced`, `advisory` or `unsupported`. |
| `nameSearch` | Whether the backend can search people by name. |

`advisory` is the important middle case. On a backend that can't validate,
the record is written but anyone could write a fraudulent one, so the
sovereignty guarantee is social, not technical. The app must be able to tell
a community which one it is getting.

The result shapes:

- **`RecordId`**: branded and opaque. Only an adapter constructs or parses
  one.
- **`Supported<T>`**: an operation a backend may decline at call time returns
  `{supported: false, capability, detail}`. Declining is a normal outcome, not
  a thrown error.
- **`WriteAcknowledgement`**: `committed`, or `partial` with
  accepted/attempted/failures (the nostr relay case). Holochain's source-chain
  commit is `committed`.
- **Retraction, not deletion.** The only promise is that later reads from this
  backend won't return the record. Nothing is erased, and peers that already
  hold the data may keep it.
- **`PermissionWriteResult` / `ApprovalResult`**: writes that carry a
  permission rule report the `enforcement` level actually applied. Approval
  reports which records it `applied`, so "approved" can't silently mean
  "discarded".
- **`PairedWriteResult`**: a group's public and private profiles are one
  operation. The result says `atomic` or `independent` per part.
- **Traversal stays a walk** (`{from, depth}`), not a filter, so graph-walking
  doesn't move into the frontend per backend.

## Kaupapa cases worth carrying forward

These were the semantic conformance cases. They ran only against the
fixture. Their intent is the starting point for conductor tests (Sweettest or
Tryorama) against real Holochain behaviour:

- **retraction-hides-without-erasing**: after retracting a person, reads
  don't return them, but the record can still be acted on, because it was
  retracted, not erased.
- **retraction-cascades-to-links**: retracting a person also stops their
  whakapapa links being returned.
- **visibility-excludes-non-members**: group-scoped people aren't visible to a
  viewer who doesn't belong to the group. If membership isn't enforced, the
  result is reported as advisory.
- **declared-enforcement-matches-behaviour**: approving a subset of fields
  reports the same enforcement level the backend declares.
- **approval-states-what-it-applied**: approval names the submission, lists
  what it applied, and removes it from the review queue.
- **paired-write-matches-declared-atomicity**,
  **traversal-respects-declared-depth** and
  **write-acknowledgement-is-honest**: the backend's behaviour matches its
  declared capabilities.

## Dropped accessors

| Accessor(s) | Why |
|---|---|
| `updateAutoPrune`, `disableAutoPrune`, `getAutoPruneConfig` | Administration of SSB hyper-blob pruning, not a whakapapa need. The user need (managing how much disk Āhau uses, `StorageSettings.vue`) survives as an open question. |
| `getCommunity` | No call sites. Covered by `getTribe`. |
| `getArtefact`, `getArtefacts` | No call sites. Stories and collections carried artefacts inline. |
| `ahauDBStats`, `whoamiReadinessPoll` (inline queries) | SSB storage internals, and a liveness poll already covered by `readiness.getReadiness` + `person.getViewer`. |

Absorbed: `getPersonMinimal` and `getPersonFull` into `getPerson` (they
differed only by field projection), and `savePublicCommunity` into
`saveCommunity`.

## Operations

The source column lists the old accessor(s). † marks an operation from the
inline-query triage. The purpose comes from the triage.

| Operation | Source | Purpose |
|---|---|---|
| applications.applyToGroup | `createGroupApplication` | Apply to join a group. |
| applications.acceptApplication | `acceptGroupApplication` | Admit an applicant to a group. |
| applications.declineApplication | `declineGroupApplication` | Refuse an application to join. |
| applications.listPendingApplications | `listGroupApplications` | List applications awaiting a decision, so a kaitiaki can see who is asking to join. |
| applications.offerMembershipCredential | `offerMembershipCredential` | Issue a verifiable credential attesting that someone belongs to a group. |
| artefact.saveArtefact | `saveArtefact` | Create or update an artefact - an image, recording or document held in the archive. |
| artefact.retractArtefact | `DELETE_ARTEFACT` | Remove an artefact from the archive. |
| artefact.uploadMedia | `uploadFile`† | Introduce media into the archive, optionally encrypted. |
| collection.getCollection | `getCollection` | Open a single collection - a curated grouping of stories. |
| collection.listCollections | `getAllCollections` | List the collections available for browsing. |
| collection.saveCollection | `saveCollection` | Create or update a collection - a curated grouping of stories. |
| collection.retractCollection | `deleteCollection` | Remove a collection. |
| collection.setCollectionStoryLink | `saveCollectionStoryLink` | Add a story to a collection, or remove it. |
| credentials.listCredentials | `getAllCredentials` | List the verifiable credentials the user holds. |
| credentials.presentCredential | `sendCredentialProof`† | Present a held credential to a verifier. |
| group.getGroup | `getTribe` | Read one group - its public and private profile, who tends it, and the user's standing in it. |
| group.listGroups | `getTribes` | List the groups the user belongs to, for navigation and group switching. |
| group.createGroup | `initGroup` | Create a new group - the act that establishes a tribe or community and the permission boundary everything else in Ahau hangs off. |
| group.saveGroupProfile | `saveCommunity` | Create or update a group's profile. |
| group.updateGroup | `updateTribe` | Update both halves of a group's paired profile at once. |
| group.retractGroup | `deleteTribe` | Remove a group, tombstoning both its public and private records. |
| group.grantAdministration | `addAdminsToGroup` | Grant administrative rights over a group to named people. |
| group.listMembers | `getMembers` | List the people in a group. |
| group.createSubgroup | `createSubGroup` | Create a subgroup within a group, for a hapu or whanau within a wider iwi. |
| group.listSubgroups | `getSubGroups` | List the subgroups of a group. |
| group.removeSubgroupMembership | `deleteSubGroup` | Remove a person's membership of a subgroup, and their corresponding record in the parent group. |
| link.saveLink | `saveLink` | Create or update a link between two people - the act of recording a relationship in the whakapapa. |
| link.findLink | `whakapapaLink` | Look up a single link between two people, checking whether a parent-child or partner relationship already exists before creating one. |
| person.getViewer | `whoami` | Identify the signed-in user and the groups they belong to, including their own profile and per-group settings. Read at startup and by ~40 call sites as the ambient identity context. |
| person.getPerson | `getPerson` | Fetch a person's full profile together with their whakapapa links and the authors who contributed to the record - the read behind opening a person in the tree. |
| person.getPersonCustomFields | `getPersonCustomFields` | Read a person's tribe-defined custom fields - the key/value pairs an iwi or hapu adds beyond the standard profile schema. |
| person.savePerson | `savePerson` | Create or update a person profile. |
| person.findPeopleByName | `findPersonByName` | Search for people by name within a group, used when adding a person to a record or linking them into a whakapapa. |
| person.retractPerson | `deletePerson` | Remove a person from the record, tombstoning both their profile and the whakapapa links that reference them. |
| person.listPeople | `loadPersonList` | List the people in a tribe, with an admin variant returning the fuller record available to kaitiaki. |
| profile.getProfile | `getProfile` | Read a community profile - how a person or group presents itself within a group, as distinct from their node in the whakapapa. |
| readiness.getReadiness | `getIndexes` | Report whether the backend has finished preparing data, and how far along it is, so the app knows when it can render. |
| settings.getGroupSettings | `getSettings` | Read one group's settings. |
| settings.listGroupSettings | `getAllSettings` | Read settings across every group the user belongs to, for screens that span groups. |
| settings.saveGroupSettings | `saveSettings` | Create or update a group's settings - the per-tribe configuration a kaitiaki controls. |
| settings.retractGroupSettings | `deleteSettings` | Remove a group's settings. |
| settings.exportIdentity | `getBackup` | Retrieve the user's identity backup, so they can recover their account on another device or after reinstalling. |
| settings.resetLocalStore | `deleteAhau` | Delete the local database and reset the application. |
| story.getStory | `getStory` | Open a single story - a record of an event, with its text, media, contributors and the people it mentions. |
| story.listStories | `getAllStories` | List the stories in the archive for browsing. |
| story.listStoriesMentioning | `getAllStoriesByMentions` | Find the stories that mention a given person, so someone's record shows where they appear in the wider archive. |
| story.saveStory | `saveStory` | Create or update a story. |
| story.retractStory | `deleteStory` | Remove a story from the archive. |
| storehouse.listStorehouses | `getPatakas` | List the storehouses replicating this user's groups. |
| storehouse.blockStorehouse | `blockPataka` | Stop a storehouse from replicating the user's records. |
| storehouse.unblockStorehouse | `unblockPataka` | Allow a previously blocked storehouse to replicate again. |
| storehouse.acceptInvite | `acceptInvite`† | Accept an invitation to connect to a storehouse. |
| storehouse.listConnectedPeers | `connectedPeers`† | Which storehouses are connected right now. |
| submissions.listSubmissions | `getSubmissions` | List the pending proposals awaiting review - what a kaitiaki sees when deciding what to approve, including each proposal's target, comments, group and dependencies. |
| submissions.proposeNewPerson | `proposeNewGroupPerson` | Propose adding a new person to a group, for a kaitiaki to review. |
| submissions.proposeEditPerson | `proposeEditGroupPerson` | Propose changes to an existing person's profile within a group. |
| submissions.proposeNewLink | `proposeNewWhakapapaLink` | Propose a new relationship between two people, for review before it enters the whakapapa. |
| submissions.proposeEditWhakapapaView | `proposeEditWhakapapaView` | Propose changes to a whakapapa view - its focus, name, or which relationships are treated as primary. |
| submissions.proposeRetraction | `proposeTombstone` | Propose removing a record, for a kaitiaki to review rather than deleting it outright. |
| submissions.approveSubmission | `approveSubmission` | Approve a proposal wholesale, accepting it as submitted. |
| submissions.approveSubmissionFields | `approveEditGroupPersonSubmission`, `approveEditWhakapapaViewSubmission`, `approveNewGroupPersonSubmission`, `approveNewWhakapapaLink` | Approve a proposed edit to a person's profile, accepting only the fields the reviewer allows. |
| submissions.rejectSubmission | `rejectSubmission` | Decline a proposal, with a comment explaining why. |
| submissions.retractSubmission | `tombstoneSubmission` | Remove a submission from view entirely, rather than declining it on the record. |
| submissions.linkSubmissions | `createSubmissionsLink` | Record that one proposal depends on another, so related changes are reviewed and applied in the right order. |
| whakapapa.getWhakapapaView | `getWhakapapaView` | Open a saved whakapapa view - the curated lens over the graph: which person is the focus, which profiles are ignored, which parent or partner counts as primary where someone has several, plus the view's name, image and guardians. |
| whakapapa.listWhakapapaViews | `getWhakapapaViews` | List the whakapapa views belonging to a group, for the index screen and for choosing a target when submitting a change. |
| whakapapa.saveWhakapapaView | `saveWhakapapaView` | Create or update a whakapapa view - naming it, setting its focus, ignoring profiles, or recording which relationships are primary. |
| whakapapa.getDescendants | `getDescendantLinks` | Fetch the child and partner links descending from a person, to draw the tree below them. |
| whakapapa.getFamily | `getFamilyLinks` | Fetch the links around a person - immediate family, or extended kin when asked - to draw their local whakapapa. |
