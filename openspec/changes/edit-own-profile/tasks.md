# Tasks

Commands used below: `npm run test:zomes` (cargo, workspace), `npm run
test:sweettest` (packs the hApp and runs coordinator tests against a real
Holochain conductor), `npm run test:app` (vitest), `npm test` (builds and
runs the Node tests plus Vitest), `npm run typecheck` (`tsc --noEmit`, does
not read `.svelte`), and `npm run check:app` (`svelte-check`).

On the two-devices-offline-then-sync coverage this project normally
requires: design.md D9 establishes that no conflicting *version of one
profile* can be produced, because a second device has its own agent key and
so writes a separate profile, and one key on two conductors is a
source-chain fork rather than an app-level merge. There is therefore no
conflict scenario to write. What replaces it is the two-agent isolation
coverage in group 1 — agent B cannot change agent A's profile, and each
agent's changes leave the other's alone — run against a real conductor.
This substitution is deliberate; do not close it out by writing a
conflicting-edit test that cannot actually conflict.

## 1. The coordinator can write a change

- [x] 1.1 Add a helper to `dnas/ahau/zomes/coordinator/profiles/src/lib.rs`
  that returns the `ActionHash` of the **first** create of a given entry
  type on the calling agent's own chain. Model it on `my_original()` in
  `dnas/ahau/test/zomes/rogue_profiles/src/lib.rs`, not on the existing
  `latest_on_my_chain` — pointing at the latest record is what validation
  refuses (design.md D2, R5). Verify `npm run test:zomes` passes.
- [x] 1.2 Add `update_my_profile(MyProfile) -> MyProfile`: update the
  profile against that original hash, then update-or-create the personal
  information (design.md D4). One extern, both halves, so a save cannot
  land one and fail the other. Verify `npm run test:zomes` passes and
  `npm run build:happ` succeeds.
- [x] 1.3 Add a Sweettest asserting a change written through the **real**
  coordinator reads back from `get_my_profile`, and that a second change
  also succeeds (proving it still points at the first version, not the
  previous change). Verify `npm run test:sweettest` passes.
- [x] 1.4 Add a Sweettest for the update-or-create branch: an agent
  whose chain holds a profile but no personal information adds an email and
  the save succeeds. Construct that state through the rogue zome, since
  `create_my_profile` always writes a personal-information entry. Verify
  `npm run test:sweettest` passes.
- [x] 1.5 Add the two-agent isolation Sweettest (see the note above):
  with two agents on one network, agent B's attempt to change agent A's
  profile is refused naming "Only the author of a profile can change it",
  and A's profile still holds A's version; then each agent changes their own
  profile and neither affects the other. Verify `npm run test:sweettest`
  passes.
- [x] 1.6 Document on `update_my_profile` why it resolves the original hash
  itself rather than taking one from the caller, and why the personal-
  information branch can be a create. Verify by reading it back: a reader
  should learn why the obvious implementation is refused.

## 2. The client can ask for a change

- [x] 2.1 Add `updateMyProfile` to the `ProfileClient` interface and the
  real client in `src/profile/client.ts`, returning the same
  created/failed-with-reason shape as `createMyProfile` so a refusal
  carries its plain reason. Add `'update_my_profile'` to
  `PROFILE_FUNCTIONS` — note that constant is also the dev signing grant,
  so it must still list exactly the functions the client calls, with no
  wildcard. Verify `npm run typecheck` passes.
- [x] 2.2 Add `updateMyProfile` to `src/profile/pretend-client.ts`, keeping
  it faithful to the zome's rules: it must refuse when no profile exists
  yet. Verify `npm run test:app` passes
  `src/profile/pretend-client.test.ts`, with a new case for that refusal.
- [x] 2.3 Assert in `src/profile/client.test.ts` that the dev signing grant
  allowlist includes exactly the profile functions the client calls,
  including `update_my_profile`. The dev grant is built from
  `PROFILE_FUNCTIONS`; verify `npm test` passes.
- [x] 2.4 Check `src/profile/boundary.test.ts` still holds: no component
  outside the client module reaches Holochain directly. Verify
  `npm run test:app` passes it, and extend it if it enumerates client
  methods.

## 3. Form logic, both directions

- [x] 3.1 Move `ProfileForm`, `emptyProfileForm`, `readForm` and their
  helpers (`readDate`, `text`, `list`) from
  `src/first-launch/first-launch.ts` into a new `src/profile/form.ts`,
  re-exporting or importing as needed so `first-launch.ts` keeps compiling.
  Pure move, no behaviour change. Verify `npm run test:app` passes
  `src/first-launch/first-launch.test.ts` with no edit to that test beyond
  the import path.
- [x] 3.2 Add `profileForm(profile: Profile): ProfileForm` to
  `src/profile/form.ts`: numbers to strings, nulls to `''`, and the date
  split back into day/month/year. Verify a new unit test covers a full
  profile, an all-blank profile, a year-only date and a date with unknown
  digits (`192X`).
- [x] 3.3 Give `profileForm` a defined fallback for a date it cannot
  represent in the dropdowns, and test it (design.md R1). It must not
  silently render blank and let the next save wipe the field. Verify the
  new test asserts the chosen fallback behaviour explicitly.
