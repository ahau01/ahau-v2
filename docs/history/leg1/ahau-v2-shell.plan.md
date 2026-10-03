# Plan: Āhau v2 — Shell Runs

**Source PRD**: `docs/prds/ahau-v2-repo-foundation.prd.md`
**Selected Milestone**: 3 — `ahau-v2` shell runs
**Complexity**: Medium

## Summary

A fresh clone boots, routes, and renders placeholder screens against the
fixture backend on one Node version. The last milestone of Leg 1, and the first
time anything *consumes* the contract through a user interface.

Two long-standing assumptions are corrected here rather than carried forward.

## Corrections carried into this plan

**`ahau-styles` is not a source of truth.** Earlier PRDs and plans in this
repository call it exactly that. It is a proof of concept that still needs
correction, so it is treated here as a starting point to verify against the
running Vue application, not as a specification.

**Tribal theming is unverified.** The `are-are` theme was written before
migration, its assets are of unconfirmed origin, and the user need behind it is
unconfirmed. Previous plans, and the component-strategy argument in this
session, leaned on per-iwi theming as a settled sovereignty requirement. It is
not. This milestone builds one theme and treats theming as an open question —
including whether assets of unclear provenance belong in a whakapapa
application at all, which is a question for the community rather than for this
plan.

## Decisions taken with the product owner

| Decision | Choice |
|---|---|
| Components | Hybrid: headless primitives for the ~8 hard components, hand-built and token-driven for the other ~29 |
| Design parity | Screenshot comparison against the running Vue application |
| Parity baseline source | `ahau-monorepo`, where the Vue app runs |
| Theming | One theme only; tribal theming deferred pending verification |

The hybrid choice is barely exercised here: a shell needs layout, navigation
and theming, and almost none of the hard components. The headless library is
therefore selected and proven with **one** dialog, so the decision is tested
rather than assumed, and cheap to reverse if it proves wrong.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Contract consumption | `src/contract/operations/index.ts` | `DataAccess` — the shell talks to this and nothing else |
| Data for screens | `src/fixtures/backend.ts` | `createFixtureBackend`, already exercised by 43 tests |
| Capability handling | `src/contract/capabilities.ts` | `Supported<T>`; a declined capability is a UI state, not an error |
| Toolchain | `ahau-v2` `package.json`, `tsconfig.json` | One Node version, strict TypeScript, gates wired into `npm test` |
| Layout being replaced | `ui/src/**/*.vue` | 869 of 1,871 Vuetify tags are grid primitives CSS replaces natively |
| Visual starting point | `~/projects/ahau-styles` | Tokens and icons — to be verified, not adopted wholesale |

## Files to Change

**New — `ahau-v2`**

| File | Action | Why |
|---|---|---|
| `vite.config.ts`, `svelte.config.js` | CREATE | Svelte 5 build, added to the existing toolchain |
| `index.html`, `src/app/main.ts` | CREATE | Entry point |
| `src/app/routes/*.svelte` | CREATE | Placeholder screens, one per surviving domain area |
| `src/app/shell/*.svelte` | CREATE | Layout, navigation, theme provider |
| `src/app/tokens.css` | CREATE | Verified design tokens |
| `src/app/backend.ts` | CREATE | Wires the fixture backend in, swappable for an adapter later |
| `scripts/capture-baseline.mjs` | CREATE | Captures reference screenshots from the running Vue app |
| `docs/design-parity.md` | CREATE | How parity is judged, and against what |

## Tasks

### Task 1: Svelte shell boots
- **Action**: Add Svelte 5 and Vite to the existing toolchain without disturbing the contract build. Routing, an entry point, and a page that renders.
- **Mirror**: The existing `tsconfig.json` strictness and single pinned Node version.
- **Validate**: A fresh clone runs `npm install && npm run dev` and serves a page; `npm test` still passes all existing gates.

### Task 2: Verify the design tokens
- **Action**: Compare `ahau-styles` tokens against the running Vue application and correct them. Record which values were confirmed, which were wrong, and which could not be found. Do not adopt a token whose origin cannot be traced.
- **Mirror**: The triage's discipline — record what was checked and what was decided, not just the result.
- **Validate**: Every token in `src/app/tokens.css` cites where it was confirmed. Tokens that could not be verified are absent, listed, and explained.
- **Note**: this is the first task because everything visual depends on it, and the input is known to be unreliable.

