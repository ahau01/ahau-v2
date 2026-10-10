# OpenSpec

How work goes from an idea to merged code in this repo. Replaces the
Wayfinder map-and-tickets flow (#57).

## Where things live

- **`openspec/changes/<name>/`**: one change in progress: `proposal.md`,
  `design.md`, `tasks.md`, and delta specs under `specs/`. A change is the
  unit of work: one change, one branch, one PR.
- **`openspec/specs/`**: what the system does now. Delta specs merge in here
  when a change is archived.
- **`openspec/changes/archive/`**: finished changes, kept for their reasoning.
- **`openspec/config.yaml`**: project context and per-artifact rules. It
  restates CLAUDE.md's kaupapa rules so every proposal, spec, design and
  task list is written against them. CLAUDE.md is the source of truth; edit
  both together.
- **GitHub issues**: the backlog (see [issue-tracker.md](issue-tracker.md)).
  Nothing about a change's scope or design lives on the issue once the
  change exists.

## The flow

1. **Pick up an issue** (or start from a fresh idea). If the problem isn't
   clear yet, `/opsx:explore` to think it through. Exploring is a
   conversation, not a ticket tree. Use `grilling` to pressure-test it and
   `research` or `prototype` to answer a specific question along the way.
2. **`/opsx:propose`**: writes the change in one go. The proposal links the
   issue it comes from. Questions still open go in the proposal or design,
   not in new issues. `/opsx:new` + `/opsx:continue` do the same one
   artifact at a time.
3. **Review the change before building.** For anything touching
   relationship data, sync or access control, a person reads `proposal.md`
   and `design.md` against CLAUDE.md before `/opsx:apply`. Revise with
   `/opsx:update`.
4. **`/opsx:apply`**: works through `tasks.md`. Open a PR that says
   `Closes #<issue>`.
5. **`/opsx:verify`**, then **`/opsx:archive`** in the same PR, so the
   specs in `openspec/specs/` match what merged.

## Decisions and vocabulary

Lasting decisions still go in ADRs (`docs/adr/`) and terms in `CONTEXT.md`,
via `domain-modeling` (see [domain.md](domain.md)). A change's `design.md`
records why this change is shaped the way it is; an ADR records a decision
other changes have to respect. If a design decision will outlive the
change, write the ADR too and link it.
