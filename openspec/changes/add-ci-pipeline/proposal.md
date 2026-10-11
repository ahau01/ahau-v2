# Proposal

Closes [#35](https://github.com/ahau01/ahau-v2/issues/35),
[#36](https://github.com/ahau01/ahau-v2/issues/36) and
[#37](https://github.com/ahau01/ahau-v2/issues/37), completing
[#34](https://github.com/ahau01/ahau-v2/issues/34).

## Why

This repo has no CI. There is no `.github/` directory at all. Every check it
has — `tsc`, `node --test`, vitest, svelte-check, `cargo test`, and the
Tryorama conductor tests — runs only when someone remembers to run it
locally.

That matters most for the checks that matter most. CLAUDE.md states that
kaupapa rules need tests against a real conductor, and that passing tests
confirm code works, not that it is right for this data model. The repo has
those conductor tests — `validation.conductor.ts`,
`client.conductor.ts`, `first-launch.conductor.ts`, and the
`rogue_profiles` zome that attacks profile validation from the outside — and
nothing guarantees they ran before a merge. An AI-generated change that
compiles and passes the DOM tests while quietly weakening a validation rule
is exactly the failure CLAUDE.md warns about, and exactly what nothing
currently catches.

Second goal: prove the setup reproduces on a clean machine. The Nix flake
pins Holonix 0.6; the README claims `npm test` works without Nix. Neither is
verified anywhere.

Three facts in #34, #35 and #36 have gone stale since they were written, and
this change is scoped against the current state rather than theirs:

- **The free-plan constraint is gone.** `ahau01` is on the **team** plan, so
  the branch-protection 403 that blocked #37 no longer applies. The
  minutes-driven reasoning in #34 and #36 is weaker than when written; the
  single-Holochain-job shape is kept on simplicity grounds instead.
- **#37 is half-implemented, not implemented.** Ruleset `24758236`
  ("main protection") is active on the default branch with `deletion`,
  `non_fast_forward`, `creation`, `update`, `required_linear_history` and a
  `pull_request` rule (one approval, thread resolution,
  extra approval for unattributed changes). It has **no**
  `required_status_checks` rule — the one thing #37 is named for. It could
  not have one, because no checks exist to require.
- **#24 landed.** `npm test` is now
  `npm run build && node --test dist && vitest run`, with no manifest,
  contract-coverage or conformance-coverage scripts. #35's reasoning about
  calling `npm test` as a whole so the workflow survives #24 describes
  history; the advice still holds.

Now, because every later change is reviewed without it. CI is the cheapest
point in the project's life to add it.

## What Changes

- **New** `.github/workflows/ci.yml`, triggered on `pull_request` and on
  `push` to `main`, with a `concurrency` group that cancels superseded runs
  on PR branches and never on `main`. Two jobs:
  - **`fast`** (`timeout-minutes: 10`), on a clean GitHub-hosted runner with
    no Nix, proving the README's claim that the app's checks need no
    Holochain: Node from `.nvmrc`, `npm ci`, `npm test`,
    `npm run check:app`, `npm run check:app-build`.
  - **`holochain`** (`timeout-minutes: 30`): Nix with Holochain's public
    Cachix substituter, Node from `.nvmrc` **before** `nix develop` (the
    Holonix shell provides no Node and inherits it from `PATH`), `npm ci`,
    a Rust cache, then `nix develop --command npm run test:zomes` and
    `nix develop --command npm run test:conductor` as separate steps.
- `npm run check:app-build` **replaces** `npm run build:app` in the `fast`
  job rather than being added alongside it. Both perform a production build;
  the check adds an assertion on top of one, so running both would pay for
  the build twice. This is why the change depends on
  `move-prod-build-check-out-of-vitest` (#53) landing first.
- **New** `.github/dependabot.yml`, for the `github-actions` ecosystem
  **only**.
- Every third-party action pinned to a full commit SHA with a `# vX`
  comment.
- **Modified** `README.md`: a short CI section saying what runs where, and
  that the `fast` job deliberately runs without Nix.
- **Modified** `CLAUDE.md`, Working norms: CI runs the conductor tests;
  don't merge red.
- **Modified** ruleset `24758236`: add a `required_status_checks` rule for
  the `fast` and `holochain` checks. This is a repo-settings change made
  through `gh api` by someone with admin rights, not a file in the diff, and
  it is sequenced last — see design.md.

### On the kaupapa rules

This change adds no zome, client or component code and touches none of the
four rules directly. It is worth saying plainly anyway, because it is the
mechanism behind two of CLAUDE.md's working norms rather than a neutral
piece of tooling: "tests assert real behaviour, not mocked sync state", and
the requirement that kaupapa rules be tested against a real conductor. The
`holochain` job is what makes those norms checkable by something other than
memory. #36's verification step — a throwaway PR that deliberately breaks a
profile validation rule and must turn the job red at the conductor step — is
part of the work, not a formality, because a conductor job that silently
fails to exercise validation would be worse than none.

### On enforcement and the bypass

Ruleset `24758236` lists one bypass actor — the repo owner, mode `exempt`.
Required status checks will therefore gate collaborator and agent-authored
PRs while leaving the owner an admin override. With two filled seats and
`required_approving_review_count: 1`, that override is also what makes the
owner's own PRs mergeable at all.

The bypass is deliberately left as it is. #37's acceptance criterion "a PR
with a failing check can't be merged" is reworded to say what is actually
enforced and for whom, rather than narrowing the bypass to make the original
wording true. Claiming an enforcement the ruleset does not provide would be
the worse outcome.

## Capabilities

### New Capabilities

None. CI verifies existing behaviour; it does not add any.

### Modified Capabilities

None. No requirement in `launch`, `navigation` or `own-profile` changes.
`.openspec.yaml` sets `skip_specs: true`, matching how
`retire-adrs-for-openspec` and `set-docs-authority-boundaries` were handled.

## Impact

| Path | Change |
| --- | --- |
| `.github/workflows/ci.yml` | new — the directory does not exist yet |
| `.github/dependabot.yml` | new |
| `README.md` | new CI section |
| `CLAUDE.md` | one working norm |
| ruleset `24758236` | `required_status_checks` added via `gh api` |

Depends on `move-prod-build-check-out-of-vitest` for the
`check:app-build` script. No application, zome or test code changes.

## Flagged, not done

- **Narrowing or removing the owner's ruleset bypass.** A separate decision;
  see "On enforcement and the bypass".
- **Path filters on the `holochain` job.** #34 deferred these as risky — a
  change to `src/profile/client.ts` can break `client.conductor.ts` — and
  there is still no evidence they are needed.
- **A project-owned Cachix cache, or caching the whole Nix store.** Start
  with Holochain's public cache and measure first.
- **Splitting `test:zomes` and `test:conductor` into separate jobs.** Now
  affordable on the team plan, but the two steps share the wasm artefacts
  `build:happ` produces, so splitting them means rebuilding or passing
  artefacts between jobs. Not worth it for the parallelism until the job is
  slow enough to care.
- **Dependabot for npm and cargo.** #35 scoped it to `github-actions`
  deliberately; version bumps in a Holochain-pinned workspace are their own
  decision.
- **`#41`, what a production build does to reach Holochain.** The `fast`
  job's `check:app-build` step asserts only that the pretend client is
  absent. `src/profile/dev-connection.ts` is in the production bundle today;
  CI will not say anything about that until #41 is decided.
- **Caching `npm ci` via `actions/setup-node`'s `cache: npm`.** Worth doing,
  but measure the `fast` job first — it may already be inside its 10-minute
  budget without it.
