# Tasks

These are agent tasks: the agent runs and drives the old Āhau desktop app on this machine (design D1–D7). There are no zome or app changes, so there are no conductor or two-devices-offline-then-sync tasks.

If the old app won't install or start, or a view can't be reached, stop at that point and report it in #61 with the error. Never fake a capture. The slice owner decides whether to capture by hand (design, Risks).

## 1. Set up the old app

- [ ] 1.1 Use the existing clone at `~/projects/ahau` (`https://github.com/ahau01/ahau.git`). Verify: `git rev-parse HEAD` prints `eb4fb4887018574f874e33c082dedc9dcc166a25`, and `git status --short` is empty. If `main` has moved, check out `eb4fb48`.
- [ ] 1.2 In a Node 18 shell (`nix shell github:NixOS/nixpkgs/nixos-24.11#nodejs_18`), run `npm install --engine-strict` in `ui/` and `desktop/`. Skip the repo root: its `wait-on` dependency needs Node 20 or later (proposal, Flagged). Verify: `node --version` is 18.x, both installs exit 0, `desktop/node_modules/electron/dist/electron` exists, and `git status --short` is still empty.
- [ ] 1.3 Start `ui` (`npm run dev`) and `desktop` (`npm run dev`) with `APP_NAME=ahau-capture`, by hand, once. Verify: the launch screen's "who are you" button shows, and a new `ahau-capture` data folder exists. Then stop both. Note any Xvfb or Electron flags that were needed (design D4, Risks).

## 2. The capture script

- [ ] 2.1 Write `docs/old-app-capture/capture.mjs` (design D1–D6). It takes the old repo's path and an output folder as arguments. Its header comment gives the run commands, in the style of `docs/parity/first-launch/shoot.mjs`. It deletes only the `ahau-capture` data folder, refusing any other path (D3), and checks the GraphQL port before launching. Verify: running it with a non-`ahau-capture` `APP_NAME` refuses to start.
- [ ] 2.2 Make the script create the "Test" profile with exactly the values in #20's "Values typed in for the filled in screenshot" table in `docs/old-app-capture/notes.md`, then skip the Pātaka screen and wait for your own profile. Verify: the run reaches a page whose address contains `/person/` and which shows "Test".
- [ ] 2.3 Add the size check from design D4: before each shot, assert that `window.innerWidth` falls in that size's Vuetify band (desktop at least 1280, narrow under 600, tablet 960–1264). Verify: temporarily setting desktop to 1000×728 makes that shot fail with a clear message.

## 3. Required captures

The script saves each one to `docs/old-app-capture/`, with a JSON file of its address and wording beside it (design D5).

- [ ] 3.1 `10-returning-launch.png` (desktop): the script restarts the app with the same `APP_NAME` and captures the launch screen with your avatar and name. It then clicks the avatar and records whether the Pātaka dialog shows; if it does, it also saves `10b-returning-pataka.png` (D7). Verify: the PNG shows the avatar and "Test", and the JSON records the Pātaka result.
- [ ] 3.2 `11a-own-profile-desktop.png` (desktop, 1366×768), with `-b`, `-c` parts if the page scrolls. Verify: the images show the side nav and both the profile and personal information sections.
- [ ] 3.3 `11b-own-profile-narrow.png` (narrow, 400×800), in parts if needed. Verify: the side nav shows as a row of icons, not a column.
- [ ] 3.4 `12-personal-archive-empty.png` (desktop): Archive, opened from the side nav. Verify: the JSON's address is the archive route, and no archive item is shown.
- [ ] 3.5 `13-personal-whakapapa-empty.png` (desktop): Whakapapa, opened from the side nav. Verify: the JSON's address is the whakapapa route, and no whakapapa is shown.
- [ ] 3.6 `14-tribes-empty.png` (desktop): the tribe list (`/tribe`), opened through the app bar. Verify: the JSON's address is `/tribe`, and no tribe is listed.
- [ ] 3.7 `15-app-bar.png` (desktop): the app bar only, using `locator.screenshot()` on the bar. Verify: every control in the bar is in the image.
- [ ] 3.8 Run the whole script a second time from scratch. Verify: it produces the same file names, and the images show the same layout and wording as the first run.

## 4. Optional captures

Only views the script reaches without setting up data (design Non-Goals). If a view isn't reachable, record that in the notes and skip it.

- [ ] 4.1 `11c-own-profile-tablet.png`: your own profile at 1000×728 (#20's size). Verify: the size check passes for the tablet band, and the file is listed in the 5.2 table.
- [ ] 4.2 Wallet and People, as `16-…` onward, if they show in your side nav. Verify: each file added is in the 5.2 table, or the notes say why it isn't there.

## 5. Notes

Write these up in a new section of `docs/old-app-capture/notes.md`, headed for #61 and set out like #20's sections, from the script's JSON files (design D5).

- [ ] 5.1 Record how the captures were made: the remote URL (`github.com/ahau01/ahau`), `git rev-parse HEAD`, the app version, the OS, Node and Electron versions, the Node source (pinned nixos-24.11), the skipped root install, how this commit relates to #20's `f257cf1e`, the display (Xvfb or real), the window sizes, the `APP_NAME`, and the command that runs `capture.mjs`. Verify: the section has each of these, and the command matches the script's header.
- [ ] 5.2 Add a table with one row for each PNG: file name, what it shows, window size, and address. Verify: every PNG added in groups 3 and 4 has a row with all four filled in.
- [ ] 5.3 Copy each page's wording from its JSON into an "Exact wording" subsection: headings, app-bar and side-nav labels, buttons, section titles, and the empty-page messages for Archive, Whakapapa and the tribe list. Verify: each page from group 3 has a subsection, and its wording matches its JSON.
- [ ] 5.4 Answer the open questions from `docs/capability-inventory.md`, naming the file that shows each answer (design D7). Verify: each one has an answer:
  - Q1: does a returning person see the Pātaka screen?
  - Q2: does "People" show in your side nav?
  - Q6: did anything not work? List any console errors the script collected.
- [ ] 5.5 Delete the JSON files once the notes are written (design D5). Verify: `git status` shows only PNGs, `capture.mjs` and `notes.md` under `docs/old-app-capture/`.

## 6. Check against what the shell needs

- [ ] 6.1 Compare the files with `add-landing-and-shell` task 6.1's list of seven views. Verify: each view has its file and notes, or the gap is reported in #61.
- [ ] 6.2 If the Q1, Q2 or Q6 answers contradict `docs/capability-inventory.md`, update its open question and the affected rows' status (e.g. "unverified" → "works (captured, v2.27.2)"). Verify: the inventory matches the notes.

## Workflow follow-up

- Open a PR from `docs/capture-top-level-pages` that says `Closes #61`.
- `/opsx:verify`, then `/opsx:archive` in the same PR.
- After merge, `add-landing-and-shell` task 6.1 can start. Its proposal's line "can close #61" should be updated when that change is next revised (flagged in this proposal).
