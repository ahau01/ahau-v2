# Āhau v2

Āhau is a whakapapa app for whānau, hapū and iwi. This repository is rebuilding it on [Holochain](https://www.holochain.org/) around what people need to do, rather than copying the old app's SSB implementation.

The current working slice covers first launch, personal profiles and the app shell. More capabilities are still being scoped. See [`openspec/specs/`](openspec/specs/) for what works today.

## Try it

Requires Node 20 (see `.nvmrc`).

```sh
npm install
npm run dev
```

Open [http://localhost:5173/?pretend](http://localhost:5173/?pretend) to try the profile flow without Holochain. The pretend profile is kept in browser storage; clear site data to start over.

## Develop with Holochain

Install Nix using [Holochain's setup guide](https://developer.holochain.org/get-started/). From the repository root, enter the pinned development environment and start a local conductor:

```sh
nix develop
npm run conductor
```

In another terminal, run `npm run dev` and open [http://localhost:5173](http://localhost:5173). The conductor is for development; restarting it creates a fresh sandbox and agent.

Useful checks:

| Command | Purpose |
|---|---|
| `npm test` | Run the JavaScript and TypeScript tests without Holochain |
| `npm run check:app` | Check the Svelte app |
| `npm run check:app-build` | Verify the production build excludes the pretend client |
| `npm run test:sweettest` | Run profile integration tests against Holochain (inside `nix develop`) |

## CI

Pull requests run CI when opened, reopened, updated with a commit, or marked ready for review. The `fast` job runs on each event and checks JavaScript, TypeScript, Svelte, and the production build without Nix. A lightweight `changes` job checks non-draft pull requests. Documentation-only changes are root Markdown files and Markdown under `docs/`, `openspec/`, or `.agents/`; other paths, including non-Markdown files in those directories, require Holochain. For docs-only changes, the required `holochain` job is skipped and reports success. Detector errors or incomplete file lists run Holochain.

For a non-draft pull request with relevant changes, `holochain` runs zome tests in the pinned Nix environment and skips Sweettest; its required check name remains `holochain`. Contributors must run `nix develop --command npm run test:sweettest` after implementation and before opening a relevant pull request, then rerun it after relevant pre-PR changes. Docs-only changes under the detector do not require Sweettest. A maintainer may waive the local run by recording their name and reason on the pull request.

Manual `workflow_dispatch` runs both zome tests and Sweettest on the selected ref, including after an exceptional direct update; it does not depend on pull request file detection. There is no automatic CI run on pushes to `main`. The cold Holochain run measured 54m35s overall, with 37m59s for zome tests and 14m15s for Sweettest. The two earlier warm job totals (10m48s and 15m32s) conflict with that Sweettest step duration, so warm-run savings are not established; compare step and whole-job durations after rollout. The initial `fast` baseline was 1m02s, recent runs took 1m00s–1m15s, and a docs-only detector run took 5s. [Cold run #6, attempt 1](https://github.com/ahau01/ahau-v2/actions/runs/38202857090/attempts/1), [warm runs #8](https://github.com/ahau01/ahau-v2/actions/runs/38207364307) and [#9](https://github.com/ahau01/ahau-v2/actions/runs/38209547189), [docs-only run #12](https://github.com/ahau01/ahau-v2/actions/runs/38212252869). The ruleset requires `fast` and `holochain` for ordinary updates and has an owner bypass, so bypassed direct updates need manual validation. Merge queue remains deferred until an administrator verifies the private repository's plan and chooses to enable it.

## Project docs

- [`CLAUDE.md`](CLAUDE.md): project-wide kaupapa principles and working practices.
- [`openspec/specs/`](openspec/specs/): current behavior.
- [`docs/INDEX.md`](docs/INDEX.md): supporting research and history.
- [`reference/leg1-contract/`](reference/leg1-contract/): frozen checklist of the old app's data-layer capabilities; it is not a spec for new code.

No license has been chosen for this rebuild yet.
