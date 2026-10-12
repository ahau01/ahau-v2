# Design

## Context

See proposal.md — Why. The state this design has to fit:

- `.github/` existed nowhere when this change was planned. Since #86, `main`
  has `.github/workflows/sweettest.yml` and nothing else, so `ci.yml` is
  still new but `sweettest.yml` is now something to consolidate rather than
  greenfield to fill.
- `.nvmrc` pins Node `20.20.2`; `package.json` sets `engines.node: >=20 <21`.
- `package-lock.json` exists, so `npm ci` is available.
- `flake.nix` builds its dev shell from `holonix.devShells.default`
  (`main-0.6`) plus `binaryen`, and its comment states Node comes from
  `.nvmrc`, not from Nix.
- `Cargo.toml` is a workspace over `dnas/*/zomes/*/*` and
  `dnas/*/test/zomes/*`, so `cargo test --workspace` covers
  `rogue_profiles`.
- `npm run test:sweettest` does a lot: `build:happ` (cargo wasm release +
  `hc dna pack` + `hc app pack`), then `hc dna pack` on the test workdir,
  `hc app pack workdir/rogue`, then
  `cargo test -p profiles --features sweettest --test sweettest -- --test-threads=1`.
  The `sweettest` test target is `required-features`-gated in the `profiles`
  crate, so `cargo test --workspace` does not build or run it.
- `npm run test:conductor` no longer exists. #86 deleted it along with all
  four Tryorama files, and added `.github/workflows/sweettest.yml` as a
  standalone workflow because `ci.yml` was not yet on `main`.
- `target/` is **3.1 GB** locally — #34 estimated 1.5 GB. Both debug and
  wasm-release profiles are present.
- `.gitignore` covers `node_modules/`, `dist/`, `dist-app/`, `*.dna`,
  `*.happ`, `.hc*`, `target/`.

None of the project's design rules on merge-sensitive mutations, offline
conflict, or permission revocation bear on this change — it adds no entry,
link or capability grant. What it does is make the tests that *do* cover
those things run without anyone having to remember.

## Goals / Non-Goals

**Goals:**

- A red job on a PR that weakens profile validation, caught at the conductor
  step rather than at review.
- A `fast` job that is genuinely Nix-free, so it tests the README's claim
  rather than assuming it.
- Failures that name their layer. Zome and conductor failures must be
  distinguishable without reading a log.
- A cache whose key is wrong only when the cache is wrong.

**Non-Goals:**

- Minimising wall-clock time. Correct and legible beats fast; the jobs run
  in parallel and that is enough.
- Covering every check in CI. Nix formatting, `openspec validate`, and
  licence checks are not in #34's plan and are not added here.
- Making CI unbypassable. See proposal.md — On enforcement and the bypass.

## Decisions

### 1. One workflow file, two parallel jobs

`fast` and `holochain` are independent jobs in `ci.yml`, not two workflows.
One `concurrency` group then covers both, and the two required check names
come from one file. They run in parallel, so a `fast` failure surfaces in
about a minute without waiting on Nix.

### 2. Cancel superseded runs on PR branches, never on `main`

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

`cancel-in-progress` takes an expression, so one group serves both triggers.
Keying on `github.ref` means each PR branch cancels only itself. A cancelled
run reports as cancelled, which is not success — harmless, because
cancellation only happens when a newer run for the same ref has started.

### 3. `npm ci` in **both** jobs — and its reason has since expired

#36's step list omits `npm ci` from the `holochain` job. Against Tryorama
that job failed: `test:conductor` ran `npm run build` (tsc) and then
Tryorama, and both needed `node_modules`. `test:zomes` is cargo-only and
would pass, so the failure appeared at the second step and looked like a
conductor problem rather than a missing install. That correction was right,
and it is why the job has an `npm ci` step today.

#86 removed the need for it. `test:sweettest` is `build:happ` (cargo plus
two `hc pack` calls) followed by `cargo test`; there is no tsc and no
JavaScript dependency anywhere in it, so the `holochain` job no longer needs
`node_modules` at all. #86's own `sweettest.yml` carries `npm ci` regardless,
inherited from this design.

The step stays, for a different and weaker reason: `npm ci` fails loudly on a
`package-lock.json` that does not match `package.json`, which is worth four
seconds on a job that already costs sixteen minutes. Recorded rather than
quietly dropped, because the next person to read this job will otherwise
reconstruct the old rationale and conclude the step is load-bearing.

Note what did **not** expire: decision 4. `setup-node` is still required,
and more clearly than before — Holonix provides no Node, so without it
`nix develop --command npm run test:sweettest` has no `npm` to invoke at
all, independently of whether anything needs `node_modules`.

### 4. Node is installed before `nix develop`, in the `holochain` job

The Holonix shell provides no Node and inherits it from `PATH`, which
`flake.nix` says in a comment and #34 records as verified locally. So
`actions/setup-node` with `node-version-file: .nvmrc` runs first, and the
`nix develop --command` steps pick that Node up.

### 5. `check:app-build` replaces `build:app` in the `fast` job

