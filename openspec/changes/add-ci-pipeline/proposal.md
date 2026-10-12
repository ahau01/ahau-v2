# Proposal

Closes [#35](https://github.com/ahau01/ahau-v2/issues/35),
[#36](https://github.com/ahau01/ahau-v2/issues/36) and
[#37](https://github.com/ahau01/ahau-v2/issues/37), completing
[#34](https://github.com/ahau01/ahau-v2/issues/34).

## Why

This repo had no CI and no `.github/` directory at all when this change was
written: every check it has — `tsc`, `node --test`, vitest, svelte-check,
`cargo test`, and the conductor tests — ran only when someone remembered to
run it locally.

That is now partly fixed from the other direction. #86 added
`.github/workflows/sweettest.yml`, so the Sweettest cases do run on every
PR. Nothing else does: `tsc`, `node --test`, vitest, svelte-check,
`cargo test` and the production-build check are still unguarded, and the repo
has two CI workflows' worth of Nix and Rust-cache setup where it needs one.

That matters most for the checks that matter most. CLAUDE.md states that
kaupapa rules need tests against a real conductor, and that passing tests
confirm code works, not that it is right for this data model. The repo has
those tests — since #86 they are the 16 serial Sweettest cases in
`dnas/ahau/zomes/coordinator/profiles/tests/sweettest.rs`, which still pack
the `rogue` hApp so the `rogue_profiles` zome attacks profile validation from
outside the app — and nothing guarantees they ran before a merge. An
AI-generated change that compiles and passes the DOM tests while quietly
weakening a validation rule is exactly the failure CLAUDE.md warns about,
and exactly what nothing currently catches.

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
  extra approval for unattributed changes). It had **no**
  `required_status_checks` rule — the one thing #37 is named for. It could
  not have one, because no checks existed to require. This change has since
  added it, for `fast` and `holochain`, which is why those two job names are
  now fixed (see "Conforming to #86").
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
  - **`holochain`** (`timeout-minutes: 60`): Nix with Holochain's public
    Cachix substituter, Node from `.nvmrc` **before** `nix develop` (the
    Holonix shell provides no Node and inherits it from `PATH`), `npm ci`,
    a Rust cache, then `nix develop --command npm run test:zomes` and
    `nix develop --command npm run test:sweettest` as separate steps.
- **Deleted** `.github/workflows/sweettest.yml`, the standalone workflow #86
  added. Its job is folded into `ci.yml` as the `holochain` job's second
  step, so the repo has one CI workflow rather than two that each pay for
  Nix and a Rust cache.
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

### Conforming to #86, and why the job keeps its name

#86 ("Replace Tryorama with serial Sweettest coverage", merged as `c49e3b7`)
landed while this change was in flight. It deleted `npm run test:conductor`
and all four Tryorama files, added `npm run test:sweettest`, removed the
Tryorama dependency, and added its own `sweettest.yml` because `ci.yml` was
not yet on `main`. This change is reshaped to match that reality rather than
being re-planned from scratch: the pipeline's structure is unaffected, only
what the second Holochain step invokes.

The `holochain` job **keeps its name**, even though nothing named a conductor
runs in it any more. Ruleset `24758236` already requires the checks `fast`
and `holochain`, and required checks match on the check-run name. Keeping the
name means the ruleset needs no further edit — and every ruleset edit is a
`PUT` that replaces the whole `rules` array, which is the riskiest operation
in this change. A more descriptive job name would cost a ruleset write and
gain nothing a reader of `ci.yml` cannot see.

This also means #86's timings now govern the job. Sweettest is **slower**
than the Tryorama suite it replaced, on every measurement:

| | Tryorama (`holochain`) | Sweettest |
| --- | --- | --- |
| Cold run | 13m45s | 43m40s |
| Warm run | 9m07s | 16m05s |
| Test execution | 449s | 800s |

So `timeout-minutes` goes from 30 to 60. The justification for Sweettest is
dependency risk — Tryorama is no longer an official package in Holochain
0.6 — not speed, and this change records that rather than implying CI got
faster.

### On the kaupapa rules

This change adds no zome, client or component code and touches none of the
four rules directly. It is worth saying plainly anyway, because it is the
mechanism behind two of CLAUDE.md's working norms rather than a neutral
piece of tooling: "tests assert real behaviour, not mocked sync state", and
the requirement that kaupapa rules be tested against a real conductor. The
`holochain` job is what makes those norms checkable by something other than
memory. #36's verification step — a throwaway PR that deliberately breaks a
profile validation rule and must turn the job red at the **Sweettest** step —
is part of the work, not a formality, because a Holochain job that silently
fails to exercise validation would be worse than none.

That verification has been done once, for Tryorama: PR #83 weakened
profile-name validation in wasm builds only, `Test zomes` stayed green on
native compilation, and `Test conductor` failed on
`a profile with invalid fields is refused, even bypassing the app`
([run 38186080248](https://github.com/ahau01/ahau-v2/actions/runs/38186080248)).
It has **not** been done for Sweettest. The 16 cases carry the same
assertions, but "this step goes red when validation weakens" is a property of
the step, not of the assertions, so it needs re-proving against
`test:sweettest`.

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
| `.github/workflows/ci.yml` | new |
| `.github/workflows/sweettest.yml` | deleted — folded into `ci.yml` |
| `.github/dependabot.yml` | new |
| `README.md` | CI section, describing the Sweettest step |
| `CLAUDE.md` | one working norm |
| ruleset `24758236` | `required_status_checks` added via `gh api` (done) |

Depends on `move-prod-build-check-out-of-vitest` (#53, merged as `b6ddafb`)
for `check:app-build`, and on #86 (merged as `c49e3b7`) for
`test:sweettest`. No application, zome or test code changes: the branch is
rebased onto the post-#86 `main` rather than carrying any of its content.

## Flagged, not done

- **Narrowing or removing the owner's ruleset bypass.** A separate decision;
  see "On enforcement and the bypass".
- **Path filters on the `holochain` job.** #34 deferred these as risky — a
  change to `src/profile/client.ts` can break `client.conductor.ts` — and
  there is still no evidence they are needed.
- **A project-owned Cachix cache, or caching the whole Nix store.** Start
  with Holochain's public cache and measure first.
- **Splitting `test:zomes` and `test:sweettest` into separate jobs.** Now
  affordable on the team plan, but `test:sweettest` runs `build:happ`
  itself, so splitting them means rebuilding the wasm or passing artefacts
  between jobs. Revisit if the 16-minute warm job becomes the thing people
  wait on.

### #86's coverage gaps — flagged, explicitly not this change's to fix

Found while reshaping this change against #86. Both are decisions about what
the test suite covers, not about CI shape, so folding them in here would bury
them in a workflow diff:

- **#86 regressed [#54](https://github.com/ahau01/ahau-v2/issues/54).** The
  deleted test `the zome keeps every gender the app offers and refuses one it
  does not` destructured the TypeScript `GENDERS` constant and fed each value
  to the zome, so it caught drift *between* the app's list and the zome's.
  Its replacement, `rust_gender_variants_are_accepted_and_unknown_values_rejected`,
  checks Rust against Rust — both sides of the comparison are now the same
  side. #54 is "Check the gender list both ways between the zome and the
  app"; the deleted test was that mechanism, so #54 is now harder to close,
  not easier.
- **15 client-boundary tests were deleted with no replacement.**
  `validation.conductor.ts`'s 16 tests migrated 1:1 to Sweettest, but
  `client.conductor.ts`'s 13 and `first-launch.conductor.ts`'s 2 did not.
  Seven of those 13 are a `waitUntilReady` failure matrix — conductor still
  starting, token rejected, app installed but disabled, port accepts but
  never answers within `timeoutMs` — which is the surface
  [#41](https://github.com/ahau01/ahau-v2/issues/41) and
  [#42](https://github.com/ahau01/ahau-v2/issues/42) both sit on. Also gone:
  every-field round-trip including personal information, and profile
  persistence across a conductor restart. #86 records these as deferred to a
  future TypeScript suite; no issue tracks that suite yet.
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
