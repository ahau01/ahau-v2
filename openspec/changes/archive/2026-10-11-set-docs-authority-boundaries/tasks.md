# Tasks

Order follows `design.md` — Decisions: entry-point names first, then the
facts, then the navigation that points at them.

## 1. One Claude entry point

- [x] 1.1 Run `openspec config set delivery skills`. Verify
  `openspec config get delivery` prints `skills`.
- [x] 1.2 Before removing the commands, compare all twelve
  `.claude/commands/opsx/*.md` workflows with their
  `.claude/skills/openspec-*/SKILL.md` counterparts. Then run
  `openspec update --force` and inspect changes to both skill trees. Verify
  generated invocation examples point to available skill names. Review the
  content differences, especially archive and explore; confirm the skill
  versions retain the intended safeguards and behavior. Do not assume the
  diff is only a rename. If a material behavior difference is unexplained
  or a safeguard is missing, stop and revise the entry-point decision before
  deleting commands.
- [x] 1.3 If the first update leaves the tracked
  `.claude/commands/opsx/` files behind, remove them with
  `git rm -r .claude/commands/opsx`. Run `openspec update --force` once more.
  Verify `test ! -e .claude/commands/opsx` succeeds after that update,
  proving the selected setting does not regenerate the command tree.

## 2. CLAUDE.md: the status conflict and the spec boundary (#58)

