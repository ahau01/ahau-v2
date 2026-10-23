# Proposal

## Why

From [#55](https://github.com/ahau01/ahau-v2/issues/55), re-scoped (see
"Flagged, not done").

The gender list is written out twice, in two different shapes, and only one
of them is checked:

- `src/own-profile/sections.ts` has `GENDER_LABELS: Record<Gender, string>`
  with all four labels. Being a `Record` keyed by `Gender`, it is already
  exhaustive — adding a value to `GENDERS` makes this file fail to compile.
- `src/app/first-launch/CreateProfile.svelte` has its own
  `Array<{ value: Exclude<Gender, 'unknown'>, label, outlined, filled }>`
  for the three radio choices, plus the word "Unknown" written inline on the
  checkbox. An array carries no exhaustiveness, so adding a value to
  `GENDERS` compiles clean and the new gender is simply missing from the
  form, with no error anywhere.

So there are two separate defects, not one duplication. The labels are
written twice and can drift — a person could be offered "Male" on the
create-profile form and shown something else on their profile page. And the
form's list silently fails to keep up with `GENDERS`.

This change touches identity data only in how it is *labelled*, not in how
it is stored, read, conflict-resolved or permissioned. None of the four
CLAUDE.md rules apply: no entry shape changes, no zome call changes, no
validation changes, and the set of genders the app offers is identical
before and after.

## What Changes

- Add `src/profile/genders.ts` holding `GENDER_LABELS: Record<Gender, string>`
  — the one place the words "Male", "Female", "Other" and "Unknown" exist.
  A new sibling of `client.ts` rather than part of it, because `client.ts`
  is documented as the only code that talks to Holochain about profiles and
  these labels are presentation, not a zome concern.
- `src/own-profile/sections.ts`: delete its local `GENDER_LABELS` and import
  the shared one. Same labels, same output.
- `src/app/first-launch/CreateProfile.svelte`:
  - Build the radio choices by deriving from `GENDERS` rather than from a
    hand-written array, taking labels from `GENDER_LABELS`.
  - Hold the silhouettes in
    `GENDER_ICONS: Record<Exclude<Gender, 'unknown'>, { outlined, filled }>`.
    Keyed, so a new gender is a compile error here. Icons stay in the app
    layer, since they are bundled assets; only the labels are shared.
  - Take the checkbox's "Unknown" text from `GENDER_LABELS.unknown` instead
    of writing it inline.
- No behaviour change. Same four genders, same labels, same silhouettes,
  same layout, same radio/checkbox split. Existing `CreateProfile`,
  `sections` and `Avatar` tests should pass untouched — if one needs
  editing, that is a signal the refactor changed behaviour and went wrong.

Why `Exclude<Gender, 'unknown'>` survives rather than being flattened into
one map: `unknown` genuinely has no silhouette. It is a checkbox, not a
radio with a picture, because "Unknown" is an answer about not knowing
rather than one of the figures. Forcing it into a single
`Record<Gender, { label, outlined, filled }>` would mean inventing an icon
it does not have. Two maps with different key sets is the honest shape.

## Capabilities

No spec-level behaviour changes. This is a pure refactor: the genders
offered, their labels and their icons are identical before and after, so no
requirement in `launch`, `navigation` or `own-profile` changes. In
particular `own-profile`'s "Avatar follows the chosen gender" requirement
holds unchanged — this change does not touch `Avatar.svelte`.

`.openspec.yaml` sets `skip_specs: true` accordingly.

### New Capabilities
(none)

### Modified Capabilities
(none — see above)

## Impact

Four files: one added (`src/profile/genders.ts`), two edited
(`src/own-profile/sections.ts`, `src/app/first-launch/CreateProfile.svelte`),
and a comment on `GENDERS` in `src/profile/client.ts` updated to say what is
now checked on the TypeScript side.

No Rust, no zome, no entry shape, no client interface, no test changes
expected. Nothing deployed and nothing stored is affected.

## Flagged, not done

- **The wider profile field-list consolidation.** #55's original text asks
  for the whole field list to have one home, naming roughly six places a new
  field has to be added. That is deliberately not done here. The largest
  part of it — the form inputs and the form↔profile mapping — collapses
  structurally when create and edit share one form component, which is work
  in the `edit-own-profile` change ([#47](https://github.com/ahau01/ahau-v2/issues/47)).
  Building a field-descriptor table now would be rework once that shared
  component lands, and would fight a layout with three genuinely irregular
  fields (the gender radios with images, the three date-of-birth dropdowns,
  the photo slot).
- **Rust ↔ TypeScript gender sync.** Adding a variant to the Rust `Gender`
  enum without touching `GENDERS` still passes every test. That gap, and the
  same gap for the hand-copied error-message constants, is
  [#54](https://github.com/ahau01/ahau-v2/issues/54) and is explicitly left
  there — #55 says to leave it rather than do it twice. This change only
  closes the TypeScript-side half.
- **`src/profile/pretend-client.ts`'s `isGender`** already derives from
  `GENDERS` at runtime (`GENDERS.includes(v)`) and needs no change.
- **Updating the acceptance criterion in #55** that refers to "adding a
  profile field" rather than a gender, once this change narrows the issue's
  scope. A comment on the issue, not a code change.
