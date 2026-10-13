# Design

## Context

See proposal.md for motivation and `specs/own-profile/spec.md` for the result contract. The merged `edit-own-profile` change is archived and its requirements are now in the live spec.

The coordinator Sweettests currently make two profile updates and check only the latest profile. They cannot directly inspect the source-chain versions through the current test harness. Profile updates currently return the `created` result variant, and `App.svelte`, `Shell.svelte` and `ProfilePage.svelte` pass separate callbacks named `onupdate` and `onsave` even though the former performs the remote write and the latter only updates the in-memory profile.

## Goals / Non-Goals

**Goals:**

- Directly verify the profile and personal-information history behavior promised by the live spec.
- Make an update success distinguishable from a create success in `ProfileClient` and the edit state machine.
- Name the async write callback and the post-save state notification according to their roles.

**Non-Goals:**

- Selecting another agent's latest profile version by `action_seq`; that belongs with tribes and group creation, where other people's profiles will be viewed.
- Adding a production API for inspecting profile history.
- Changing what profile or personal-information entries contain, how they are validated, or who can read them.

## Decisions

### Inspect history through a test-only zome call

Add a narrow introspection extern to the rogue test zome that reads this agent's profile and personal-information versions from its source chain and returns them to Sweettest. Use it to assert all three profile versions after two successive updates, and to assert that clearing an email leaves it absent from the latest personal-information version while the earlier version containing it remains on the chain.

The helper belongs in the test-only zome because the source-chain history is needed as test evidence, not as a production feature. The helper reads only the calling agent's own chain; it does not publish private personal-information contents to the DHT or add a production function to the profile client.

Alternative considered: infer retention from the coordinator's latest-value read. Rejected because `get_my_profile` returns only the latest version and cannot prove that earlier actions remain.

### Give update success its own result variant

Define `UpdateProfileResult` as a union whose successful variant is `{ status: 'updated', profile }`, while `CreateProfileResult` keeps `{ status: 'created', profile }`. Keep the shared failed variant. Update the real and pretend clients and have the edit state machine recognize `updated` as success.

Alternative considered: keep the shared `created` success shape for symmetry between the two save operations. Rejected because callers cannot distinguish a newly created profile from an appended version, and the status says the wrong thing after an edit.

### Name callbacks after the operations they represent

Rename the async callback that asks the client to write an edit to `onSave`. Rename the callback invoked with the successful profile to `onProfileSaved`. Thread those names through `App.svelte`, `Shell.svelte` and `ProfilePage.svelte` so the call path describes the remote save and the resulting local state update separately.

Alternative considered: retain `onupdate` and `onsave` and add comments. Rejected because the names themselves continue to imply the wrong responsibility at the component boundary.

## Risks / Trade-offs

- A test-only history helper could accidentally expose private values if it were added to a production zome. Keep it in the rogue test zome fixture and call it only from Sweettest.
- Changing the success discriminant requires every `ProfileClient` implementation and consumer to handle `updated`. Update the real client, pretend client, edit state machine and their tests together; persisted profiles are unaffected.
- The write callback naming crosses three Svelte components. Keep the change mechanical and verify the app typecheck and focused component tests.

## Migration Plan

No data migration is needed. Profile updates continue to append complete entries to the author's chain under the same validation and visibility rules. The result discriminant is a source-level client contract change; all in-repository implementations and callers will be updated together. Reverting the code requires no repair to stored data.

## Open Questions

None. Version selection for another agent's profile is intentionally deferred to the future tribe and group-creation work.