Both run a production build. The check is a build plus an assertion, so
running both pays for the build twice and asserts on only one of them. The
`fast` job's steps become `npm ci`, `npm test`, `npm run check:app`,
`npm run check:app-build` — same count as #35 specified, with Vite breakage
still caught, because the build must succeed before the assertion runs.

### 6. Rust cache keyed off `flake.lock`, not off the runner's rustc

This is the subtle one. `Swatinem/rust-cache` is a JavaScript action: it runs
on the runner, outside `nix develop`, and derives its cache key partly from
`rustc -vV`. On `ubuntu-latest` that resolves to the runner's **preinstalled**
stable toolchain, not the Holonix toolchain that compiles the zomes.

The cache still functions, but its key is blind to the compiler that
produced its contents. Bump `flake.lock` so Holonix's Rust changes while the
runner's preinstalled Rust does not, and the job restores a `target/` built
by a different compiler. That surfaces as metadata or link errors, not as a
clean cache miss, and it would be debugged as a code problem.

Mitigation: include a hash of `flake.lock` in the action's `prefix-key`, so
a Holonix bump invalidates the cache by construction. Alternatives
considered:

| Option | Why not |
| --- | --- |
| Accept the default key | The failure mode above, debugged as a compiler bug |
| Run `rust-cache` inside `nix develop` | Not possible; a JS action cannot be wrapped in a shell |
| Hand-rolled `actions/cache` on `~/.cargo` + `target/` keyed on `flake.lock` + `Cargo.lock` | Workable, and the fallback if `rust-cache` fights the Nix toolchain, but it gives up `rust-cache`'s pruning — see decision 7 |

### 7. Disk space is a named risk, not an assumption

`target/` is 3.1 GB locally, and the Nix store for Holonix is large on top of
`~/.cargo` and the wasm toolchain. `rust-cache` prunes intermediate
artefacts before saving, so the *cache* is far smaller than the directory —
but the directory still has to exist on the runner. If the job hits ENOSPC
it will do so mid-build with an opaque error, so the task list calls for
checking free space on the first run rather than waiting to be surprised.

### 8. Flakes must be enabled explicitly

`nix develop` needs the `nix-command` and `flakes` experimental features.
`cachix/install-nix-action` is configured with:

```yaml
extra_nix_config: |
  experimental-features = nix-command flakes
  extra-substituters = https://holochain-ci.cachix.org
  extra-trusted-public-keys = holochain-ci.cachix.org-1:5IUSkZc0aoRS53rfkvH9Kid40NpyjwCMCzwRTXy+QN8=
```

Holochain's cache is public, so no secret and no Cachix auth step. #36 names
the substituter and key but not the feature flags; without them `nix develop`
fails immediately.

### 9. Two steps, one job, for zomes then Sweettest

Kept from #34, but for a different reason now that the team plan makes
minutes less pressing: `test:sweettest` runs `build:happ`, so the wasm
artefacts and the Rust cache the first step warmed are already on disk.
Splitting the jobs would mean rebuilding them or passing them between jobs.
Separate *steps* still give separate pass/fail lines, which satisfies #36's
"zome and conductor failures show up as separate steps" — the step names
change, the property does not.

The ordering matters more than it did. `test:zomes` is `cargo test
--workspace`, which the `required-features` gate keeps away from the
Sweettest target, so it tests zome logic natively with no conductor. Running
it first means a plain Rust logic error fails before 16 conductor startups
are paid for.

### 9a. The `holochain` job keeps its name

Ruleset `24758236` requires the checks `fast` and `holochain`, and required
checks match on the check-run name — a job's `name:`, or its id when absent.
Renaming the job to something that describes Sweettest would require editing
the ruleset, and every ruleset edit is a `PUT` that replaces the whole
`rules` array. That is the riskiest operation in this change, already
performed once; a second one buys a better job name and risks silently
dropping `pull_request`, `required_linear_history` and `non_fast_forward`.

So the name is now an interface, not a description. `ci.yml`'s step names
(`Test zomes`, `Run Sweettest serially`) carry the description instead, which
is where someone reading a failed run actually looks.

### 10. Required status checks are added last, and by GET-modify-PUT

Two ordering traps, both of which make PRs unmergeable rather than noisy:

- A required check whose name is never reported leaves every PR parked on
  *"Expected — waiting for status to be reported"*, indefinitely. Required
  checks match the **check-run name**, which for a job is its `name:` or,
  absent one, its job id. So the rule is added only after a real PR has
  reported both names green, and the names are taken from an actual run
  rather than from this document.
- `gh api --method PUT .../rulesets/24758236` **replaces** the whole `rules`
  array. A hand-assembled body silently drops `pull_request`,
  `required_linear_history`, `non_fast_forward` and the rest — quietly
  undoing the protection that already exists. So: GET the ruleset, add one
  element to `rules`, PUT the result back, then re-read it and diff.

### 11. Least-privilege token

`permissions: contents: read` at workflow level. Neither job writes to the
repo, and the default token is broader than that.

