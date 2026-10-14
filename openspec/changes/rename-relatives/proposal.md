# Proposal

## Why

After a person can build their own Whakapapa, they need to correct a relative's name without losing the earlier account or changing who the relationship refers to. The rename must remain part of the author's account and preserve the existing private-entry and authorship guarantees.

## What Changes

- Add `rename_relative(relative, name)` to write a new version of a name-only Relative, anchored to its first Create action.
- Return the latest relative names from the existing Whakapapa read model while preserving earlier versions in chain history.
- Add a Rename action to each relative's person menu. If saving is refused, keep the form open with the entered name and the refusal reason.
- Keep Me's name editing in profile editing; this change renames relatives only.

## Capabilities

### New Capabilities

- `own-whakapapa`: add relative renaming to the author's private account of relatives and parent-child relationships.

### Modified Capabilities

- None

## Impact

- Extends the Whakapapa coordinator zome and feature client with rename behavior, and updates the tree's per-person menu and rename form.
- Builds on `store-own-whakapapa` and `show-own-whakapapa-tree`; those changes must be merged first.
- Requires conductor-backed proof that a rename returns the latest name while both versions remain in chain history, that another agent's rename is refused, and that an update not anchored to the first Create is refused.
- Linking existing relatives, retracting relationships, and refining tree layout remain separate later changes.
