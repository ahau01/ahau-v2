# Design

## Context

See `proposal.md` for motivation and `specs/own-whakapapa/spec.md` for the behavior contract. This change follows the private Relative entry and query-based read model established by `store-own-whakapapa`, and adds the Rename action to the per-person menu introduced by `show-own-whakapapa-tree`.

The profile feature already provides the relevant edit-flow pattern: a refused save leaves its submitted form open and displays the reason. The Whakapapa page keeps Holochain calls behind its feature client and sends user actions through callbacks.

## Goals / Non-Goals

**Goals:**

- Keep a Relative's first Create action as its stable identity while adding name versions.
- Enforce author-only updates and first-Create ancestry at the integrity boundary, with coordinator checks for any content rules the private-entry validation path cannot enforce.
- Fold update history into the existing Whakapapa read model and preserve the entered name on UI refusal.

**Non-Goals:**

- Renaming Me, which remains part of profile editing.
- Changing relationship identity, linking or retracting relationships, or changing tree layout.
- Changing the privacy model: relative contents stay private to their author's chain, while peers may observe action authorship and timing.

## Decisions

### Update the existing Relative, anchored at its first Create

Add `rename_relative(relative, name)` to the Whakapapa coordinator workflow. Resolve the Relative by its first Create action and call the update operation against that original action. Integrity validation checks the action author and verifies the update target is the first Create, following the profile zome's author and first-version validation pattern. Never update a later version as the target: successive renames remain siblings of the original, so the Relative's `PersonRef` and all its relationships stay stable.

Before implementation, read `store-own-whakapapa/design.md` and use the recorded private-entry validation spike result. Keep any name-content rule at the strongest boundary that result supports; do not claim a coordinator check protects callers that bypass the coordinator if validators cannot inspect private content.

**Alternative considered:** represent a rename as a separate entry or a replacement Relative. That would require changing relationship references or resolving competing identities, while Holochain's update history already gives a stable original action with preserved versions.

### Extend the chain-local read fold

Extend `get_whakapapa`'s existing query fold to resolve each Relative's latest valid update and return that version's name, while retaining its first Create hash as identity. Updates are chain actions, so this does not require public links, a new index, or reads from another agent. Prior versions stay on the source chain; this operation does not retract them.

**Alternative considered:** fetch the latest name separately in the UI. That would split domain/read semantics across layers and risk showing stale or inconsistent data.

### Keep the edit flow inside the feature boundary

Expose rename through the `src/whakapapa/` client and the page callback, not through direct Holochain imports in app components. Add Rename only to Relative menus; the Me menu continues to use profile editing. On refusal, preserve the form value and show the reason, matching `src/profile/edit.ts` behavior.

**Alternative considered:** reuse profile editing directly. A Relative is not a profile and has different storage, identity, and privacy rules; only the refusal-state behavior is shared.

## Risks / Trade-offs

- [A rename creates another private-entry update action whose author and timing may be visible to peers] → Preserve the existing privacy wording: contents remain on the author's chain, while peers may see that the author wrote an action and when.
- [Private-entry validators may not see update contents] → Use the spike result recorded by `store-own-whakapapa` to place name-content checks accurately; distinguish app-side refusal from storage validation in errors and claims.
- [A chain query can be incomplete during synchronization] → Read the author's own source chain as the storage change does; do not imply that another agent can fetch or verify the latest name.

## Migration Plan

No migration is required. Existing Relative Creates remain the identity anchors; new renames add Update actions. If the app is rolled back, the source-chain history remains and older code may continue to display the original name because it does not resolve the new update actions.

## Open Questions

None. The validation spike is a prerequisite to implementation and its outcome selects the already-defined validation boundary; it does not change the user-visible contract.
