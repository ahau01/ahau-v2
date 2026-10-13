# Proposal

## Why

From [#47](https://github.com/ahau01/ahau-v2/issues/47).

A person can create their profile at first launch and then never change it.
They cannot fix a typo in their own name, add a skill, or update their
email. The `own-profile` spec currently makes that explicit — "The page
SHALL NOT offer to edit the profile" — so this is a deliberate gap being
closed, not an oversight.

The rules already allow it. The integrity zome's `validate_update` is
written and tested for both `Profile` and `PersonalInformation`: only the
entry's author may add a version (`NOT_THE_AUTHOR`), and every version must
point at the first one (`UPDATE_MUST_POINT_AT_ORIGINAL`). Conductor tests
in `src/profile/validation.conductor.ts` already pass for "I can change my
own profile, and the change reads back", driven through the rogue test
zome. What is missing is everything above validation: no coordinator
extern, no client method, no form, and nowhere in the UI to put the result.

**This change bears on CLAUDE.md rules 1 and 4,** and the honest answer to
rule 1 here is unusual enough to state up front rather than bury in the
design.

Rule 1 forbids last-write-wins on identity data, and editing a profile
looks exactly like last-write-wins. It is not, for two separate reasons.
First, nothing is overwritten: an update is a new entry on the author's
append-only source chain, pointing at the original, and every earlier
version stays. Second, there is no second source to conflict with — a
profile is one agent key's account of itself, the chain is linear per key,
and "which version to show" for your own profile is not a choice at all
(it is the latest on your own chain).

The multi-source case that rule 1 is really about arrives only with
multiple devices, and it does not arrive as *versions of one profile*: a
second device has its own agent key, so it writes a **separate** profile.
Which one is "you" is then a per-viewer question, which is rule 4 territory
and which #47 explicitly defers to multi-device identity work. So this
change must not introduce any merge, pick-a-winner or
reconcile-two-versions machinery — there is nothing for it to act on, and
building it would encode the wrong model for whoever reads the code next.

The design records this reasoning so it survives the change.

## What Changes

**Zome (coordinator only — no integrity or validation change)**

- One new extern, `update_my_profile(MyProfile) -> MyProfile`, mirroring
  `create_my_profile`'s both-or-neither shape so a save cannot land the
  public half and fail the private half. Half-saving across a visibility
  boundary is the failure worth designing out.
- It resolves the original action hash itself, from the agent's own chain.
  The hash is a fact about that chain, derivable on demand; the client
  never carries it.
- Its personal-information branch is **update-or-create**: validation
  refuses an update with nothing to point at, and `get_my_profile` already
  falls back to an empty `PersonalInformation` when the agent has none.

**Client**

- `ProfileClient` gains `updateMyProfile`. `PROFILE_FUNCTIONS` grows to
  match — and that constant is also the dev signing-grant list, so the
  grant surface grows with it (see "Flagged, not done" re #42).
- `pretend-client.ts` gains the same method, so the app still runs with
  `?pretend`.

**Form logic**

- `ProfileForm`, `emptyProfileForm` and `readForm` move out of
  `src/first-launch/first-launch.ts` into a new `src/profile/form.ts`.
  They are no longer first-launch's alone.
- New `profileForm(profile)`: the inverse of `readForm`, seeding the form
  from a saved profile. It must have a defined fallback for a value the
  form's inputs cannot represent — see the risk in design.md.

**UI**

- A shared profile-form component, extracted from
  `CreateProfile.svelte`, used by both create and edit. The two differ only
  in chrome (title, buttons) and what submit does. **This is where the
  profile field-list de-duplication actually lands** — the form inputs
  exist once rather than twice.
- An edit control on the profile page, opening the form as a modal dialog
  over that page, seeded with the person's current values. Both sections,
  Profile and Personal information, in the one form — as #47 asks.
- The public section gains one line of honest wording: changes add a new
  version and earlier versions stay on the network. This matches the
  precedent the page already set with "Anyone using Āhau can see this." —
  saying what is true of the storage rather than what would be reassuring.

**State**

- `App.svelte` becomes the owner of `profile`. `Shell` takes an `onsave`
  callback and bubbles the saved profile up, so the avatars in `TopBar` and
  `SideNav` change when someone edits their name or gender. This preserves
  design D4: no component inside the shell imports the profile client.

## Capabilities

### New Capabilities
(none — `own-profile` already owns this behaviour)

### Modified Capabilities

- `own-profile`: **"No editing in this page" is modified, not removed.** Its
  header-image and photo half stays — that is
  [#43](https://github.com/ahau01/ahau-v2/issues/43), still open — while its
  edit half goes. Alongside it: new requirements for the edit control, for
  both sections being editable together, for the form being seeded with
  current values, for a save failure keeping what the person typed, and for
  the add-a-version wording on the public section.

## Impact

- **Rust**: `dnas/ahau/zomes/coordinator/profiles/src/lib.rs` only. The
  integrity zome is untouched — its update rules already cover this, which
  is the main reason this change is as small as it is.
- **TypeScript**: `src/profile/client.ts`, `src/profile/pretend-client.ts`,
  new `src/profile/form.ts`, `src/first-launch/first-launch.ts` (imports
  move out).
- **Svelte**: new shared form component plus a thin create and edit wrapper,
  `src/app/first-launch/CreateProfile.svelte`,
  `src/app/shell/ProfilePage.svelte`, `src/app/shell/Shell.svelte`,
  `src/app/App.svelte`.
- **Specs**: `openspec/specs/own-profile/spec.md`.
- **Routes**: none. The edit screen is a dialog, so `parseRoute` and the
  `navigation` spec are untouched.
- **Stored data**: no entry shape changes, so nothing already written needs
  migrating. Profiles created before this change are editable as they are.

## Flagged, not done

- **Multi-device identity** (#47's own deferred item). Two devices means two
  agent keys and so two separate profiles. Reconciling them is a per-viewer
  render decision and needs multi-device identity designed first. Nothing in
  this change should assume it, and nothing here blocks it.
- **Deleting a profile.** Still refused by validation
  (`PROFILES_CANNOT_BE_DELETED`), pending a retraction design. Not touched.
- **Clearing an optional field is retraction-shaped.** Removing your email
  or dropping a skill writes a new version without it, but the old version
  with it survives — on your own chain for personal information, and on any
  peer holding it for the public profile. So "remove" is not erasure. This
  change does not solve that; it is the same gap as deletion. Whether
  clearing a field deserves its own wording, beyond the general
  add-a-version line, is an open question in design.md.
- **Who can read a profile** ([#67](https://github.com/ahau01/ahau-v2/issues/67)).
  Deferred until a real network exists, as that issue says. It changes
  *where profiles live*, not how editing works: "only the author adds
  versions, pointing at the original" survives whatever it decides.
- **Showing someone else's profile**, and picking the version its author
  wrote last by `action_seq` rather than by timestamp or arrival order. #47
  describes this, but there is no screen that shows another person's profile
  yet, so there is nothing to render it into. It belongs with whatever
  change adds that screen.
- **Dev signing grants piling up** ([#42](https://github.com/ahau01/ahau-v2/issues/42)).
  Adding a function to `PROFILE_FUNCTIONS` widens the grant this change
  hands out, which makes #42 slightly worse but is not caused by it. Left
  there.
- **Rust ↔ TypeScript field and gender sync**
  ([#54](https://github.com/ahau01/ahau-v2/issues/54)). Untouched.
- **Profile photo and header image** (#43). The form keeps its disabled
  upload button exactly as it is.
