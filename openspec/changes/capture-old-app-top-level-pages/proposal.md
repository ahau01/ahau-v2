# Proposal

From [#61](https://github.com/ahau01/ahau-v2/issues/61) (capture the old app's top-level pages). It follows [#20](https://github.com/ahau01/ahau-v2/issues/20), which captured the launch and create-profile screens into `docs/old-app-capture/`.

**Kaupapa rules this bears on.** None directly. This change adds screenshots and notes of the old app, plus a capture script that drives the old app. It writes nothing to Holochain and touches no relationship data, sync or access control. The captures show a throwaway test identity ("Test", from #20's values), held in its own data folder, not anyone's real data.

## Why

The `add-landing-and-shell` change has a working shell, but its look (tasks 6.1–6.7) is blocked. `docs/design-parity.md` judges a screen by comparing it with the old app, and no screenshots of the old app's pages after launch exist yet. Task 6.1 names seven views it needs. Without them, the look would be built from reading code, which the change doesn't allow.

The capture is done by an agent. #20 was taken by hand: windows were cropped, wording was retyped, and a profile was deleted in the app. That made it hard to repeat exactly. The old app's baseline commit already drives the real Electron app with Playwright (GitLab MR !985), so a script can produce the captures and run again later.

## What Changes

- **A capture script, `docs/old-app-capture/capture.mjs`.** It drives the real old desktop app through Playwright's Electron support, as a fresh identity in its own data folder. It sets each window size in code, takes the screenshots, and writes out the address and the words on each page. Like `docs/parity/first-launch/shoot.mjs`, it runs from a scratch directory, so nothing is added to `package.json`.
- **Seven required captures**, added to `docs/old-app-capture/`:
  - the returning launch screen (your avatar and name)
  - your own profile, at desktop width and at narrow width
  - the empty personal Archive
  - the empty personal Whakapapa
  - the tribe list with no tribes
  - the app bar with no tribes
- **Optional captures**, where the script can reach them without setting up test data: your own profile at #20's tablet width, Wallet, and People. Pages that need a tribe, a whakapapa or a collection to exist are left for later slices.
- **A new section in `docs/old-app-capture/notes.md`** for these captures, recording for each shot:
  - the address shown in the app
  - the window size
  - all the words on the page, taken from the page itself
- **Answers to three open questions** from `docs/capability-inventory.md`, recorded in the notes from what the script saw:
  - Q1: does a returning person see the Pātaka screen?
  - Q2: does "People" show in your side nav?
  - Q6: did these pages work in the running app?
- **The same baseline as #20.** The GitLab `ahau` desktop repo at commit `f257cf1e` (v2.27.2), which is the head of branch `e2e-testing-eval`, MR !985. That repo is used rather than `ahau-monorepo` because it starts more reliably. Its UI source matches the monorepo's (`6e0a66e`) except for code nothing references, so the inventory's source references still hold.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change adds documentation and a docs-only script, and changes no behaviour in v2, so it sets `skip_specs: true`.

## Impact

- **Docs:**
  - `docs/old-app-capture/`: the new PNGs, `capture.mjs`, and a new section in `notes.md`
  - `docs/capability-inventory.md`: the Q1, Q2 and Q6 answers may update its open questions and status columns
- **Code:** none in v2's app, zomes, DNA or clients. `capture.mjs` isn't part of the build or the tests.
- **Outside the repo:** a separate checkout of the GitLab repo, and a separate data folder (`APP_NAME=ahau-capture`). The existing `~/projects/ahau` clone, `~/.config/Ahau` and `~/.ahau-test` are not touched.
- **Unblocks:** `add-landing-and-shell` tasks 6.1–6.7.

## Flagged, not done

- **`add-landing-and-shell` says its PR "can close #61"** and lists `docs/old-app-capture/` under its Impact. With this as a separate change, this PR closes #61, and that change's wording should be updated when it's next revised.
- **The old app needs Node 18** (`engines: >=18 <19`). This machine has Node 20. The design's setup uses a Node 18 shell rather than relaxing the engine check.
- **Window sizes.** #20's shots were cropped by hand at about 1000×728. That's the old app's tablet layout (Vuetify `md`), not desktop. Those captures are left as they are.
- **No person checks the captures here.** The slice owner's look at the images happens in `add-landing-and-shell` tasks 6.2–6.7, where they're compared with v2.
