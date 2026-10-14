# Proposal

## Why

When a person corrects their own account of parent-child relationships, they need to retract one relationship without removing the people or their other relationships. If that changes which people are connected to Me, the confirmation should make the exact effect clear before the author commits the retraction.

## What Changes

- Add an author-only operation to retract one Relationship by its action hash; do not delete a Relative or any other relationship.
- Keep retracted relationships out of the live read while preserving their source-chain history; allow a later link of the same pair as a new Relationship.
- Show “Remove link to X” in each person's menu, with a confirmation that describes the retraction and names exactly which people will be shown in floating groups if they become disconnected from Me.
- Keep people outside Me's connected component visible with their own live relationships, marked “not connected to you.”
- Preserve privacy wording: relationship contents stay on the author's chain, while peers can see that the author wrote actions and when.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `own-whakapapa`: retract one authored relationship, show the exact resulting disconnection before confirmation, and retain all people and unrelated relationships.

## Impact

- Depends on `store-own-whakapapa`, `show-own-whakapapa-tree`, `rename-relatives`, and `link-existing-relatives` being merged first.
- Extends the whakapapa coordinator/client, graph domain logic, and per-person menu and confirmation UI.
- Adds unit coverage for disconnection calculation and conductor-backed proof of author-only retraction, live reads, and preserved history. SweetTest proof remains local-only.
- Refining tree layout remains a separate later change and is out of scope.
