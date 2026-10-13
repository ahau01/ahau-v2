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

Rename the async callback that asks the client to write an edit to `onsave`. Rename the callback invoked with the successful profile to `onprofilesaved`. Use lowercase Svelte callback prop names consistently with existing props such as `onsubmit` and `oncancel`. Thread those names through `App.svelte`, `Shell.svelte` and `ProfilePage.svelte` so the call path describes the remote save and the resulting local state update separately. Name the edit state machine's injected writer `onSave` as well.

Alternative considered: retain the old `onupdate` and `onsave` roles and add comments. Rejected because the names themselves continue to imply the wrong responsibility at the component boundary. CamelCase component callback props were also considered, but rejected to match the app's established lowercase Svelte callback convention.

### Keep test history inspection explicit and shared

Use one shared test-only `MyProfileHistory` type in both the rogue zome and the Sweettest harness. Keep it outside the production zomes. Decode queried records through one generic helper and fail with the entry type and result position if a queried record has no entry, rather than silently dropping it. Reuse small Sweettest setup helpers for the repeated create-and-update scenario and history name extraction.

Alternative considered: leave the response type duplicated because the harness cannot import a WebAssembly crate. Rejected because both sides can depend on a small shared test-only type module without importing the zome implementation.

### Reuse profile client test defaults

Provide a shared `ProfileClient` stub factory for app tests that need the standard successful create and update behavior. Keep test-specific overrides at each call site; do not abstract bespoke call counting or guard behavior.

Alternative considered: leave full client stubs repeated in each test file. Rejected because the repeated default contract caused the update result migration to touch several otherwise unrelated fixtures.

## Risks / Trade-offs

- A test-only history helper could accidentally expose private values if it were added to a production zome. Keep it in the rogue test zome fixture and call it only from Sweettest.
- Changing the success discriminant requires every `ProfileClient` implementation and consumer to handle `updated`. Update the real client, pretend client, edit state machine and their tests together; persisted profiles are unaffected.
- The write callback naming crosses three Svelte components. Keep the change mechanical and verify the app typecheck and focused component tests.

## Migration Plan

No data migration is needed. Profile updates continue to append complete entries to the author's chain under the same validation and visibility rules. The result discriminant is a source-level client contract change; all in-repository implementations and callers will be updated together. Reverting the code requires no repair to stored data.

## Open Questions

None. Version selection for another agent's profile is intentionally deferred to the future tribe and group-creation work.