- [x] 2.1 Replace the two false intro statements: "The spec is a capability
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
- [x] 2.2 Rewrite the "High-risk areas" preamble as that section asks now
  that zome code exists: these are risks to design against *and* code to
  audit, naming the profiles zome's validation and the dev signing grants
  (#42) as the live surfaces. Verify the four bullets that follow and the
  whole "Four things not to do" section are untouched —
  `git diff CLAUDE.md` shows changes only in the intro paragraph, this
  preamble, and the "Agent skills" section from task 2.3.
- [x] 2.3 In "Agent skills", rename the workflow references
  (`/opsx:explore` → `/openspec-explore`, `/opsx:propose` →
  `/openspec-propose`, `/opsx:apply` → `/openspec-apply-change`,
  `/opsx:verify` → `/openspec-verify-change`, `/opsx:archive` →
  `/openspec-archive-change`). Describe `openspec/config.yaml` as carrying
  the compact context required by OpenSpec artifact instructions, not as a
  full mirror to synchronize with every edit to this file. Replace the
  prohibition list — whose
  named skills `wayfinder`, `to-spec`, `to-tickets`, `triage` and
  `implement` are no longer installed — with the rule itself plus the
  skills actually in use. Verify `git grep -n "opsx\|wayfinder\|to-tickets" -- CLAUDE.md`
  returns nothing.
- [x] 2.4 Re-read `openspec/config.yaml`'s `context` block against the
  edited `CLAUDE.md` and edit it only where it now disagrees. Verify
  `openspec validate --all` passes and that no statement in the block
  contradicts `CLAUDE.md`; keep the config context as a compact subset, not
  a second full narrative.

## 3. docs/agents/: the authority boundaries and the renames

- [x] 3.1 Extend `docs/agents/openspec.md`'s existing "Where things live"
  list with the homes it omits — `CLAUDE.md` and `CONTEXT.md`,
  `reference/leg1-contract/`, `docs/`, `README.md` — each stated with what
  it is *not* (`docs/` is supporting evidence and historical reasoning, not
  authority for current requirements or architecture). Verify the section
  names every home listed in `proposal.md`
  — What Changes, and that no new file was created to hold them.
  Revise its `openspec/config.yaml` description to say that the CLI injects a
  compact constraint subset and that CLAUDE.md remains the full source; do
  not instruct authors to keep two full narratives synchronized.
- [x] 3.2 In the same file, rename the `/opsx:*` references to the skill
  names and add one sentence recording that this repo's entry points are
  the `openspec-*` skills, that `delivery` is a per-machine openspec
  setting, and that a regenerated `.claude/commands/opsx/` can simply be
  deleted. Verify no obsolete `/opsx:` invocation remains in the guide and
  the file gained no checklist or table of things to keep in step.
- [x] 3.3 Rename the `/opsx:*` references in `docs/agents/domain.md`,
  `docs/agents/triage-labels.md` and the two comments in
  `.claude/hooks/openspec-path.sh`, leaving the Wayfinder history in
  `docs/agents/triage-labels.md` and `docs/agents/issue-tracker.md` intact
  — it explains why `wayfinder:*` labels still sit on closed issues. Verify
  no obsolete `/opsx:` invocations remain in hand-written current guidance
  (`README.md`, `CLAUDE.md`, `docs/agents/`, and the hook); generated skill
  descriptions may retain `opsx` as an activation phrase. Also verify
  `bash .claude/hooks/openspec-path.sh` still exits 0.

## 4. docs/plans/group-permissions.md: stop claiming to be the spec

- [x] 4.1 Delete the "Functional spec for the first Holochain slice"
  blockquote, the "Delivery Milestones" table and its
  `<!-- /plan turns each into a plan -->` template comment; retitle the
  status footer so the file reads as the live problem statement, evidence
  and open questions for work not yet started, pointing at
  `/openspec-propose` as what turns it into a change. Keep Problem,
  Evidence, Users, Hypothesis, Success Metrics, Scope, Open Questions and
  Risks as draft input, and add a clear statement that none are approved
  requirements until adopted by an OpenSpec change. Verify
  `git grep -n "Functional spec\|Delivery Milestones\|/plan turns" -- docs/plans/group-permissions.md`
  returns nothing, the file is still at the same path, and the Open
  Questions list is unchanged — the product decisions stay open — and the
  non-authoritative status is explicit.

## 5. Navigation: README.md and docs/INDEX.md

- [x] 5.1 In `README.md`'s "Where to start reading", replace the dead
  `[docs/adr/](docs/adr/)` line with `openspec/specs/` (what the system
  does now) and `openspec/changes/archive/` (the decision record that
  replaced ADRs). Verify `test ! -e docs/adr` and that
  `git grep -n "docs/adr" -- README.md` returns nothing.
- [x] 5.2 Add an `openspec/` row to `README.md`'s "What's in this repo"
  table describing it as where specs, changes and decisions live. Verify
  `git grep -n "openspec" -- README.md` now matches, where before this
  change it matched nothing.
- [x] 5.3 Update `README.md`'s Status section: both landed slices (first
  launch #14, and landing and shell with its three specs), group
  permissions as next and not started, and the `docs/plans/group-permissions.md`
  link described as the problem statement rather than "plan". Verify the
  section names no slice that has not landed as done, and its claims match
  `openspec/specs/` and `openspec/changes/archive/`.
- [x] 5.4 Complete `docs/INDEX.md` at directory level: add
  `capability-inventory.md`, `agents/openspec.md`, `agents/triage-labels.md`,
  the two unlisted `research/` files
  (`holochain-group-permissions.md`, `2026-10-04-rust-holochain-learning-tickets.md`),
  `old-app-capture/` and `parity/`; add one row pointing at `openspec/` and
  stating `docs/` is not authoritative for current specs or decisions; and correct the `plans/` row
  so it no longer calls the file a functional spec. Leave
  `history/knowledge-base/` and `history/leg1/` summarised as subtrees and
  leave the Wayfinder provenance notes alone. Verify every top-level
  `docs/` entry appears:
  `for e in docs/*; do grep -q "$(basename $e)" docs/INDEX.md || echo "MISSING: $e"; done`
  prints nothing.

## 6. Verify the whole diff

- [x] 6.1 Resolve every relative link in the edited living documents rather
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
- [x] 6.2 Review all changed, staged, and untracked paths (including
  `git status --short --untracked-files=all`). Confirm the diff contains no
  file under `docs/history/`, `docs/old-app-capture/`, `docs/parity/`,
  `docs/research/`, `reference/leg1-contract/` or
  `openspec/changes/archive/`, and no file under `src/`, `dnas/` or
  `workdir/`.
- [x] 6.3 Confirm the OpenSpec change validates with
  `openspec validate --all`, and the edited relative links and hook check in
  tasks 6.1 and 3.3 pass. Runtime and conductor tests are out of scope for
  this documentation-only change.
- [x] 6.4 Read `README.md`, `CLAUDE.md`, `docs/INDEX.md` and
  `docs/agents/openspec.md` in sequence as a newcomer would and confirm
  they give one answer each to: where is the current spec, where are current
  decisions recorded, where does historical rationale live, what has been
  built, and which skill do I invoke. Any disagreement between them is a
  defect in this change.

## Workflow follow-up

- #58 asks that a person read this diff closely, because it edits the file
  that carries the kaupapa rules. Get that review before merge, not after.
- Open the PR saying `Closes #58`.
- Run `/openspec-verify-change`, then `/openspec-archive-change` in the same
  PR. Note that these are the renamed skills from task 1 — the `/opsx:*`
  form will not exist by then.
