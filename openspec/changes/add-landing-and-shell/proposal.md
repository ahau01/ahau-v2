# Proposal

From [#59](https://github.com/ahau01/ahau-v2/issues/59) (map: next slice — landing and a navigable shell), with the questions it handed off settled in explore: [#62](https://github.com/ahau01/ahau-v2/issues/62) (where you land), [#63](https://github.com/ahau01/ahau-v2/issues/63) (which pages), [#64](https://github.com/ahau01/ahau-v2/issues/64) (navigation before groups), [#65](https://github.com/ahau01/ahau-v2/issues/65) (dev-only or built). The look depends on [#61](https://github.com/ahau01/ahau-v2/issues/61) (captures of the old app's pages).

**Kaupapa rules this bears on.** This change touches **identity data**: it shows a person their own profile, which is read through the existing profile client. That bears on **rule 4** (identity is not session auth): the avatar step on launch is UI only. It records nothing and is not a login, and "you" means the agent key on this device. It also bears on **rule 3** (no central authority): routes for your own space are not under a group id, and nothing is fetched from any one node. It does **not** touch relationship data, sync or access control. The Whakapapa, Archive and Tribe list pages are empty states with no client module, so they fix no data shape (rules 1 and 2).

## Why

After first launch a person reaches a bare "Kia ora, {name} / You're in." screen with nowhere to go. Āhau needs the place a person lands, and a shell around it that shows the app's real top-level pages. That gives every later slice (edit profile, whakapapa, archive, group permissions) a home to plug into. Doing it now, before groups exist, lets the navigation be designed so the group-permissions slice has nothing to undo.

## What Changes

- **Avatar step on every launch.** A person who already has a profile sees their avatar and name on the launch screen and clicks it to go in. This also happens right after creating a profile. Today a returning agent goes straight in.
- **You land on your own profile** at `#/me/profile`. It has two separate sections, each labelled with who can actually see it:
  - **Profile**: "Anyone using Āhau can see this." (true today; see #67)
  - **Personal information**: "Only you can see this." (a private entry, ADR-0007)
- **A navigable shell**, two levels as in the old app:
  - a top bar picks *whose space*: you, and the tribe list via "+"
  - a side nav picks *which section* of your space: Profile, Archive, Whakapapa
- **Honest empty states** for Archive (`#/me/archive`), Whakapapa (`#/me/whakapapa`) and the Tribe list (`#/tribes`). They read as "coming", not "broken", and invent no data.
- **Hash routing** for these routes, with unknown routes going to your profile.
- **Light page surface tokens** for the pages after launch, traced to the old app's source. Today `tokens.css` only has the dark scheme.
- **Parity screenshots** of the new screens, compared with captures of the old app (#61), following `docs/design-parity.md`.
- **Removed:** `Home.svelte`, the bare landing spot.

## Capabilities

### New Capabilities

- `launch`: what a person sees when Āhau opens, before they are in: starting, failure, the welcome for a new agent, and the avatar step for an agent with a profile. Creating a profile is already built and is not respecified here.
- `navigation`: the shell's spaces, sections and routes. Covers where a person lands, how they move between their own sections and the tribe list, what unknown routes do, and how sections whose data isn't designed yet are presented.
- `own-profile`: a person viewing their own profile. Covers which fields show, the two sections, and what each says about who can see it.

### Modified Capabilities

None. `openspec/specs/` is empty.

## Impact

- **Code:**
  - `src/first-launch/first-launch.ts` and its tests: a new state for an agent with a profile who hasn't gone in yet
  - `src/app/first-launch/LaunchScreen.svelte`: the avatar step
  - `src/app/first-launch/FirstLaunch.svelte`: hands off to the shell
  - new `src/app/shell/` (top bar, side nav, router, pages)
  - new `src/navigation/` (route parsing, no Svelte)
  - `src/app/tokens.css`: light surface tokens
  - `Home.svelte`: removed
- **No zome, DNA or profile-client changes.** The shell uses `getMyProfile()` as it is. The DNA hash is unchanged.
- **Dependencies:** none added. Routing is a small hand-written module.
- **Docs:**
  - `docs/parity/shell/`: v2 screenshots
  - `docs/old-app-capture/`: old-app captures (#61)
  - `docs/token-verification.md`: provenance for the new tokens
  - `CONTEXT.md`: Tribe, group, tribe profile, your space
- **Builds:** dev-only (#65). `npm run build:app` still can't reach Holochain (#41). `production-build.test.ts` must stay green.

## Flagged, not done

- **#59's line "every page sits under `/tribe/:tribeId`"** described the old app. This change replaces it with `#/me/...` beside `#/tribes` (#64), so there is no stand-in personal group id. Tribe spaces arrive later as `#/tribes/:id/...`.
- **Who can read a person's profile (#67).** The Profile label says "Anyone using Āhau can see this" because that is true today. The intended rule (anyone in your tribes) is a storage change for the group-permissions slice and must be settled before the first real network.
- **Editing your profile (#47).** No edit button. It's the next slice.
- **Pātaka connect dialog (#22).** Not shown after the avatar step.
- **Wallet, People list, notifications bell, Help button, account settings and key backup (#68).** Cut from the shell (#63 and #62). The Help button linked to old docs.
- **Header image and profile photo (#43).** The header band uses the old app's gradient fallback. The avatar is the gender silhouette already used at first launch.
- **A built app (#41).** Out of scope. Hash routing was chosen partly because it keeps working inside a launcher.
- **Which issue the PR closes.** #59 and #62–#65 are already closed. If the #61 captures are committed in this change's PR, it can close #61.
