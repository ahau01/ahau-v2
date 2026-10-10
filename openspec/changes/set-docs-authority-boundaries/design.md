# Design

## Context

See `proposal.md` — Why. Four facts about the current state shape the
approach:

1. **The previous change's verification was token-scoped.**
   `2026-10-11-retire-adrs-for-openspec` verified each file with
   `grep -n "ADR-000"`. `README.md`'s pointer was `[docs/adr/](docs/adr/)` —
   a bare directory link with no ADR number in it — so every check passed
   while the link died. Any verification here has to resolve links, not
   match a token.
2. **Three of the file sets in question are generated.**
   `.claude/commands/opsx/`, `.claude/skills/openspec-*/` and
   `.agents/skills/` are all output of openspec 1.14.1 (pinned in
   `package.json`). Which of them exist is decided by `openspec config`'s
   `delivery` key and by the `.openspec-target` marker in `.agents/skills/`,
   both outside the repo's own files. Hand-editing them is pointless; the
   next `openspec update` wins.
3. **`docs/plans/group-permissions.md` is load-bearing for research.**
   Twelve references point at that path, four of them from living research
   docs (`docs/research/pataka-always-online-peer.md`,
   `docs/research/2026-10-04-rust-holochain-learning-tickets.md`,
   `docs/research/holochain-group-permissions.md`), several citing line
   numbers inside it.
4. **`docs/` is already mostly evidence.** `old-app-capture/` (old app
   screenshots plus `capture.mjs`), `parity/` (the v2 equivalents plus
   `shoot.mjs`), `research/`, `history/` and the Leg 1 outcome docs are all
   records of something that happened. Only `plans/` and a few sentences
   elsewhere claim authority over what the system should do.

## Goals / Non-Goals

**Goals:**

- Each of "where is the spec", "where are decisions recorded", "what has
  been built" and "which skill do I invoke" has exactly one answer in the
  repo, and the other documents either repeat it or point at it.
- Every link in a living document resolves.
- Evidence survives unchanged: no screenshot, capture script, research doc,
  knowledge-base file, Leg 1 document or archived change is moved, reworded
  or deleted.

**Non-Goals:**

- No new document, index, registry, or keep-in-step checklist. The repo
  already has one standing obligation (`CLAUDE.md` and
  `openspec/config.yaml` move together); this change adds none.
- No edits inside frozen material — `docs/history/`,
  `openspec/changes/archive/`, `reference/leg1-contract/`. References that
  are already dead there stay dead, per the practice `docs/INDEX.md` sets
  out for the Leg 1 paths.
- No answers to the group-permissions product questions, and no new product
  requirements anywhere.
- No committed link checker or CI docs job.

## Decisions

**Authority boundaries extend `docs/agents/openspec.md`'s existing "Where
things live" list; no new file.** That section already names
`openspec/changes/`, `openspec/specs/`, `openspec/changes/archive/`,
`openspec/config.yaml` and GitHub issues. It gains the three homes it omits
(`CLAUDE.md`/`CONTEXT.md`, `reference/leg1-contract/`, `docs/`) and, for
each, what it is *not*. *Alternative:* a new top-level `AUTHORITY.md`.
Rejected — a fourth file restating the same boundaries is the failure mode
this change is cleaning up.

**`docs/INDEX.md` stays an index of directories and living documents.** It
gains rows for what it omits at that level and nothing finer. *Alternative:*
a complete file listing. Rejected — `history/knowledge-base/` alone is ~40
files, it would need updating on every doc added, and `docs/INDEX.md`
already summarises those subtrees correctly as subtrees.

**`docs/plans/group-permissions.md` is demoted in place, not moved.** Delete
the "Functional spec for the first Holochain slice" blockquote, the
"Delivery Milestones" table and its `<!-- /plan turns each into a plan -->`
template comment; retitle the status footer so the file reads as the live
problem statement and open questions for work not yet started. *Alternatives:*
(a) move it under `docs/research/` — rejected, it breaks twelve references
including line-number citations, and a problem statement is not research;
(b) fold it into a GitHub issue and delete it now — rejected, that discards
the old-app evidence before the change that needs it exists. The natural
moment is when group permissions is picked up and `/openspec-propose`
absorbs the content; until then the content is more useful than the tidiness.

