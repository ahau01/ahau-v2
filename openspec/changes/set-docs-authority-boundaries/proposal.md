# Proposal

Comes from [#58](https://github.com/ahau01/ahau-v2/issues/58) (`CLAUDE.md:
"No Holochain code exists yet" is out of date), and finishes the navigation
work that `2026-10-11-retire-adrs-for-openspec`
started.

This is a documentation and process change only. It touches no relationship
or identity data, no sync, and no access control, so none of the four
kaupapa rules apply to the diff. One wording caution: "authority" below
means *which document is believed* when two disagree. It says nothing about
where data lives — there is still no primary store and no central node.

## Why

Retiring ADRs made OpenSpec the only place a lasting decision is recorded,
but the docs around it never caught up, so the repo now answers two basic
questions wrongly:

- **"Where is the spec?"** `openspec/specs/` holds the live specs, yet
  `docs/plans/group-permissions.md` opens by calling itself "Functional spec
  for the first Holochain slice", `docs/INDEX.md` repeats that claim, and
  `CLAUDE.md` says "The spec is a capability inventory (#13)" — while
  `docs/capability-inventory.md` itself says it "is not a spec to copy
  screen by screen". Three documents, three different answers, none of them
  `openspec/specs/`.
- **"What has been built?"** `CLAUDE.md` twice states "No Holochain code
  exists yet" and that "the first slice is group permissions". Both are
  false: `dnas/ahau/zomes/{integrity,coordinator}/profiles/` exist with
  conductor tests, the first slice was profiles and first launch (#14), and
  a second slice (landing and shell) was archived on 2026-10-11 with three
  specs merged into `openspec/specs/`. `README.md`'s Status section knows
  about the first slice but not the second.

Navigation makes this harder to self-correct. `README.md`'s only pointer to
the decision system is `[docs/adr/](docs/adr/)` — a directory deleted by the
previous change, whose `grep "ADR-000"` verification could not catch a bare
directory link — and `README.md` does not mention OpenSpec anywhere, in
prose or in its repo table. A newcomer or agent reading `README.md` top to
bottom never learns the spec system exists.

Separately, Claude has two generated entry-point sets:
`.claude/commands/opsx/` (12 `/opsx:*` commands) and
`.claude/skills/openspec-*/` (12 named skills). They are not text-only
duplicates: direct comparison shows workflow-content differences in at least
the archive and explore instructions. `.agents/skills/` is a third,
deliberate Codex-specific set, committed in `086d6f2`.

## What Changes

**Authority boundaries, written once.** Extend the existing "Where things
live" list in `docs/agents/openspec.md` — no new file — so each home is
stated with what it is *not*:

- `openspec/specs/` — what the system does now. The only live spec.
- `openspec/changes/` — scope and design in flight; `archive/` is the
  decision record that replaced `docs/adr/`.
- `CLAUDE.md` — full kaupapa rules and working norms, source of truth;
  `openspec/config.yaml` carries only the compact subset the CLI injects into
  artifact instructions.
- `CONTEXT.md` — vocabulary.
- GitHub issues — backlog and intake.
- `reference/leg1-contract/` — frozen reference checklist.
- `docs/` — supporting evidence, research, and historical reasoning. It is
  not authoritative for current product requirements or architecture. Older
  decision records such as `contract-decisions.md` remain useful rationale;
  any principle still governing current behavior must also be stated in its
  current authoritative home.
- `README.md` — orientation and how to run it.

**Stop `docs/plans/group-permissions.md` claiming to be the spec.** Remove
the "Functional spec" blockquote and the "Delivery Milestones" table with
its leftover `<!-- /plan turns each into a plan -->` instruction. Keep its
Problem, Evidence, Users, Hypothesis, Success Metrics, Scope, Open Questions,
and Risks as draft input for a future `/opsx:propose`; make clear that none of
these notes are approved requirements until adopted by an OpenSpec change.
The file stays at its current path: twelve references in living research
docs point at it, and moving it buys nothing this change needs.

**Resolve the project-status conflict (#58).** Correct both "No Holochain
code exists yet" statements in `CLAUDE.md`, replace "The spec is a
capability inventory" with the real boundary, and revisit the High-risk
areas preamble as that section itself asks now that zome code exists. Check
`openspec/config.yaml`'s context block still agrees afterwards. Per #58, a
person reads this diff closely before merge.

**Fix README navigation.** Replace the dead `docs/adr/` link with
`openspec/specs/` and `openspec/changes/archive/`; add an `openspec/` row to
the repo table; bring Status up to date with both landed slices and with
group permissions as next-but-not-started.

**Complete `docs/INDEX.md` at directory level.** Add the living docs and
directories it omits — `capability-inventory.md`, `agents/openspec.md`,
`agents/triage-labels.md`, the two unlisted `research/` files,
`old-app-capture/` and `parity/` — plus one row pointing at `openspec/` and
saying `docs/` is not authoritative for current specs or decisions. Subtrees it already summarises
as subtrees (`history/knowledge-base/`, `history/leg1/`) stay summarised:
this is an index of directories and living documents, not a file registry.

**Trim leftover Wayfinder and Matt Pocock references, by one rule:**
Wayfinder *history* stays (it explains why `wayfinder:*` labels still sit on
closed issues, and the doc migration really was tracked that way); Wayfinder
and Pocock *instructions naming tooling that no longer exists* go. In
practice that means `CLAUDE.md`'s prohibition list — `wayfinder`, `to-spec`,
`to-tickets`, `triage`, `implement` are not in the installed skill set any
more — becomes a statement of the rule plus the skills actually in use.
`docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`,
`docs/agents/openspec.md` and `docs/INDEX.md` keep their Wayfinder history.

**One Claude entry point: the `openspec-*` skills.** The duplication comes
from `openspec config`'s machine-global `delivery` setting, currently
`both`. Set it to `skills` and regenerate the skills; remove the tracked
`.claude/commands/opsx/` files if the update leaves them behind, then run
the update again to confirm they are not regenerated. Skills were chosen
because their descriptions can also activate them without an explicit slash
command, which suits a repo
where `ready-for-agent` issues are meant to be picked up unaided. However,
the generated skill and command bodies differ in workflow content, not just
names. The person applying this change must review those differences and
confirm that the skill versions retain the intended safeguards and behavior;
if they do not, stop and revise this decision rather than treating the diff
as a mechanical rename. Hand-written `/opsx:*` references become skill names
(`/opsx:propose` → `/openspec-propose`, `/opsx:apply` →
`/openspec-apply``-change`, and so on).` .agents/skills/` is already
Codex-specific and remains in place.

The `delivery` setting is per-machine, not pinned by this repository. A
contributor whose setting remains `both` can regenerate the command tree.
This change accepts that limitation and documents the canonical entry point;
it does not claim to enforce the setting across machines.

**Keep only the compact OpenSpec context needed by the CLI.** The OpenSpec
CLI injects `config.yaml`'s `context` string into artifact instructions, so
the field must carry the key constraints rather than just a path pointer.
`CLAUDE.md` remains the full human-readable source; the config is a short
agent-facing subset, not a second narrative. Update that subset only when
OpenSpec artifact work needs a changed constraint; remove the blanket
instruction to keep both documents fully synchronized. Add no sync checklist
and do not expand the duplicated text.

## Capabilities

No spec-level behaviour changes. The three live specs (`launch`,
`navigation`, `own-profile`) describe what the running app does; nothing
here changes a requirement, and inventing one to satisfy validation would be
exactly the documentation bureaucracy this change removes.
`.openspec.yaml` sets `skip_specs: true`, as
`2026-10-11-retire-adrs-for-openspec` did for the same reason.

### New Capabilities
(none)

### Modified Capabilities
(none — see above)

## Impact

Documentation and agent configuration only. No source, zome, test or build
file changes.

Edited: `README.md`, `CLAUDE.md`, `docs/INDEX.md`,
`docs/agents/openspec.md`, `docs/agents/domain.md`,
`docs/agents/triage-labels.md`, `.claude/hooks/openspec-path.sh`,
`docs/plans/group-permissions.md`, and `openspec/config.yaml` only if the
#58 correction leaves it disagreeing.

Deleted: `.claude/commands/opsx/` (12 files). Regenerated, not hand-edited:
`.claude/skills/openspec-*/SKILL.md`; their invocation examples are refreshed
for skill-only delivery. `.agents/skills/*/SKILL.md` remains the Codex-specific
set and is checked for unintended changes during regeneration.

Untouched by design: everything under `docs/history/`,
`docs/old-app-capture/`, `docs/parity/`, `docs/research/`,
`reference/leg1-contract/`, and `openspec/changes/archive/`. Dead references
inside frozen material stay dead, as this repo already does for the Leg 1
paths noted in `docs/INDEX.md`.

## Flagged, not done

- **The group-permissions product questions stay open** (matrix vs toggle,
  self-removal and last-kaitiaki protection, what happens to a removed
  member's already-synced data, two kaitiaki removing each other offline).
  This change only stops the file calling itself a spec. #67 ("Who can read
  a person's profile?") is adjacent and also unanswered.
- **Where `docs/plans/group-permissions.md` finally lives.** Folding it into
  its GitHub issue and dropping `docs/plans/` is cheapest at the moment
  group permissions is actually picked up, when `/opsx:propose` absorbs its
  content. Not worth the link churn now.
- **`CLAUDE.md`'s "skills in use" list may be short.** `tdd`,
  `code-review`, `codebase-design`, `resolving-merge-conflicts`, `wizard`
  and `writing-for-agents` are installed but unmentioned. Adding them would
  be inventing policy, so the list is left as the human wrote it.
- **#55 "One place for the profile field list"** is a duplication with a
  documentation smell, but it is about source code. Out of scope.
- No new index, registry, or keep-these-in-step checklist is proposed. The
  only standing obligation this change leaves behind is the one that already
  exists: `CLAUDE.md` and `openspec/config.yaml` change together.
