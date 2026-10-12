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

For a non-draft pull request with relevant changes, `holochain` runs zome tests and serial Sweettest integration tests in the pinned Nix environment. Its required check name remains `holochain`. The first consolidated cold Holochain run measured 54m35s; `fast` measured 1m02s. There is no automatic CI run on pushes to `main`. Use `workflow_dispatch` to run both jobs on the selected ref after an exceptional direct update; the manual run does not depend on pull request file detection. The ruleset requires `fast` and `holochain` for ordinary updates and has an owner bypass, so bypassed direct updates need this manual validation. Merge queue remains deferred until an administrator verifies the private repository's plan and chooses to enable it.

## Project docs

- [`CLAUDE.md`](CLAUDE.md): kaupapa rules and working norms.
- [`openspec/specs/`](openspec/specs/): current behavior.
- [`docs/INDEX.md`](docs/INDEX.md): supporting research and history.
- [`reference/leg1-contract/`](reference/leg1-contract/): frozen checklist of the old app's data-layer capabilities; it is not a spec for new code.

No license has been chosen for this rebuild yet.
