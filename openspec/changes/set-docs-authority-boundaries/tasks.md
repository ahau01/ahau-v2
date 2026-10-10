# Tasks

Order follows `design.md` — Decisions: entry-point names first, then the
facts, then the navigation that points at them.

## 1. One Claude entry point

- [ ] 1.1 Run `openspec config set delivery skills`. Verify
  `openspec config get delivery` prints `skills`.
- [ ] 1.2 Run `openspec update --force`, then read the diff of
  `.claude/skills/*/SKILL.md` and `.agents/skills/*/SKILL.md`. Verify
  `git grep -l "/opsx:" -- .claude/skills .agents` returns nothing (the
  generated bodies now cite their own skill names), and that the diff
  contains only invocation names — no rule or step wording — since
  `@fission-ai/openspec` stays pinned at 1.14.1.
- [ ] 1.3 `git rm -r .claude/commands/opsx`, then run
  `openspec update --force` once more. Verify `test ! -d .claude/commands`
  succeeds *after* that second update, proving the setting — not the
  deletion — is what keeps it gone.

## 2. CLAUDE.md: the status conflict and the spec boundary (#58)

- [ ] 2.1 Replace the two false intro statements: "The spec is a capability
  inventory (#13)" becomes the real boundary (`openspec/specs/` is the
  spec; `docs/capability-inventory.md` is a checklist of the old app), and
  "No Holochain code exists yet; the first slice is group permissions"
  becomes what is actually built — a `profiles` zome
  (`dnas/ahau/zomes/{integrity,coordinator}/profiles/`) with conductor
  tests, first launch as the first slice (#14), landing and shell as the
  second (archived 2026-10-11, specs `launch`, `navigation`,
  `own-profile`), group permissions next and not started. Verify
  `git grep -n "No Holochain code exists\|The spec is a capability" -- CLAUDE.md`
  returns nothing.
- [ ] 2.2 Rewrite the "High-risk areas" preamble as that section asks now
  that zome code exists: these are risks to design against *and* code to
  audit, naming the profiles zome's validation and the dev signing grants
  (#42) as the live surfaces. Verify the four bullets that follow and the
  whole "Four things not to do" section are untouched —
  `git diff CLAUDE.md` shows changes only in the intro paragraph, this
  preamble, and the "Agent skills" section from task 2.3.
- [ ] 2.3 In "Agent skills", rename the workflow references
  (`/opsx:explore` → `/openspec-explore`, `/opsx:propose` →
  `/openspec-propose`, `/opsx:apply` → `/openspec-apply-change`,
  `/opsx:verify` → `/openspec-verify-change`, `/opsx:archive` →
  `/openspec-archive-change`), and replace the prohibition list — whose
  named skills `wayfinder`, `to-spec`, `to-tickets`, `triage` and
  `implement` are no longer installed — with the rule itself plus the
  skills actually in use. Verify `git grep -n "opsx\|wayfinder\|to-tickets" -- CLAUDE.md`
  returns nothing.
- [ ] 2.4 Re-read `openspec/config.yaml`'s `context` block against the
  edited `CLAUDE.md` and edit it only where it now disagrees. Verify
  `openspec validate --all` passes and that no statement in the block
  contradicts `CLAUDE.md` — the two already name `CLAUDE.md` as the source
  of truth, so no third copy and no checklist is added.

## 3. docs/agents/: the authority boundaries and the renames

- [ ] 3.1 Extend `docs/agents/openspec.md`'s existing "Where things live"
  list with the homes it omits — `CLAUDE.md` and `CONTEXT.md`,
  `reference/leg1-contract/`, `docs/`, `README.md` — each stated with what
  it is *not* (`docs/` holds evidence, research and history: no specs, no
  decisions). Verify the section names every home listed in `proposal.md`
  — What Changes, and that no new file was created to hold them.
- [ ] 3.2 In the same file, rename the `/opsx:*` references to the skill
  names and add one sentence recording that this repo's entry points are
  the `openspec-*` skills, that `delivery` is a per-machine openspec
  setting, and that a regenerated `.claude/commands/opsx/` can simply be
  deleted. Verify `git grep -n "opsx" -- docs/agents/openspec.md` returns
  nothing and the file gained no checklist or table of things to keep in
  step.
- [ ] 3.3 Rename the `/opsx:*` references in `docs/agents/domain.md`,
  `docs/agents/triage-labels.md` and the two comments in
  `.claude/hooks/openspec-path.sh`, leaving the Wayfinder history in
  `docs/agents/triage-labels.md` and `docs/agents/issue-tracker.md` intact
  — it explains why `wayfinder:*` labels still sit on closed issues. Verify
  `git grep -rn "opsx" -- . ':!openspec/changes/archive' ':!docs/history'`
  returns nothing, and `bash .claude/hooks/openspec-path.sh` still exits 0.

## 4. docs/plans/group-permissions.md: stop claiming to be the spec

- [ ] 4.1 Delete the "Functional spec for the first Holochain slice"
  blockquote, the "Delivery Milestones" table and its
  `<!-- /plan turns each into a plan -->` template comment; retitle the
  status footer so the file reads as the live problem statement, evidence
  and open questions for work not yet started, pointing at
  `/openspec-propose` as what turns it into a change. Keep Problem,
  Evidence, Users, Hypothesis, Success Metrics, Scope, Open Questions and
  Risks as written. Verify
  `git grep -n "Functional spec\|Delivery Milestones\|/plan turns" -- docs/plans/group-permissions.md`
  returns nothing, the file is still at the same path, and the Open
  Questions list is unchanged — the product decisions stay open.

## 5. Navigation: README.md and docs/INDEX.md

- [ ] 5.1 In `README.md`'s "Where to start reading", replace the dead
  `[docs/adr/](docs/adr/)` line with `openspec/specs/` (what the system
  does now) and `openspec/changes/archive/` (the decision record that
  replaced ADRs). Verify `test ! -e docs/adr` and that
  `git grep -n "docs/adr" -- README.md` returns nothing.
- [ ] 5.2 Add an `openspec/` row to `README.md`'s "What's in this repo"
  table describing it as where specs, changes and decisions live. Verify
  `git grep -n "openspec" -- README.md` now matches, where before this
  change it matched nothing.
- [ ] 5.3 Update `README.md`'s Status section: both landed slices (first
  launch #14, and landing and shell with its three specs), group
  permissions as next and not started, and the `docs/plans/group-permissions.md`
  link described as the problem statement rather than "plan". Verify the
  section names no slice that has not landed as done, and its claims match
  `openspec/specs/` and `openspec/changes/archive/`.
- [ ] 5.4 Complete `docs/INDEX.md` at directory level: add
  `capability-inventory.md`, `agents/openspec.md`, `agents/triage-labels.md`,
  the two unlisted `research/` files
  (`holochain-group-permissions.md`, `2026-10-04-rust-holochain-learning-tickets.md`),
  `old-app-capture/` and `parity/`; add one row pointing at `openspec/` and
  stating `docs/` holds no specs or decisions; and correct the `plans/` row
  so it no longer calls the file a functional spec. Leave
  `history/knowledge-base/` and `history/leg1/` summarised as subtrees and
  leave the Wayfinder provenance notes alone. Verify every top-level
  `docs/` entry appears:
  `for e in docs/*; do grep -q "$(basename $e)" docs/INDEX.md || echo "MISSING: $e"; done`
  prints nothing.

## 6. Verify the whole diff

- [ ] 6.1 Resolve every relative link in the edited living documents rather
  than grepping for a token — the check the previous change's `ADR-000`
  greps could not make. Run, and expect no output:
  ```bash
  for f in README.md CLAUDE.md docs/INDEX.md docs/agents/*.md docs/plans/group-permissions.md; do
    grep -o '](\([^)][^)]*\)' "$f" | sed 's/](//' | while read -r l; do
      case "$l" in http*|'#'*|mailto:*) continue ;; esac
      t="$(dirname "$f")/${l%%#*}"
      [ -e "$t" ] || echo "DEAD: $f -> $l"
    done
  done
  ```
- [ ] 6.2 Confirm the evidence is untouched: `git diff --stat main` lists no
  file under `docs/history/`, `docs/old-app-capture/`, `docs/parity/`,
  `docs/research/`, `reference/leg1-contract/` or
  `openspec/changes/archive/`, and no file under `src/`, `dnas/` or
  `workdir/`.
- [ ] 6.3 Confirm nothing in the diff affects the build: `npm test` passes,
  and `openspec validate --all` passes.
- [ ] 6.4 Read `README.md`, `CLAUDE.md`, `docs/INDEX.md` and
  `docs/agents/openspec.md` in sequence as a newcomer would and confirm
  they give one answer each to: where is the spec, where are decisions
  recorded, what has been built, which skill do I invoke. Any disagreement
  between two of them is a defect in this change.

## Workflow follow-up

- #58 asks that a person read this diff closely, because it edits the file
  that carries the kaupapa rules. Get that review before merge, not after.
- Open the PR saying `Closes #58`.
- Run `/openspec-verify-change`, then `/openspec-archive-change` in the same
  PR. Note that these are the renamed skills from task 1 — the `/opsx:*`
  form will not exist by then.
