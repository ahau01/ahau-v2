# Matt Pocock skills for Codex

Editable repo-local skills live in `.agents/skills/`, alongside OpenSpec.
Restart the Codex session to discover newly added skills.

- `$grill-me` / `$grilling`: pressure-test an idea during OpenSpec exploration.
- `$code-review`: review a branch or working changes against repo standards and
  the relevant OpenSpec change. Supply a base ref and change path.
- `$codebase-design`: compare interfaces and module design within a change.

OpenSpec remains the authority for scope, design, requirements and tasks.
Brainstorming is conversational until accepted conclusions enter the change.
Review supplements `openspec-verify-change`; it does not replace verification
or human review required by `CLAUDE.md`.

Excluded: setup, Wayfinder, to-spec, to-tickets, implement, implement-spec,
triage, and grill-with-docs (which introduces glossary/ADR writing).
No full plugin or auto-update mechanism is installed.

## Provenance and local adaptations

Source: https://github.com/mattpocock/skills
Commit: `49dd158d1076134a641b33efb035946536778336`.
MIT license: `matt-pocock-skills-LICENSE` in this directory.

Local adaptations: grill-me reads the sibling skill directly for Codex;
code-review resolves OpenSpec artifacts before issue context, supports working
changes, and stays read-only; codebase-design defers to kaupapa rules and
real-conductor tests, uses CONTEXT.md, and records decisions in OpenSpec.
Grilling and the remaining design references retain the upstream discipline.

Update only this selected set from an explicit upstream commit, then reapply
these adaptations and check sibling references. Installing the whole plugin
would reintroduce excluded workflows and duplicate skills.
