# Tasks

Groups 1–5 don't need the old-app captures. Group 6 waits on #61 (design D9). This change writes nothing to Holochain and changes no zome, so there's no conflict-handling, permission or sync logic. That's why there are no two-devices-offline-then-sync tasks (design, "Kaupapa checks").

## 1. Launch: the avatar step (`launch` spec, design D1)

- [x] 1.1 Add the `has-profile` state and `enter()` to `src/first-launch/first-launch.ts`. `has-profile` is reached from `starting` when a profile exists and from `saving` after a successful create. `enter()` moves only `has-profile` to `ready`. `has-profile` is included in `LaunchState` and `isLaunchState`. Verify: the existing first-launch tests that expected `ready` from start or save now expect `has-profile`, and pass.
- [x] 1.2 Add plain-TS tests to `src/first-launch/first-launch.test.ts`. Verify each passes under `npm test`:
  - `enter()` from `has-profile` gives `ready` with the same profile
  - `enter()` from every other state changes nothing
  - `enter()` makes no client call, using a client whose methods throw after launch
- [x] 1.3 Update `src/first-launch/first-launch.conductor.ts`: "opening the app again as the same agent" reaches `has-profile`, then `enter()` reaches `ready`, and "a new agent creates a profile" reaches `has-profile` after saving. Verify: `npm run test:conductor` passes.
- [x] 1.4 Add the `Avatar` component (design D7): `male` → `tane.svg`, `female` → `wahine.svg`, `other`/`unknown`/none → `account-fill.svg`, with a size prop and the person's name as alt text. Verify: a Vitest test renders each gender and checks the image source and alt.
- [x] 1.5 Render `has-profile` in `LaunchScreen.svelte`: one button holding the person's `Avatar` and name, focused on mount. Clicking or pressing Enter/Space calls `onenter`. No password, account or sign-out control. Verify: `LaunchScreen.test.ts` covers "shows Mere's avatar and name", "activating by keyboard calls onenter", and "no other controls".

## 2. Routes (`navigation` spec, design D2–D3)

- [x] 2.1 Create `src/navigation/routes.ts` with the `Route` type, `parseRoute(hash)` and `routeHref(route)`, with no DOM or Svelte imports. Verify:
  - plain-TS tests round-trip `#/me/profile`, `#/me/archive`, `#/me/whakapapa` and `#/tribes`
  - `''`, `#/`, `#/me`, `#/me/wallet`, `#/tribe/x/profile` and `#/tribes/x` all parse to `null`
- [x] 2.2 Add the Svelte-side route store in `src/app/shell/`. It follows `hashchange`, exposes the current `Route`, and on `null` calls `location.replace` with `#/me/profile`. Verify: a Vitest (jsdom) test sets `#/me/wallet` and sees the route become `me/profile`, with `history.length` unchanged.

## 3. Your profile's content (`own-profile` spec, design D6)

- [x] 3.1 Create `src/own-profile/sections.ts` with `profileSections(profile)`. It returns the Profile and Personal information sections as ordered `{ label, value }` lists with `isEmpty`, using the create-profile form's labels. Personal information reads only `profile.personal`. Verify with plain-TS tests:
  - blank fields are left out
  - each also-known-as, skill and education entry is its own item
  - `1952` and `1952-03` show only the parts given
  - a profile with contact details puts all six, and only those, in Personal information
  - a profile with no contact details gives an empty Personal information section

## 4. The shell (`navigation` and `own-profile` specs, design D4–D5), plain structure

- [x] 4.1 Create the root component and switch `main.ts` to mount it. It owns the launch logic (moved from `FirstLaunch.svelte`), renders launch screens for launch states, and renders `Shell` with `current.profile` for `ready`. On `enter()` it sets the address to `#/me/profile` with `replace`. Remove `Home.svelte`. Verify:
  - `npm run check:app` passes with no errors
  - a Vitest test starts at `#/me/whakapapa` with an existing profile, enters from the avatar step, and lands on `#/me/profile`
- [x] 4.2 Build the top bar: an "Add tribes" link to `#/tribes`, and the person's `Avatar` linking to `#/me/profile`, with `aria-current` on the current space's control. No bell, Help or tribe avatars. Verify: Vitest tests for the top bar on `#/me/profile` and on `#/tribes`, plus "from tribes, avatar goes to `#/me/profile`".
- [x] 4.3 Build the side nav for `#/me/*`: the person's `Avatar`, then Profile, Archive and Whakapapa links in that order, with `aria-current="page"` on the current one. No side nav on `#/tribes`. Verify:
  - a Vitest test moves from profile to Whakapapa and checks the address and `aria-current`
  - no Wallet or People item
  - no side nav on `#/tribes`
