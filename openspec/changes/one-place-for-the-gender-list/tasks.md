# Tasks

No conductor tests here: this change touches no zome, no entry shape, no
validation and no sync or permission logic, so the project's
conductor-test and two-devices-offline-then-sync rules have nothing to
apply to. Verification is the type checker plus the existing component
tests.

Note which checker catches what: `npm run typecheck` (`tsc --noEmit`) does
not read `.svelte` files. The exhaustiveness guarantee inside
`CreateProfile.svelte` is enforced by `npm run check:app`
(`svelte-check`), so that is the command the acceptance criterion rests on.

## 1. One home for the labels

- [ ] 1.1 Add `src/profile/genders.ts` exporting
  `GENDER_LABELS: Record<Gender, string>` with the four current labels
  (`male: 'Male'`, `female: 'Female'`, `other: 'Other'`,
  `unknown: 'Unknown'`), importing `Gender` from `./client.js`. Comment it
  as the one place these words exist, and why it is not in `client.ts`
  (that module is only for talking to Holochain; these are presentation).
  Verify `npm run typecheck` passes.
- [ ] 1.2 `src/own-profile/sections.ts`: delete the local `GENDER_LABELS`
  (currently lines ~63-69, with its "As the create-profile gender picker
  words them" comment) and import the shared one. Verify
  `npm run test:app` passes `src/own-profile/sections.test.ts` with no edit
  to that test file — the rendered labels must be byte-identical.

## 2. Exhaustive gender options in the create-profile form

- [ ] 2.1 `src/app/first-launch/CreateProfile.svelte`: replace the
  hand-written `genders` array (currently lines ~45-49) with
  `GENDER_ICONS: Record<Exclude<Gender, 'unknown'>, { outlined: string, filled: string }>`
  holding only the three silhouette pairs, and derive the radio options from
  `GENDERS` — filtering out `'unknown'` — taking each label from
  `GENDER_LABELS`. Comment why `unknown` is excluded (it is a checkbox with
  no silhouette, not a radio with a picture). Verify `npm run check:app`
  passes.
- [ ] 2.2 In the same file, take the checkbox's text from
  `GENDER_LABELS.unknown` instead of the inline `Unknown` literal
  (currently line ~155). Verify `npm run test:app` passes
  `src/app/first-launch/CreateProfile.test.ts` with no edit to that test
  file.
- [ ] 2.3 Confirm the radio order is still male, female, other as the old
  app had it. Deriving from `GENDERS` preserves it (`GENDERS` is declared in
  that order), but verify it rather than assume: check
  `CreateProfile.test.ts` asserts the order, and if it does not, add an
  assertion that the three radios appear in that order.

## 3. Say what is now guaranteed

- [ ] 3.1 Update the comment on `GENDERS` in `src/profile/client.ts`
  (currently lines ~50-55) to state the TypeScript-side guarantee this
  change adds — a new gender needs an entry in `GENDER_LABELS` and, unless
  it is checkbox-shaped like `unknown`, in `GENDER_ICONS` — and that the
  Rust-side gap is still open as #54. Verify by reading it back: it should
  describe what is checked, not what someone should remember to do.
- [ ] 3.2 Prove the acceptance criterion rather than assuming it:
  temporarily add a fifth value to `GENDERS`, run `npm run check:app`, and
  confirm it fails naming both `GENDER_LABELS` and `GENDER_ICONS` as
  missing that key. Revert the temporary value. Record the observed error
  output in the PR description — this is the evidence #55 asks for, and it
  is not something a passing test suite can show.

## 4. Whole-suite check

- [ ] 4.1 Run `npm run typecheck`, `npm run check:app` and
  `npm run test:app` and verify all three pass with zero edits to any
  existing test file. Any test needing a change means the refactor altered
  behaviour and should be reworked, not the test.
