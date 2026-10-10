# Design

## Context

- **The old app.** The GitLab `ahau` repo at `f257cf1e` is v2.27.2, with Electron 26.4.1 and Vuetify 2.3.20. In development it runs as two processes: `ui` (`npm run dev`, serving on port 3000) and `desktop` (`npm run dev`, which loads `http://localhost:3000`, `desktop/main.js:55-57`). Both need Node 18.
- **What !985 left at that commit.** `@playwright/test` is a `ui` dev dependency. `ui/e2e/login.spec.js` launches `desktop/main.js` with `_electron.launch()` and `NODE_ENV=development`. `Login.vue` has `data-testid`s for `login-splash`, `who-are-you-button` and `login-avatar`. The spec's `executablePath` points at `electron.exe`, so it only ran on Windows as written.
- **Data folder.** `desktop/ssb.config.js:9` puts all of the app's data in `envPaths(process.env.APP_NAME || env.ahau.appName).data`. A new `APP_NAME` means a new identity and an empty database.
- **Layout breakpoints.** `ProfileShow.vue:164-168` (`mobile` is `xs`, `tablet` is `md`) and `SideNavMenu.vue`. With Vuetify 2.3's default breakpoints, under 600px is mobile and about 960–1264px is tablet.
- **Ports.** The SSB, blob and GraphQL ports are fixed by `ahau-env`, so only one copy of the old app can run at a time.

## Goals / Non-Goals

**Goals:**

- The seven views `add-landing-and-shell` task 6.1 needs, at fixed sizes, from one script anyone can rerun.
- The wording and addresses are taken from the running app, not retyped.
- Your real old-app identity and data are never read, changed or deleted.

**Non-Goals:**

- Changing the old app beyond what launching it needs. No new `data-testid`s, no code patches.
- Pages that need test data to exist first (a tribe, a whakapapa, a collection).
- Pixel-diff tooling. Comparing by eye stays the method (`docs/design-parity.md`).
- Retaking #20's captures.

## Decisions

### D1. Drive the real Electron app, not the UI in a browser

The script uses `_electron.launch()` from `playwright-core` on `desktop/main.js`, with `NODE_ENV=development` against the `ui` dev server, as !985 did.

- **Alternative: open `localhost:3000` in plain Chromium**, as v2's `shoot.mjs` does. That's rejected. The UI needs the SSB and GraphQL backend that `desktop` starts, and the window chrome and Electron-only behaviour (the launch flow, the Pātaka step) would differ.
- **Alternative: a built app (`npm run dist`).** That's rejected because it's slower and has more ways to fail, and #20 also ran from source.

The Electron binary is `desktop/node_modules/electron/dist/electron` on Linux, not `electron.exe`.

### D2. Script lives in v2, runs from a scratch directory

`docs/old-app-capture/capture.mjs` sits next to the images it produces, the same way `docs/parity/first-launch/shoot.mjs` sits next to its images. Its header comment gives the exact commands to run it. It installs `playwright-core@1` in a temp directory, so v2's `package.json` gains nothing.

- **Alternative: a spec in the old repo's `ui/e2e/`.** That's rejected because the old repo is a frozen baseline, and a script there wouldn't be versioned with the captures.

The script takes the old repo's path and the output folder as arguments, so it doesn't depend on where the clone lives.

### D3. A fresh identity every run, using `APP_NAME`

Each run sets `APP_NAME=ahau-capture` and deletes that one folder (the `envPaths` data path for `ahau-capture`) before launching. The script prints the path it deletes, and refuses to delete anything outside the user's data directory or any folder not named `ahau-capture`.

- **Alternative: #20's in-app "delete your profile and database".** That's rejected because it destroys whichever identity the app opens, which on this machine is the user's own.

### D4. Window size set in code; screenshot the page content

The script calls `BrowserWindow.setContentSize(w, h)` through `electronApp.evaluate`, waits for the layout to settle, then calls `page.screenshot()`. That captures the web content only, with no OS title bar, which matches what `shoot.mjs` captures of v2.

- **Sizes:** desktop 1366×768, narrow 400×800, and optional tablet 1000×728.
- **Check:** before each shot the script reads `window.innerWidth` and asserts it's in the intended Vuetify band. A shot in the wrong layout fails instead of being saved.
- **Pages that scroll** are captured in parts (`-b`, `-c`), as #20 did.
- **Display:** the script runs under `xvfb-run` so the window size isn't limited by the real screen. If Electron 26 fails there, it can run on the desktop display instead.

### D5. Wording and addresses come from the page

For each view the script writes a JSON file alongside the PNG. It holds:

- `location.hash`, plus the router's `currentRoute.fullPath` if the app exposes it
- `document.body.innerText` of the main content, the app bar and the side nav. `innerText` applies CSS `text-transform`, so it gives the capitals people saw.

The agent writes `notes.md` from those files. The script doesn't generate it, because the notes need judgement (what each page is, the answers to Q1, Q2 and Q6).

The JSON files are kept until the notes are written and then deleted. Only the PNGs, `capture.mjs` and `notes.md` are committed.

### D6. Navigation by role and text, using !985's test ids where they exist

The script finds controls the way a person would: by accessible role and visible label (`getByRole`, `getByText`). It uses `login-avatar` and `who-are-you-button` for the launch screen. When a label is ambiguous, it scopes the search to the side nav or app bar element rather than adding test ids (Non-Goals).

### D7. Q1 is checked in the script; Q2 and Q6 are judged from what it captured

- **Q1:** the script restarts the app with the same `APP_NAME`, clicks the avatar, and records whether the Pātaka dialog appears. If it does, the script screenshots it.
- **Q2:** answered from the side-nav wording.
- **Q6:** answered from console errors, which the script collects with `page.on('console')`, and from anything that looks broken in the captures.

### Kaupapa checks

This change writes nothing to Holochain. It has no merge-sensitive mutations, no sync or offline-conflict behaviour, and no permissions. The old app's data lives only in a throwaway local SSB folder, which is deleted on every run.

## Risks / Trade-offs

- **The old app won't install or start under Node 18 on Linux** (native modules, `patch-package`, `electron-builder install-app-deps`). → Use Node 18 from nix (`nix shell nixpkgs#nodejs_18`). If install still fails, stop and report the error in #61. The slice owner decides whether to capture by hand. Don't patch the old app.
- **Electron 26 under Xvfb** may need flags (GPU, sandbox). → Try `--disable-gpu` first, then the real display (D4). Note what was needed in the script's header.
- **Some views can't be reached without data**, or a label isn't found. → The script records the failure for that view and continues. A missing view is reported in the notes and in #61, never faked.
- **The `ahau-env` ports are taken** by another copy of the old app. → The script checks the GraphQL port before launching and stops with a clear message.
- **Timing flakiness:** SSB start-up is slow, and the app re-fetches tribes every 10s. → The script waits for named elements, not fixed delays, and uses short settle waits only after resizing.
- **The captures differ slightly from a real person's view**: no title bar, the Xvfb font set. → Accepted. Comparing v2 by eye depends on layout and wording, not font hinting. The fonts used are noted in the notes.
