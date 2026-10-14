# OpenSpec

How work goes from an idea to merged code in this repo. Replaces the
Wayfinder map-and-tickets flow (#57).

## Setup

The CLI is pinned in `package.json`, so run `npm install` once. The
`openspec-*` skills call plain `openspec`. A `SessionStart` hook
(`.claude/hooks/openspec-path.sh`) puts `node_modules/.bin` on PATH for
agent sessions, and the nix devShell does the same for your terminal. Either
way you get the pinned version, not a global install.

This repo's entry points are the `openspec-*` skills, not the `/opsx:*`
commands. `delivery` is a per-machine `openspec` setting; on a machine set
to `both` or `commands`, `openspec update` regenerates
`.claude/commands/opsx/` — it can simply be deleted again.

## Where things live

- **`openspec/changes/<name>/`**: one change in progress: `proposal.md`,
  `design.md`, `tasks.md`, and delta specs under `specs/`. A change is the
  unit of work: one change, one branch, one PR.
- **`openspec/specs/`**: what the system does now. The only live spec.
  Delta specs merge in here when a change is archived.
- **`openspec/changes/archive/`**: finished changes, kept for their
  reasoning — the decision record that replaced `docs/adr/`.
- **`openspec/config.yaml`**: the compact context and constraint subset the
  OpenSpec CLI injects into artifact instructions, not a second full narrative.
  Update it when that subset changes.
- **`CLAUDE.md`** and **`CONTEXT.md`**: `CLAUDE.md` holds project-wide care
  and engineering practices and is the source for the subset
  `openspec/config.yaml` carries; `CONTEXT.md` holds domain vocabulary.
- **GitHub issues**: the backlog and intake (see
  [issue-tracker.md](issue-tracker.md)). Nothing about a change's scope or
  design lives on the issue once the change exists.
- **`docs/history/leg1/leg1-contract.md`**: frozen reference — a checklist of what
  the old app's data layer could do, not an interface new code must
  implement.
- **`docs/`**: supporting evidence, research, and historical reasoning. Not
  authoritative for current product requirements or architecture. Older
  decision records such as `history/leg1/leg1-contract.md` remain useful rationale;
  any principle still governing current behavior must also be stated in its
  current authoritative home (`CLAUDE.md`, a spec, or a change's
  `design.md`).
- **`README.md`**: orientation and how to run the project.

## The flow

1. **Pick up an issue** (or start from a fresh idea). If the problem isn't
   clear yet, `/openspec-explore` to think it through. Exploring is a
   conversation, not a ticket tree. Use `grilling` to pressure-test it and
   `research` or `prototype` to answer a specific question along the way.
2. **`/openspec-propose`**: writes the change in one go. The proposal links
   the issue it comes from. Questions still open go in the proposal or
   design, not in new issues. `/openspec-new-change` + `/openspec-continue-change`
   do the same one artifact at a time.
3. **Review the change before building.** For anything touching
   relationship data, sync or access control, a person reads `proposal.md`
   and `design.md` against CLAUDE.md before `/openspec-apply-change`.
   Revise with `/openspec-update-change`.
4. **`/openspec-apply-change`**: works through `tasks.md`. Open a PR that
   says `Closes #<issue>`.
5. **`/openspec-verify-change`**, then **`/openspec-archive-change`** in
   the same PR, so the specs in `openspec/specs/` match what merged.

## Decisions and vocabulary

Terms go in `CONTEXT.md`, via `domain-modeling` (see [domain.md](domain.md)).
A lasting decision is recorded in a spec's requirements, or in a change's
`design.md` if it doesn't belong in a spec — nothing else is written in
parallel.
