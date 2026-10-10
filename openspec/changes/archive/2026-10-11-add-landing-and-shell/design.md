# Design

## Context

See proposal.md for why, and the three specs for what. The current state this builds on:

- **Launch logic.** `src/first-launch/first-launch.ts` is plain TypeScript with states `starting | failed-to-start | welcome | needs-profile | saving | ready`. It reaches `ready` straight from `starting` when the agent has a profile, and straight from `saving` after creating one. `FirstLaunch.svelte` renders launch screens for the early states and a bare `Home.svelte` for `ready`. Screens never call the profile client; the launch logic does.
- **Profile client.** `ProfileClient` (`src/profile/client.ts`) has `waitUntilReady`, `getMyProfile`, `createMyProfile`, `close`. No change is needed. `Profile.personal` is a private entry (ADR-0007). A profile is its author's own account; only the author adds versions (ADR-0008).
- **No router.** There's no routing code or dependency. Dev runs through Vite (`npm run dev` + `npm run conductor`, or `?pretend`). A built app can't reach Holochain (#41, out of scope).
- **Tokens.** `tokens.css` is `color-scheme: dark` with the launch-screen tokens. The old app's pages after launch are light: a dark `#303030` app bar, then a white 80% to 70% gradient over `niho.svg` (`ProfileShow.vue` `.niho-bg`). The active side-nav colour is `#B02425`, which is **not** `--ahau-secondary` (`#b12526`).
- **Parity.** `docs/design-parity.md` judges a screen by comparing screenshots with the old app. No old post-launch screenshots exist yet. They are #61, and the look waits on them (explore decision).

## Goals / Non-Goals

**Goals:**

- Keep flow logic in plain TypeScript, testable without Svelte or Holochain, as first launch does. That covers the launch states, route parsing, and what the profile page shows.
- Keep the shell a pure view of data the launch already read: one `getMyProfile()` per launch, no new zome calls.
- Make the route scheme leave room for tribe spaces (`#/tribes/:id/...`) without renaming anything.
- Let the logic tasks land before the #61 captures, and the look after them.

**Non-Goals:**

- Re-reading or live-updating the profile while in the shell. Nothing can change it in this slice (#47 adds editing).
- A narrow-window drawer. The top bar has only two controls, so they stay in the bar at every width.
- Any production-build path (#41), and any change to `production-build.test.ts`'s promise.

## Decisions

### D1. A `has-profile` launch state, entered explicitly

Add `{ kind: 'has-profile', profile }` to the launch states. It's reached from `starting` when the agent has a profile, and from `saving` after a successful create (`launch` spec). A new `enter()` moves `has-profile` to `ready`, and does nothing from any other state. `has-profile` joins `LaunchState`, so the launch screen renders it.

- **Why not keep `ready` and let the launch screen hold back the shell?** That puts the flow in a component, where the plain-TS tests can't see it. The "every launch" and "after creating" rules would then be untested.
- **Why not call it `returning`?** It's also shown right after creating a profile, so the name would be wrong half the time.
- `enter()` writes nothing and calls nothing, which makes "not a login" (rule 4) a property of the code, not just a promise in the UI. The tests use a client that fails on any call after launch.

### D2. Hash routes, parsed in plain TypeScript

A route is `{ space: 'me', section: 'profile' | 'archive' | 'whakapapa' } | { space: 'tribes' }`.

- `src/navigation/routes.ts` has `parseRoute(hash)` → route or `null`, and `routeHref(route)` → `'#/me/profile'` etc. It has no DOM and no Svelte.
- A small Svelte-side module follows `hashchange` and exposes the current route as a store. On `null` it replaces the address with `#/me/profile` (`location.replace`), so back doesn't return to the bad address (`navigation` spec).
- Links are plain `<a href="#/me/archive">`, so the browser handles history, back/forward, middle-click and keyboard by itself.

Alternatives considered:

- **History API (`/me/profile`).** Cleaner URLs, but a reload needs a server-side fallback to `index.html`. Vite dev provides that, but a launcher serving files from its own origin (#41, ADR-0003) may not. Hash routes work on reload anywhere.
- **`svelte-spa-router` or similar.** It works, but it's a dependency for three routes plus a wildcard. Replacing a ~40-line module later is cheaper than removing a library.
- **SvelteKit.** It changes the whole build and isn't justified by a shell.

### D3. Your own space is `#/me`, not a personal group

On Holochain, a person's own data is their own source chain: a public `Profile` and a private `PersonalInformation`. There's no "personal tribe" object with an id, as there was on SSB. A route like `#/tribe/:personalId/...` would mean making up an id for something that doesn't exist, and baking a group model into URLs before group permissions is designed. That's the thing #64 asked to avoid, and it's rule 3 (no node or group is the authority over your own data).

`#/me` means "the agent on this device". It's a view of whoever holds the key, not a session. Tribe spaces will be `#/tribes/:tribeId/<section>`, a sibling that doesn't share an id scheme with `#/me`. They can have their own sections (People is tribe-only), so "switching keeps your section" from the old app is not designed in here.

On entering from the avatar step, the address is set to `#/me/profile` with `replace`, whatever it held before launch. That way reloading on Whakapapa and going in again lands on your profile (`launch` spec, "Avatar step on every launch").

### D4. One root component; the shell gets the profile as a prop

- `main.ts` mounts a root component that owns the launch logic, as `FirstLaunch.svelte` does today. It renders launch screens for launch states and `Shell` for `ready`, passing `current.profile`.
- The shell (`src/app/shell/`) holds the top bar, the side nav, the route store and one component per page. Pages receive what they show as props. No shell component imports the profile client.
- The empty pages (Archive, Whakapapa, Tribes) have **no client module at all**. That's deliberate: a pretend whakapapa client would fix relationship shapes (rules 1 and 2) before they're designed.
- `Home.svelte` is removed.

### D5. The profile is read once, at launch

The shell shows the `Profile` that launch read with `getMyProfile()`, or that `createMyProfile` returned. It doesn't fetch again.

- That's safe in this slice because only the author can add versions (ADR-0008), and nothing in the shell edits.
- "The latest version on this agent's own chain" is one source's own account, not last-write-wins between sources (rule 1). There's nothing to merge.
- Holochain gives each device its own agent key today, so two devices are two agents with two profiles. Neither shows the other's.
- When #47 adds editing, it owns refreshing and versions.

### D6. What the profile page shows comes from a plain function

`profileSections(profile)` (in `src/own-profile/`) returns the two sections as ordered `{ label, value }` lists, plus whether each one is empty.

- **Labels** reuse the create-profile form's wording ("First name / known as", "Also known as", "Order of birth", ...), so a person sees the same words they typed into.
- **Rules it applies:** blank fields are left out, list fields become one entry per item, and a partial date shows only the parts given (`1952`, `March 1952`).
- **The Personal information section** is exactly the six `PersonalInformation` fields. Nothing else can land in it, because the function reads `profile.personal` for that section and only that.
- Unit tests cover these rules without Svelte.

### D7. One `Avatar` component

`Avatar` maps gender to the filled silhouettes already in `src/app/assets/`:

- `male` → `tane.svg`
- `female` → `wahine.svg`
- `other`, `unknown` or none → `account-fill.svg`

That's the same mapping the create-profile gender picker uses. The launch screen, top bar and side nav all use `Avatar`, at sizes taken from the old app (46px in the app bar, 170px in the side nav). Photos are #43.

### D8. Light page tokens, traced before use

The pages after launch get light surface tokens: the page background and niho overlay, the app bar, nav active and inactive, and section text. Each one comes from the old app's source with a file reference and goes into `docs/token-verification.md`, as the existing tokens do.

- The values above (`#303030`, the white 80%/70% gradient, `#B02425`, black) are candidates from code reading. They're confirmed against the #61 captures before use.
- The launch screen keeps its dark tokens. `color-scheme` is set on the shell's root, so native controls match each surface.

### D9. Look waits on #61, logic doesn't

The work splits along the D1–D7 line:

- **First** (no captures needed): the launch state, routes, `profileSections`, `Avatar`, and a working shell with plain structural markup and accessible names.
- **After the captures:** light tokens (D8), layout and spacing, empty-state wording and look, the narrow-window layout, and the parity check.

The empty-state wording starts from the old app's own empty Archive and Whakapapa pages for a brand-new person. It changes "nothing here yet" to "still to come", because v2 hasn't built those sections and the person may well have whakapapa. The spec forbids suggesting they have no data.

**Parity:**

- v2 screenshots go in `docs/parity/shell/`, taken with a `shoot.mjs` like `docs/parity/first-launch/shoot.mjs`, against `?pretend`, seeded to match the data in the captures' notes.
- Each screenshot is compared by eye with the capture of the same name.
- Deliberate differences are recorded in `design-parity.md`'s table: no edit button, no Help, no bell, no Pātaka list, gradient header, silhouette avatar.

### D10. Tests

- **Plain TS** (`node --test` over `dist`):
  - launch states: `has-profile` from start and from save, and `enter()`
  - `parseRoute` and `routeHref` round-trips, plus the unknown-route cases
  - `profileSections` rules
- **Components** (Vitest + Testing Library):
  - the avatar step renders and enters
  - the side nav marks the current item (`aria-current="page"`)
  - focus moves to each page's heading
  - unknown hash → `#/me/profile`
  - no zome calls: the empty pages render with a client whose every method throws
- **Conductor:** update `first-launch.conductor.ts`'s "opening the app again" test, so reopening reaches `has-profile` and `enter()` reaches `ready`. No new zome behaviour means no new conductor promises.
  - The "another agent cannot get Personal information" scenario in the `own-profile` spec is already covered by `validation.conductor.ts` ("another agent cannot read my personal information, even bypassing the app"). The task list points at it rather than duplicating it.

### Kaupapa checks (from config rules)

- **Merge-sensitive mutations:** none. This change writes nothing to Holochain. `enter()` and navigation are UI state only.
- **Two devices offline, then sync:** nothing to conflict, because nothing is written. Each device shows its own agent's own profile, as read at launch.
- **Permissions changing afterwards:** none change in this slice. The Profile label is truthful about today (#67: any agent on the network can read a `Profile`). If #67 later narrows who can read profiles, entries already gossiped to other peers stay readable on those peers. Nothing is erased. The label will need to say so then; that belongs to #67, not here.
- **Enforcement not only in the UI:** "Only you can see this" is enforced by Personal information being a private entry in the integrity zome (ADR-0007), not by this page. The page only reports it.

## Risks / Trade-offs

- **The #61 captures may be slow to arrive, or the old app may not run.** → The logic tasks land first and the shell is usable. If capturing turns out to be impossible, the person who owns the slice decides whether to fall back to a code-read baseline. That decision belongs in this design, and an agent doesn't make it.
- **Candidate token values from code reading may be wrong** (the old styles mix Vuetify themes, as `token-verification.md` already found once). → D8: nothing ships until it's confirmed against a capture and recorded with provenance.
- **"Anyone using Āhau can see this." may alarm people.** → It's true, and hiding it would be worse. #67 tracks narrowing it before the first real network.
- **The avatar step on every reload slows dev iteration.** → Svelte HMR keeps component state, so most edits don't reload. `?pretend` makes the step one click.
- **Hash URLs look less clean.** → Accepted for launcher compatibility (D2). Switching to the history API later is contained in one module.

## Migration Plan

There's no data or DNA change, so the DNA hash is unchanged and existing dev profiles still load. It's dev-only (#65). Rollback is reverting the change. Removing `Home.svelte` affects no stored state.

## Open Questions

- **Exact te reo Māori and English wording for the three empty states.** It's settled from the #61 captures plus the slice owner's review. It doesn't change the specs (which fix what the empty states must and mustn't say) or the tasks.
- **Narrow-window breakpoints and the side nav's icon-row form.** Taken from the narrow-width capture. Layout only.