**`delivery: skills`, then regenerate — never hand-edit the generated
trees.** `openspec config set delivery skills`, then `openspec update
--force`, then delete `.claude/commands/opsx/`. The regeneration matters
beyond the deletion: the skill bodies currently cite `/opsx:*` (because
`delivery: both` makes them point at the command names), so regenerating is
what makes their self-references correct. `.agents/skills/` regenerates the
same way and stays Codex-flavoured. Reviewing that diff is a task step: with
the generator version pinned and unchanged, it should contain invocation
names and nothing else. *Alternative:* `git rm` the commands tree and leave
`delivery: both`. Rejected — the next `openspec update` brings it back.

**Verification resolves links and asserts absences; it does not grep for a
token.** At apply time, extract the relative links from each edited living
document and check each target exists, and separately assert the specific
false statements are gone. This is a one-off command run during apply, not
a script added to the repo. *Alternative:* a committed link checker in CI.
Rejected as new machinery for a problem that occurs once per docs change.

**Order: entry-point names, then facts, then navigation.** The tooling step
goes first because it decides the names the documents must use. `CLAUDE.md`
and `docs/agents/` come next, because they are what the status and authority
claims live in. `README.md` and `docs/INDEX.md` come last, because they
point at everything above and can only be checked once the targets are
final.

## Risks / Trade-offs

- **`delivery` is a machine-global setting the repo cannot pin** → a fresh
  clone on a machine set to `both` will regenerate `.claude/commands/opsx/`
  on the next `openspec update`. Mitigation: one factual sentence in
  `docs/agents/openspec.md` — this repo's entry points are the `openspec-*`
  skills, and a regenerated `.claude/commands/opsx/` can be deleted. No
  checklist, no CI check; the cost of it reappearing is a stray directory,
  not a wrong answer.
- **Rewriting `CLAUDE.md`'s status and High-risk preamble touches the file
  agents read for the kaupapa rules** → a wording slip there costs more than
  anywhere else in this diff. Mitigation: the four rules' text is not
  touched at all; only the status sentences and the preamble change. #58
  already requires a person to read this diff closely, and this design does
  not relax that.
- **Demoting the group-permissions file could read as deprioritising the
  feature** → mitigation: the file says plainly that it is the live problem
  statement awaiting a change, and `README.md`'s Status still names group
  permissions as next.
- **Losing `/opsx:*`** → anyone with the habit gets "unknown command".
  Mitigation: the rename is stated in `docs/agents/openspec.md`. Archived
  changes keep their `/opsx:*` wording as the historical record; they are
  not rewritten.
- **The regenerated skill diff could carry unrelated upstream wording** →
  mitigation: inspect it before committing; `@fission-ai/openspec` is pinned
  at 1.14.1 in `package.json` and this change does not bump it.

## Migration Plan

One PR against `main`, saying `Closes #58`. No build, runtime or data
effect, so no staged rollout: `npm test` and the conductor tests are
unaffected by every file in the diff. Rollback is reverting the commit,
plus `openspec config set delivery both` on the machine if the generated
trees are wanted back.

## Open Questions

Both are safely deferrable — neither changes the boundaries, the approach,
or the task list:

- Whether `docs/plans/` survives at all. Decided when group permissions is
  picked up as a change, not now.
- Whether `CLAUDE.md`'s "skills still in use" list should name `tdd`,
  `code-review`, `codebase-design`, `resolving-merge-conflicts`, `wizard`
  and `writing-for-agents`, which are installed but unlisted. Adding them
  would be inventing policy, so this change leaves the list as written and
  only removes the names that no longer exist.