This is a judgement call slightly beyond #35's literal text, which names
SHA-pinning and Dependabot under "Supply chain" without mentioning
permissions. It is recorded here rather than slipped into the diff so a
reviewer can strike it.

### 12. Action SHAs are resolved at implementation time

Every third-party action is pinned to a full commit SHA with a `# vX`
comment, per #35. No SHAs appear in this design or in tasks.md on purpose: a
SHA written from memory is worse than no pin, because it looks verified. They
are looked up against each action's repository when the workflow is written.

## Risks / Trade-offs

- **Cold Nix download and the Sweettest run together dominate the first
  run** → one `holochain` job with Holochain's Cachix substituter, and a
  **60**-minute timeout. 30 was the original figure, set before any
  measurement; #86's cold Sweettest run took 43m40s, so 30 would have timed
  out. Raised on evidence, as the original design said it would be.
- **Conforming to #86 made CI slower, and the change should say so** →
  Sweettest measures 43m40s cold and 16m05s warm, against Tryorama's 13m45s
  and 9m07s; test execution alone is 800s against 449s. The justification
  for Sweettest is that Tryorama is no longer an official package in
  Holochain 0.6, so it is dependency risk being retired, not time. Recording
  the regression is deliberate: an archived change claiming CI got faster
  would mislead whoever next tries to speed it up.
- **`test:zomes` may no longer be cheap** → #86 added `holochain` with
  `features = ["test_utils"]` to the `profiles` crate's `dev-dependencies`.
  Cargo resolves dev-dependencies per package, so `cargo test --workspace`
  may now build that dependency tree even though the `sweettest` test target
  is `required-features`-gated out. Under Tryorama, `Test zomes` ran in 12s
  warm. #86's workflow never ran `test:zomes`, so there is no CI evidence
  either way — task 3.4 measures it. Inside one job with a warm Rust cache
  the compile is paid once regardless, so this affects whether `test:zomes`
  could ever move to the `fast` job, not the `holochain` job's total.
- **`rust-cache` and the Nix toolchain disagree** → decision 6; the
  hand-rolled `actions/cache` fallback is identified in advance so it is not
  designed under pressure.
- **Runner disk space** → decision 7.
- **The Sweettest cases are flaky on a shared runner** → they already run
  `--test-threads=1`, which is also why the suite takes 800s: 16 conductor
  startups, serially. If flakiness appears, it is a finding about the tests,
  not a reason to retry the job automatically; no retry wrapper is added,
  because an auto-retried validation test would defeat the purpose of
  running it at all.
- **Required checks are added before the names are proven** → decision 10
  sequences this last, and the owner's `exempt` bypass is the escape hatch if
  it still goes wrong.
- **CI green becomes mistaken for kaupapa sign-off** → the CLAUDE.md norm is
  worded to say CI must run the conductor tests and not merge red, which is
  a floor. CLAUDE.md already states that passing tests confirm code works,
  not that it is right for this data model, and that wording is not softened.

## Migration Plan

Steps 1–4 were completed against Tryorama before #86 landed: `ci.yml` and
`dependabot.yml` were written, both jobs went green, PR #83's
deliberate-breakage probe turned `Test conductor` red, and
`required_status_checks` was added to ruleset `24758236`. What remains is the
conformance pass:

1. Rebase `chore/35-ci-pipeline` onto the post-#86 `main` (`c49e3b7`).
   Conflicts are expected in `README.md`, which both #86 and this change
   edit.
2. Point the `holochain` job's second step at `test:sweettest`, raise its
   timeout to 60, and delete `.github/workflows/sweettest.yml`.
3. Re-prove the probe against the Sweettest step, since what #83 established
   was a property of `Test conductor`.
4. Merge. The required check names are unchanged, so the ruleset is not
   touched again — and merging is what finally puts `ci.yml` on `main`,
   which is what lets any other PR report those checks at all.

Rollback: delete the `required_status_checks` rule to return CI to advisory,
or revert the PR. Note that the ordering trap is live until step 4 — the rule
requires `fast` and `holochain` while `main` has neither, so every PR not
carrying `ci.yml` is unmergeable without the owner's bypass. That is the
cost of having added the rule before the workflow reached the default
branch, which this design's decision 10 guarded against by name but not by
this route.

## Open Questions

Resolved since this design was written:

- ~~Whether the cold `holochain` run fits in 30 minutes.~~ **No.** Under
  Tryorama it did, at 13m45s. Under Sweettest the cold run is 43m40s, so the
  timeout is 60. Only the number moved, as predicted.

Still open, and neither changes the approach or the task breakdown:

- Whether the `fast` job needs `actions/setup-node`'s `cache: npm`. `fast`
  runs in 1m04s–1m14s without it, well inside its 10-minute budget, so this
  is now a question of taste rather than headroom.
- Whether `test:zomes` is still cheap after #86's `dev-dependencies` change,
  and so whether it could move to the `fast` job and give a Rust signal
  without Nix. Task 3.4 takes the measurement; acting on it would be a
  separate change.