### Task 3: Layout and navigation
- **Action**: Build the shell — app frame, navigation, routing between placeholder screens — with CSS grid and flexbox, no component library. This is the 46% of the old UI that needs no components at all.
- **Mirror**: The information architecture of the Vue app's navigation, not its markup.
- **Validate**: Every surviving domain area is reachable; the shell is usable by keyboard alone.

### Task 4: Prove the hybrid with one dialog
- **Action**: Select the headless primitive library and build exactly one dialog with it — focus trap, escape, focus restore. One component, chosen because dialogs are where hand-rolling most often goes subtly wrong.
- **Mirror**: Nothing; this is the first component decision in the repository.
- **Validate**: The dialog traps and restores focus and closes on escape, verified by keyboard. If the library fights Āhau's styling, that is a finding and the decision is revisited — which is the point of proving it on one component rather than thirty.

### Task 5: Screens consume the contract
- **Action**: Wire placeholder screens to `createFixtureBackend` through `DataAccess`, so the shell reads real fixture data. Render a declined capability as a UI state rather than an error.
- **Mirror**: `Supported<T>` handling in `src/fixtures/backend.test.ts`.
- **Validate**: A screen renders fixture data; switching the fixture to the degraded profile changes what the UI offers without any screen code changing.
- **Why this matters**: this is the first time the contract is consumed by a UI. Expect friction, and record it as Milestone 4 did.

### Task 6: Capture the parity baseline
- **Action**: Run the Vue app from `ahau-monorepo` and capture reference screenshots of each screen. Commit the images. Record the fixture data and viewport used, so a later comparison is like for like.
- **Mirror**: Nothing; new capability.
- **Validate**: Baseline images exist and are reproducible from a documented procedure.
- **Note**: captured once and kept, so the old toolchain does not have to stay alive for parity to remain checkable.

### Task 7: Document the parity method
- **Action**: `docs/design-parity.md` — what parity means, what it is judged against, and what it explicitly does not cover.
- **Mirror**: `docs/contract-decisions.md`.
- **Validate**: The procedure can be followed without asking its author.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Design tokens are wrong and everything built on them inherits the error | High | Task 2 verifies before anything visual is built. The input is a known-unreliable proof of concept, which is why it goes first. |
| Theming gets rebuilt on unverified assets of unclear provenance | Medium | Explicitly out of scope. One theme, and provenance raised as a question for the community rather than resolved by a plan. |
| The headless library fights Āhau's styling, discovered after thirty components | Medium | Task 4 proves it on one dialog. Reversing one component is cheap; reversing thirty is the Vuetify situation again. |
| The shell is built against the contract and finds it unusable in a UI | Medium | Expected rather than feared — it is the first UI consumer. Record friction as Milestone 4 did; do not quietly reshape the contract. |
| Screenshot baselines rot as the Vue app changes | Low | The Vue app is in maintenance. Record the commit the baseline was captured from. |
| Building placeholder screens drifts into porting real ones | Medium | Milestone 3 is shell and navigation. Real screens are Leg 2, gated by the cut list that does not exist yet. |

## Acceptance

- [ ] All tasks complete
- [ ] A fresh clone boots, routes and renders on one Node version
- [ ] Every design token cites where it was verified; unverifiable ones are absent and listed
- [ ] Navigation is usable by keyboard alone
- [ ] One dialog built on the chosen headless primitive, focus behaviour verified
- [ ] A screen renders fixture data through `DataAccess`; the degraded profile changes the UI with no screen code change
- [ ] Parity baseline captured, with the source commit recorded
- [ ] Existing gates still pass — contract coverage, conformance coverage, manifest staleness
- [ ] Friction found while consuming the contract is recorded, not silently fixed

---
*Status: COMPLETE, with one task deferred. Shell delivered in https://github.com/ahau01/ahau-v2*

## Outcome

Tasks 1-5 and 7 complete. Task 6, capturing the parity baseline, is deferred:
there are no ported screens to compare, and `main.js` polls GraphQL before
mounting, so a baseline needs the whole desktop stack rather than a UI dev
server. Recorded in `docs/design-parity.md` with the procedure, so it is a
scheduled task rather than a gap.

Token verification found a real inversion in `ahau-styles`, which justified
verifying rather than adopting.

The hybrid was proven on one dialog, with focus behaviour verified in a browser.

Two contract findings recorded from the first UI consumer: a refused write has
no representation, and the contract has no current-group concept.