- [x] 4.4 Build the profile page from `profileSections`. The heading is the person's name. The two sections each have their visibility label next to their heading ("Anyone using Āhau can see this." / "Only you can see this."). An empty section says nothing has been added. No edit, header-image or photo control. Verify with Vitest tests for each `own-profile` scenario except "Personal information stays private" (see 4.7).
- [x] 4.5 Build the Archive, Whakapapa and Tribes pages with a heading and a provisional "still to come" line. No add, import, create or join controls. No client module. Verify: a Vitest test renders each page with a profile client whose every method throws, and none throws.
- [x] 4.6 Focus each page's heading after navigating, using `focusOnMount`. Verify: a Vitest test activates Archive in the side nav and checks that `document.activeElement` is the Archive heading. Back from Archive returns to `#/me/profile`.
- [x] 4.7 Link the own-profile scenario "Personal information stays private" to its existing conductor test, `validation.conductor.ts` "another agent cannot read my personal information, even bypassing the app", in a comment next to the Personal information label in the profile page component. Verify: the comment names the test, and `npm run test:conductor` still passes.

## 5. Vocabulary and logic-stage check

- [x] 5.1 Use `domain-modeling` to create `CONTEXT.md` with these terms:
  - **Tribe** (what people see)
  - **group** (Holochain-level talk only)
  - **tribe profile** (the old "community profile")
  - **your space** / `#/me` (the agent on this device; not a group)

  Verify: `CONTEXT.md` exists at the repo root with those four terms.
- [x] 5.2 Logic-stage integration check. Verify each of these:
  - `npm test`, `npm run test:app`, `npm run check:app` and `npm run test:conductor` all pass
  - `production-build.test.ts` still passes
  - with `npm run dev` + `npm run conductor`, a new agent creates a profile, sees the avatar step, enters, lands on `#/me/profile`, visits each section and the tribe list, and reloads back to the avatar step
  - with `?pretend`, the same walk works

## 6. Look (waits on #61 captures, design D8–D9)

- [x] 6.1 Check that the #61 captures in `docs/old-app-capture/` include the seven views this slice needs, with notes of the data on screen. If they don't, stop and raise it with the slice owner; don't build the look from code reading:
  - returning launch screen
  - own profile, desktop and narrow width
  - empty personal Archive
  - empty personal Whakapapa
  - `/tribe` with no tribes
  - app bar with no tribes

  Verify: each of the seven files is listed in the capture notes.
- [x] 6.2 Add the light page tokens to `tokens.css`, each with its source file and line in a comment and an entry in `docs/token-verification.md`. Set `color-scheme: light` on the shell root; launch stays dark. Verify: every new token has a provenance entry, and each value matches the captures by eye.
- [x] 6.3 Lay out the shell to match the captures: app bar, gradient header band, title placement, side nav with the 170px avatar, and the profile page's sections. Verify: side-by-side with the desktop profile capture, layout and order match.
- [x] 6.4 Lay out the narrow width: the side nav as an icon row under the header, and the top bar's two controls kept in the bar (no drawer, design Non-Goals). Verify: side-by-side with the narrow profile capture.
- [x] 6.5 Write the final empty-state wording and look for Archive, Whakapapa and Tribes, starting from the old app's empty pages and saying "still to come". Get the slice owner's sign-off on the te reo Māori and English. Verify: the owner approves the wording, and the `navigation` empty-state Vitest tests still pass.
- [x] 6.6 Add `docs/parity/shell/shoot.mjs`, modelled on `docs/parity/first-launch/shoot.mjs`, against `?pretend` seeded with the captures' data. Commit the v2 screenshots under the captures' file names. Verify: the script reruns and reproduces the committed images.
- [x] 6.7 Compare each v2 screenshot with its capture. Record the result and the deliberate differences in `docs/design-parity.md` (no edit button, Help, bell or Pātaka list; gradient header; silhouette avatar; "still to come" wording). Verify: `design-parity.md` has a "shell" status entry and a differences table.

## Workflow follow-up

- Open a PR for this change. If the #61 captures were committed in it, it can say `Closes #61`. #59 and #62–#65 are already closed.
- Before `/opsx:apply`, a person reads `proposal.md` and `design.md` against CLAUDE.md, because the change touches identity data (`docs/agents/openspec.md`, step 3).
- `/opsx:verify`, then `/opsx:archive` in the same PR.
