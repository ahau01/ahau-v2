# Tasks

## 1. Assert profile version history

- [ ] 1.1 Add a test-only rogue-zome extern that reads this agent's profile and personal-information versions from its own source chain, then verify it returns authored versions in chain order from the Sweettest harness.
- [ ] 1.2 Extend the successive-update Sweettest to assert the original and both later profile versions remain on the author's chain and that the latest version is the expected one; verify with `npm run test:sweettest`.
- [ ] 1.3 Add a Sweettest that creates personal information with an email, clears it through `update_my_profile`, then asserts the latest version has no email while the earlier version still has it; verify with `npm run test:sweettest`.

## 2. Make edit results and callbacks clear

- [ ] 2.1 Give `UpdateProfileResult` the `updated` success status, keep create success as `created`, and update real and pretend clients plus the edit state machine; verify focused profile client and edit tests pass with `npm run test:app`.
- [ ] 2.2 Rename the async profile write callback to `onSave` and the successful-result callback to `onProfileSaved` through `App.svelte`, `Shell.svelte` and `ProfilePage.svelte`; update affected component tests and verify `npm run test:app` and `npm run check:app` pass.

## 3. Verify the change

- [ ] 3.1 Run `npm run typecheck`, `npm run check:app`, `npm run test:app`, `npm run test:sweettest` and `openspec validate profile-review-follow-up --strict`; confirm the result contract and both source-chain history scenarios match the delta spec and design.

## Workflow follow-up

- Archive the change after review is satisfied, then verify the archived result.
