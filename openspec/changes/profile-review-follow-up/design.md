# Design

## Context

See proposal.md for motivation and `specs/own-profile/spec.md` for the result contract. The merged `edit-own-profile` change is archived and its requirements are now in the live spec.

The coordinator Sweettests originally made two profile updates and checked only the latest profile. A test-only source-chain reader now proves earlier versions remain. Profile updates return a distinct `updated` result. A follow-up review found a few naming and test-organization improvements around that implementation.

## Goals / Non-Goals

**Goals:**

- Directly verify the profile and personal-information history behavior promised by the live spec.
- Make an update success distinguishable from a create success in `ProfileClient` and the edit state machine.
- Name the async write callback and the post-save state notification according to their roles.
- Make callback implementations and injected writer names describe their behavior at each code boundary.
- Share the repeated profile client failure result shape and make test-only client defaults visibly test support.
- Keep source-chain history assertions in the scenarios that exercise profile updates, without a separate test that repeats those assertions.
- Protect the `updated` result status directly in tests for both the real and pretend profile clients.
- Name the coordinator history test after what it asserts unless it also verifies each update action's original action link.

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

### Name callback props and implementations for their boundaries

Use lowercase Svelte callback prop names `onsave` and `onprofilesaved`, consistent with existing props such as `onsubmit` and `oncancel`. At the `App.svelte` implementation boundary, use action names that state what each function does: one invokes `client.updateMyProfile`, and one stores the returned profile. In the plain TypeScript edit state machine, name the injected writer `saveProfile`, since it is a dependency rather than a Svelte callback prop.

Keep the forwarding closure from `ProfilePage.svelte` into `createProfileEdit`. It reads the current Svelte callback prop when a save runs; passing the prop directly captures its initial value. Add a short comment documenting this requirement.

### Keep test history inspection explicit and shared

Use one shared test-only `MyProfileHistory` type in both the rogue zome and the Sweettest harness. Keep it outside the production zomes. Decode queried records through one generic helper and fail with the entry type and result position if a queried record has no entry, rather than silently dropping it. Reuse small Sweettest setup helpers for the repeated create-and-update scenario and history name extraction.

Alternative considered: leave the response type duplicated because the harness cannot import a WebAssembly crate. Rejected because both sides can depend on a small shared test-only type module without importing the zome implementation.

### Reuse profile client test defaults

Provide a shared `ProfileClient` stub factory for app tests that need the standard successful create and update behavior. Place it under `src/test-support/` so its test-only role is clear. Keep test-specific overrides at each call site; do not abstract bespoke call counting or guard behavior.

Alternative considered: leave full client stubs repeated in each test file. Rejected because the repeated default contract caused the update result migration to touch several otherwise unrelated fixtures.

### Share the failure result shape

Use one `ProfileFailure` type for the identical `{ status: 'failed', reason }` variant in create, update, and readiness results. Keep each operation's success variant specific to its operation.

Alternative considered: repeat the small structural failure type in each union. Rejected because all three results intentionally share the same failure contract.

### Keep history assertions with the update scenarios

Assert profile history ordering in the successive-update Sweettest and personal-information history in the email-clearing Sweettest. Remove the separate test that exercised the test-only history reader with the same two-version assertions; the reader remains exercised by both product behavior scenarios.

The successive-update test asserts saved versions and their source-chain order, but does not inspect the update action's `original_action_address`. Name it accordingly rather than claiming it verifies those links.

### Test the profile update result at the client boundary

Assert that `updateMyProfile` in both the real websocket client and the pretend client returns `{ status: 'updated', profile }` after a successful write. These tests protect the client contract directly, while the edit state machine tests protect its response to that contract.

### Keep human-readable entry labels in the history helper

Keep passing a short display label alongside the entry type to the generic history decoder. The label translates Rust entry type names into readable error messages, especially for `PersonalInformation`, so it adds diagnostic context rather than duplicating implementation data mechanically.

## Risks / Trade-offs

- A test-only history helper could accidentally expose private values if it were added to a production zome. Keep it in the rogue test zome fixture and call it only from Sweettest.
- Changing the success discriminant requires every `ProfileClient` implementation and consumer to handle `updated`. Update the real client, pretend client, edit state machine and their tests together; persisted profiles are unaffected.
- The write callback naming crosses three Svelte components. Keep the change mechanical and verify the app typecheck and focused component tests.

## Migration Plan

No data migration is needed. Profile updates continue to append complete entries to the author's chain under the same validation and visibility rules. The result discriminant is a source-level client contract change; all in-repository implementations and callers will be updated together. Reverting the code requires no repair to stored data.

## Open Questions

None. Version selection for another agent's profile is intentionally deferred to the future tribe and group-creation work.
