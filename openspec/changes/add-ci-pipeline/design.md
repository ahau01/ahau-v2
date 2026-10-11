# Design

## Context

See proposal.md — Why. The state this design has to fit:

- No `.github/` directory exists. This is greenfield, not an amendment.
- `.nvmrc` pins Node `20.20.2`; `package.json` sets `engines.node: >=20 <21`.
- `package-lock.json` exists, so `npm ci` is available.
- `flake.nix` builds its dev shell from `holonix.devShells.default`
  (`main-0.6`) plus `binaryen`, and its comment states Node comes from
  `.nvmrc`, not from Nix.
- `Cargo.toml` is a workspace over `dnas/*/zomes/*/*` and
  `dnas/*/test/zomes/*`, so `cargo test --workspace` covers
  `rogue_profiles`.
- `npm run test:conductor` does a lot: `build:happ` (cargo wasm release +
  `hc dna pack` + `hc app pack`), then `hc dna pack` on the test workdir,
  `hc app pack workdir/rogue`, `rm -rf dist`, `npm run build` (tsc), then
  `node --test --test-concurrency=1` over `dist/**/*.conductor.js`.
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

### 3. `npm ci` in **both** jobs

#36's step list omits `npm ci` from the `holochain` job. As written that job
fails: `test:conductor` runs `npm run build` (tsc) and then Tryorama, and
both need `node_modules`. `test:zomes` is cargo-only and would pass, so the
failure appears at the second step and looks like a conductor problem rather
than a missing install. This is a correction to the ticket, not a scope
addition.

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

### 9. Two steps, one job, for zomes then conductor

Kept from #34, but for a different reason now that the team plan makes
minutes less pressing: `test:conductor` runs `build:happ`, so the wasm
artefacts the first step warmed are already on disk. Splitting the jobs would
mean rebuilding them or passing them between jobs. Separate *steps* still
give separate pass/fail lines, which satisfies #36's "zome and conductor
failures show up as separate steps".

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

- **Cold Nix download dominates the first run** → one `holochain` job with
  Holochain's Cachix substituter, and a 30-minute timeout. If the cold run
  does not fit, the timeout is raised on evidence rather than the design
  changing.
- **`rust-cache` and the Nix toolchain disagree** → decision 6; the
  hand-rolled `actions/cache` fallback is identified in advance so it is not
  designed under pressure.
- **Runner disk space** → decision 7.
- **The conductor tests are flaky on a shared runner** → they already run
  `--test-concurrency=1`. If flakiness appears, it is a finding about the
  tests, not a reason to retry the job automatically; no retry wrapper is
  added, because an auto-retried conductor test would defeat the purpose of
  running it at all.
- **Required checks are added before the names are proven** → decision 10
  sequences this last, and the owner's `exempt` bypass is the escape hatch if
  it still goes wrong.
- **CI green becomes mistaken for kaupapa sign-off** → the CLAUDE.md norm is
  worded to say CI must run the conductor tests and not merge red, which is
  a floor. CLAUDE.md already states that passing tests confirm code works,
  not that it is right for this data model, and that wording is not softened.

## Migration Plan

1. `ci.yml` and `dependabot.yml` land in a PR. CI is advisory on that PR,
   because no rule requires it yet.
2. Both jobs are confirmed green on that PR.
3. #36's deliberate-breakage check runs on a throwaway PR, and the failed run
   is linked on #36.
4. Only then is `required_status_checks` added to ruleset `24758236`.

Rollback: delete the `required_status_checks` rule to return CI to advisory,
or revert the PR to remove it entirely. Nothing in the repo depends on CI
existing.

## Open Questions

Neither of these changes the approach or the task breakdown:

- Whether the cold `holochain` run fits in 30 minutes. Measured on the first
  run; only the timeout number moves.
- Whether the `fast` job needs `actions/setup-node`'s `cache: npm`. Measured
  once it has run; flagged in proposal.md.
