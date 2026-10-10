# Design

## Context

See `proposal.md` - Why. `docs/adr/` is cited from ~15 files across the
repo (confirmed by grepping for `ADR-000[2-8]` repo-wide): some are "living"
docs this project actively maintains (per `docs/INDEX.md`'s living/history
split), some are frozen history that already carries unfixed references by
established practice (`docs/INDEX.md`'s note on `history/leg1/` paths: "left
as written, not fixed retroactively").

## Goals / Non-Goals

**Goals:**
- Zero references to `docs/adr/` remain in any currently-maintained doc
- The ADR-writing/reading instructions that regenerate the overhead on every
  future change are removed, not just the current backlog of 8 files
- The "initial days" narrative (why the rewrite happened, what shape it took)
  survives the deletion, relocated rather than lost

**Non-Goals:**
- Not touching `docs/contract-decisions.md` or `docs/history/knowledge-base/`
  (neither cites an ADR; see proposal's "Flagged, not done")
- Not fixing dead ADR references inside already-frozen material
  (`docs/history/leg1/`, `docs/history/handoffs/`, the archived
  `add-landing-and-shell` change) — rewriting frozen history to patch a link
  is a bigger intervention than leaving it, and this project already has that
  policy for this exact situation

## Decisions

**One consolidated history doc, not a 1:1 ADR-to-file move.**
`docs/history/why-the-rewrite.md` merges ADR-0002 through ADR-0006's content
(why `ahau-monorepo`'s SSB stack was abandoned, Holochain's candidacy, the
Svelte-shell/Gramps.js call, the no-migration stance, the capability-driven
redesign and frozen Leg 1 contract) into one chronological narrative, sitting
alongside the other hand-written files already in `docs/history/`
(`ahau-monorepo-codebase-map.md`, `handoffs/`, `leg1/`). Content is merged
near-verbatim, not summarized — the goal is relocation, not compression, so
nothing in the "initial days" case study (the db2 migration saga, the
abandoned two-year-old MR, etc.) is lost to paraphrasing.
_Alternative considered_: five separate files mirroring the five ADRs.
Rejected — they already read as one continuous decision narrative (each
references the previous one's evidence), and splitting them preserves the
multi-file browsing overhead this change is trying to remove.

**ADR-0007/0008 are dropped, not relocated.**
Their content is already fully and more precisely expressed as `own-profile`
requirements. The only thing to migrate is the dangling "(ADR-0008)"
citation in that spec's overview, which gets removed rather than repointed —
the sentence it's attached to already states the fact in prose.

**Living-doc citations are rewritten inline, not pointed at the new history
doc.** Most citations (e.g. "per ADR-0006" in `CLAUDE.md`, `README.md`,
`reference/leg1-contract/*/README.md`) are standing in for a specific fact
("the Leg 1 contract is frozen reference, not the spec") that reads fine
stated directly. Pointing them at `docs/history/why-the-rewrite.md` instead
would just swap one dependency on a decision-history file for another,
which doesn't remove the coupling this change exists to remove — it only
moves the file it points at. The research docs
(`docs/research/*.md`, `docs/plans/group-permissions.md`) that cite specific
ADR line numbers get the cited fact restated inline at that location, since
those line numbers won't exist anywhere after deletion.
_Alternative considered_: keep citing `docs/history/why-the-rewrite.md` by
section anchor instead of inlining. Rejected for the same reason as above —
it keeps every living doc coupled to a specific history file's internal
structure, which breaks the moment that file is edited again.

**Deletion is sequenced after the rewrites, not before.**
Every living-doc citation gets rewritten first; `docs/adr/` is deleted last.
This avoids a window where a live doc links to a file that's already gone.

## Risks / Trade-offs

- [Inline restatement drifts from the original ADR's nuance during
  paraphrasing] → Mitigation: `tasks.md` has each rewrite task read the
  specific ADR section being cited immediately before rewriting it, not from
  memory of this exploration.
- [Frozen-history and archived-change dead references make future readers
  hunt for a file that no longer exists] → Mitigation: this is the existing,
  accepted cost of this project's frozen-history policy (same cost already
  paid for the `ahau-monorepo` branch references noted in
  `docs/history/handoffs/`); not a new risk this change introduces.
- [Merging 0002-0006 into one doc could read as flattening five distinct,
  dated decisions into an undifferentiated blob] → Mitigation: keep each
  ADR's own date and "why now" framing as a section heading inside the merged
  doc, rather than re-narrating them as a single voice.

## Migration Plan

1. Write `docs/history/why-the-rewrite.md` (merge 0002-0006).
2. Rewrite ADR citations in each living doc listed in `proposal.md`'s "What
   Changes", one task per file/file-group in `tasks.md`.
3. Drop the "(ADR-0008)" citation from `openspec/specs/own-profile/spec.md`.
4. Delete `docs/adr/` (all 9 files).
5. Rewrite `docs/agents/openspec.md` and `docs/agents/domain.md`'s
   ADR-dependent instructions.
6. Update `docs/INDEX.md`'s living-docs table to drop the `adr/` row and
   adjust rows that mention it.

No rollback mechanism beyond reverting the commit — this is documentation,
not a running system.
