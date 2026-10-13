# Tasks

## 1. Assert profile version history

- [x] 1.1 Add a test-only rogue-zome extern that reads this agent's profile and personal-information versions from its own source chain, then verify it returns authored versions in chain order from the Sweettest harness.
- [x] 1.2 Extend the successive-update Sweettest to assert the original and both later profile versions remain on the author's chain and that the latest version is the expected one; verify with `npm run test:sweettest`.
- [x] 1.3 Add a Sweettest that creates personal information with an email, clears it through `update_my_profile`, then asserts the latest version has no email while the earlier version still has it; verify with `npm run test:sweettest`.

## 2. Make edit results and callbacks clear

- [x] 2.1 Give `UpdateProfileResult` the `updated` success status, keep create success as `created`, and update real and pretend clients plus the edit state machine; verify focused profile client and edit tests pass with `npm run test:app`.
- [x] 2.2 Rename the async profile write callback to `onsave` and the successful-result callback to `onprofilesaved` through `App.svelte`, `Shell.svelte` and `ProfilePage.svelte`; update affected component tests and verify `npm run test:app` and `npm run check:app` pass.

## 3. Verify the change

- [x] 3.1 Run `npm run typecheck`, `npm run check:app`, `npm run test:app`, `npm run test:sweettest` and `openspec validate profile-review-follow-up --strict`; confirm the result contract and both source-chain history scenarios match the delta spec and design.

## Workflow follow-up

- Archive the change after review is satisfied, then verify the archived result.

## Review follow-ups

- [x] 4.1 Use lowercase Svelte callback prop names and align the edit writer parameter name.
- [x] 4.2 Share the test-only history response type and query/decode logic; report missing entries explicitly.
- [x] 4.3 Extract repeated Sweettest history/setup helpers and share the standard TypeScript profile client test stub.
- [x] 4.4 Run the focused app and Sweettest checks and strict OpenSpec validation.

## Review follow-ups 2

- [x] 5.1 Give the `App.svelte` callback implementations and the edit state machine's injected writer behavior-based names; document why the Svelte callback forwarding closure is needed.
- [x] 5.2 Share the common failure result variant across profile client result types.
- [x] 5.3 Move the profile client stub factory into an explicit test-support directory.
- [x] 5.4 Remove the duplicate history-reader Sweettest while preserving version-order assertions in the update and email-clearing scenarios.
- [x] 5.5 Run app checks, Sweettests, and strict OpenSpec validation.

## Review follow-ups 3

- [x] 6.1 Add successful `updated` result assertions for real and pretend profile clients.
- [x] 6.2 Rename the coordinator Sweettest so it describes the saved-version assertions it performs.
- [x] 6.3 Run app checks, Sweettests, and strict OpenSpec validation.