- [x] 3.4 Add the round-trip property test: `readForm(profileForm(p))`
  yields `p` for generated profiles, covering every field, empty lists and
  each date shape (design.md R2). Verify `npm run test:app` passes it, and
  that it fails if a field is removed from one of the two functions.

## 4. One form for create and edit

- [x] 4.1 Extract the form body of
  `src/app/first-launch/CreateProfile.svelte` into a shared component
  taking the form state, a saving flag, errors, and submit/cancel
  handlers, leaving `CreateProfile.svelte` as the first-launch wrapper
  supplying its own title and buttons. Verify `npm run test:app` passes
  `src/app/first-launch/CreateProfile.test.ts` with no edit to that test
  file — the create flow must be unchanged.
- [x] 4.2 Verify the shared component keeps the disabled photo-upload
  button as-is (#43 is untouched) and keeps the "Only you can see this."
  note on the Personal information section. Verify by the existing
  `CreateProfile.test.ts` assertions plus the spec requirement "No header
  image or photo control".
- [x] 4.3 Add a comment in the shared component recording that it is the
  one place the profile form's fields are listed, and naming the other
  places a new field still has to be added (the Rust structs, the client
  interfaces, `completeProfile`, `pretend-client`'s field checks,
  `ProfileForm`/`readForm`/`profileForm`, `sections.ts`). Verify by reading
  it back against those files — the list must be accurate, not
  aspirational.

## 5. The edit screen

- [x] 5.1 Add an edit state machine for the profile page, alongside the
  form logic rather than inside a component: open (seeded from the current
  profile), saving, refused-with-errors, saved. Mirror `first-launch.ts`'s
  handling of a repeated refusal producing a fresh errors object. Verify
  new unit tests cover open → save → saved, and open → refused → still
  holding the typed values.
- [x] 5.2 Add the edit control and the edit dialog to
  `src/app/shell/ProfilePage.svelte`, using the shared form component
  seeded via `profileForm`. A dialog, not a route (design.md D7). Verify a
  new component test opens it, confirms the fields hold the saved values,
  and confirms cancelling writes nothing.
- [x] 5.3 Add the add-a-version wording next to the Profile section's
  existing visibility label. Verify a component test asserts both lines
  are present on the section, per the spec requirement "The public section
  says changes add a version".
- [x] 5.4 Lift `profile` ownership to `src/app/App.svelte` and give
  `src/app/shell/Shell.svelte` an `onsave` callback that bubbles the saved
  profile up (design.md D6). No shell component may import the profile
  client. Verify `npm run test:app` passes `src/app/shell/Shell.test.ts`
  and `src/app/App.test.ts`, and that `boundary.test.ts` still holds.
- [x] 5.5 Add a test that a saved name or gender change reaches the shell
  chrome: the heading, and the avatars in `TopBar` and `SideNav`, show the
  new value without a reload. Verify per the spec requirement "The shell
  follows a saved change".
- [x] 5.6 Update the comment at the top of `ProfilePage.svelte` and
  `Shell.svelte`, both of which currently state there is no editing and
  that the shell is a pure view of the launch read. Verify by reading them
  back: they should describe the new arrangement, including that the shell
  still imports no client.

## 6. Whole-system checks

- [x] 6.1 Run `npm run typecheck`, `npm run check:app`, `npm run test:app`,
  `npm run test:zomes` and `npm run test:sweettest`, and verify all pass.
- [x] 6.2 Walk the flow by hand in the dev app, on the conductor path and
  again with `?pretend`: create a profile, go in, edit a field in each
  section, save, confirm the page and the avatars update, reload, confirm
  the change persisted. Verify both paths behave the same.
- [x] 6.3 Confirm against `openspec/changes/edit-own-profile/specs/own-profile/spec.md`
  that each requirement has coverage, and that nothing in the diff adds
  merge, version-picking or conflict-resolution logic (design.md D9).
  Verify by reading the diff for it specifically — this is the regression
  this change is most likely to introduce and the one tests will not catch.

## Workflow follow-up

- Open/update the PR from the `worktree-edit-own-profile` branch, linking
  #47, and note in the description that the field-list consolidation from
  #55 lands here via the shared form component.
- Archive the change once review is satisfied, then verify the archived
  result.

## Verification findings (2026-10-12)

The post-rebase verification commands pass: typecheck, app checks and tests,
zome tests, and Sweettest. The failed-update assertion now confirms both
sections remain unchanged. These are the remaining non-blocking gaps in
direct scenario assertions, not observed implementation failures. They do
not change the completed task count.

- **Toolchain warnings:** `nix develop` reports that crane requires at
  least nixpkgs 26.05 while this environment supplies 25.11. Cargo also
  reports that `proc-macro-error2 2.0.1` may be rejected by a future Rust
  version. Both checks continue past these warnings.
- **Formatting:** workspace-wide `cargo fmt --all -- --check` reports
  differences in unchanged Rust files. The coordinator files changed here
  pass focused `rustfmt --edition 2021 --check`.
- **Earlier versions remain on the chain:** extend coverage to confirm the
  original and intermediate versions remain after successive changes.
- **Clearing a field affects only the new version:** add coverage confirming
  the cleared field is absent from the latest version while its earlier
  version remains on the chain.
