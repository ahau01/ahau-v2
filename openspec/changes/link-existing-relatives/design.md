# Design

## Context

See `proposal.md` for motivation and `specs/own-whakapapa/spec.md` for the behavior contract. `store-own-whakapapa` establishes private Relative and Relationship entries and a chain-local read; `show-own-whakapapa-tree` supplies the tree and per-person menus this change extends. The profile feature keeps Holochain calls behind `src/profile/client.ts`; whakapapa follows that feature-client boundary. The private-entry spike in the storage change found that validators do not receive private contents, so relationship graph rules are not storage-enforced.

## Goals / Non-Goals

**Goals:**

- Add one Relationship between two existing people without creating another Relative.
- Apply the same link rules in the display/domain path and at the coordinator write boundary.
- Make refused pairings understandable in the picker and prove they commit no Relationship through the supported workflow.

**Non-Goals:**

- Changing a person's name, retracting a relationship, or deleting a Relative.
- Changing the private-entry model or claiming cycle and duplicate checks are enforced against clients that bypass the coordinator.
- Changing tree layout or adding pan/zoom.

## Decisions

### Shared graph rule, coordinator recheck

Put the pure `canLink(parent, child, liveRelationships)` rule beside the whakapapa tree/domain functions introduced by the tree change. It rejects equal endpoints, an existing live edge with the same parent and child, or a cycle: with edges directed parent-to-child, the proposed edge is cyclic exactly when the proposed parent is already reachable from the proposed child. UI selection uses this result to explain invalid pairings; the coordinator runs the same rule against its current chain-local live relationships immediately before writing.

The integrity zome cannot establish these content rules because private Relationship contents are not present in validation ops. The supported coordinator workflow can refuse invalid input, but an app client that bypasses it can write content that remote validators cannot inspect. This boundary must remain explicit in code comments and any refusal wording; do not describe graph checks as storage validation.

**Alternative considered:** put the rules only in the picker. A direct client call could then store a cycle or duplicate. Rechecking in the coordinator makes it the owner of supported writes while sharing one rule implementation with the UI.

### One private Relationship write

`link(parent, child)` accepts two existing `PersonRef`s and creates one private Relationship entry after checking current chain data. It does not create a Relative or use a Holochain link. The existing read model then includes the edge as live. Because the operation makes one entry write, there is no two-entry partial-commit case.

**Alternative considered:** represent links with Holochain links. They are public and would disclose tree structure, contrary to the established privacy model.

### Per-person menu opens an explanatory picker

Each person's menu opens a picker over the people already returned for the author's tree, including any floating people the tree read model includes. The menu person is a convenient starting point; the author selects parent and child roles explicitly. Keep invalid options visible with the rule-specific explanation rather than silently removing them. Submit only valid pairings; if the coordinator still refuses a stale or invalid request, report its reason and retain the picker state.

**Alternative considered:** silently filter invalid pairs. That hides why a person cannot make a particular link and makes the tree appear to be omitting people.

### Authorship and privacy copy

The Relationship remains the author's account, not a universal or biological claim. Its private contents stay on the author's chain, but peers can see the author and timing of its action. Any UI that describes this behavior must state both facts without implying that action metadata is hidden.

## Risks / Trade-offs

- [A caller bypassing the coordinator can author a duplicate or cyclic private Relationship that validators cannot inspect] → Keep checks in the supported coordinator path, explain the boundary accurately, and do not claim integrity enforcement.
- [A tree read may be incomplete or stale while source-chain data is being read] → Recheck against the current chain-local query in the coordinator and surface a refusal without discarding the picker state.
- [Relationship action authorship and timing remain visible] → Preserve the existing privacy wording: contents are private, action provenance is visible.

## Migration Plan

No stored entries change shape. The new operation writes the existing private Relationship type, so existing readers already understand its output. Rollback removes the UI/client operation but does not erase Relationship actions already written to source chains.
