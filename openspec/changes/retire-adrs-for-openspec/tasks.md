# Tasks

## 1. Preserve the initial-days narrative

- [ ] 1.1 Create `docs/history/why-the-rewrite.md`, merging ADR-0002 through
  ADR-0006's content near-verbatim as one chronological narrative (each
  original ADR's date and "why now" kept as a section heading). Verify by
  checking every distinct decision/case-study detail from the five source
  ADRs (the db2 migration saga, the Holochain exit criterion, the Svelte/
  Gramps.js call, the no-migration stance, the capability-driven redesign)
  appears somewhere in the new file.

## 2. Rewrite living-doc citations (before any deletion)

- [ ] 2.1 `CLAUDE.md`: restate the ADR-0003/ADR-0006-backed facts inline
  (Holochain as Leg 2 candidate; capability-driven redesign and frozen Leg 1
  contract) without linking to `docs/adr/`. Verify: `grep -n "ADR-000" CLAUDE.md`
  returns nothing.
- [ ] 2.2 Top-level `README.md`: same treatment for its ADR-0002/0003/0006
  citations. Verify: `grep -n "ADR-000" README.md` returns nothing.
- [ ] 2.3 `openspec/config.yaml`: drop the "(ADR-0006)" parenthetical and the
  "ADRs live in `docs/adr/`" line from the `context:` block. Verify:
  `grep -n "ADR-000\|docs/adr" openspec/config.yaml` returns nothing.
- [ ] 2.4 `openspec/specs/own-profile/spec.md`: drop the "(ADR-0008)"
  citation from the overview sentence (the sentence already states the fact
  without it). Verify: `grep -n "ADR-000" openspec/specs/own-profile/spec.md`
  returns nothing, and `openspec validate --store ""` (or plain
  `openspec validate`) still passes for this spec.
- [ ] 2.5 `docs/capability-inventory.md`: restate its ADR-0006 citation
  inline. Verify: `grep -n "ADR-000" docs/capability-inventory.md` returns
  nothing.
- [ ] 2.6 `reference/leg1-contract/README.md` and
  `reference/leg1-contract/contract-source/README.md`: restate their
  ADR-0006 citations inline. Verify: `grep -rn "ADR-000" reference/leg1-contract/*/README.md reference/leg1-contract/README.md`
  returns nothing.
- [ ] 2.7 `docs/research/2026-10-04-rust-holochain-learning-tickets.md`:
  replace every ADR citation (including the line-number ones, e.g.
  "ADR-0003 L49-57") with the cited fact stated inline, read from the
  source ADR immediately before rewriting. Verify: `grep -n "ADR-000" docs/research/2026-10-04-rust-holochain-learning-tickets.md`
  returns nothing.
- [ ] 2.8 `docs/research/holochain-group-permissions.md`: same treatment for
  its ADR-0003 citations. Verify: `grep -n "ADR-000" docs/research/holochain-group-permissions.md`
  returns nothing.
- [ ] 2.9 `docs/research/pataka-always-online-peer.md`: same treatment for
  its ADR-0003/0005/0006 citations. Verify: `grep -n "ADR-000" docs/research/pataka-always-online-peer.md`
  returns nothing.
- [ ] 2.10 `docs/plans/group-permissions.md`: same treatment for its
  ADR-0003/0006 citations. Verify: `grep -n "ADR-000" docs/plans/group-permissions.md`
  returns nothing.
- [ ] 2.11 `docs/INDEX.md`: remove the `adr/` row from the living-docs table
  and adjust any other row that mentions it (the `contract-decisions.md` row,
  the `history/leg1/` paths note). Verify: `grep -n "ADR-000\|docs/adr" docs/INDEX.md`
  returns nothing.

## 3. Stop regenerating the dependency

- [ ] 3.1 `docs/agents/openspec.md`: remove the "Lasting decisions still go
  in ADRs... write the ADR too and link it" instruction from "Decisions and
  vocabulary"; state that a spec's requirements or a change's `design.md`
  are now the only place a lasting decision is recorded. Verify:
  `grep -n "ADR" docs/agents/openspec.md` returns nothing.
- [ ] 3.2 `docs/agents/domain.md`: remove `docs/adr/` from the mandatory
  "Before exploring" reading list and remove the "Flag ADR conflicts"
  section entirely. Verify: `grep -n "ADR\|docs/adr" docs/agents/domain.md`
  returns nothing.

## 4. Delete the directory

- [ ] 4.1 Delete all 9 files under `docs/adr/` (`0002`-`0008` plus
  `README.md`). Verify: `test ! -d docs/adr` succeeds, and a repo-wide
  `grep -rn "ADR-000[2-8]" --include="*.md" --include="*.yaml" .` matches
  only inside `docs/history/leg1/`, `docs/history/handoffs/`, and
  `openspec/changes/archive/2026-10-11-add-landing-and-shell/` (the
  frozen/archived material this change deliberately leaves unfixed).

## Workflow follow-up

- Review the diff for any remaining ADR citation this task list missed
  before opening the PR.
- Run `/opsx:verify` against this change, then `/opsx:archive` in the same
  PR.
