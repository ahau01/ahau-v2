# Proposal

## Why

After a person has added relatives to their own whakapapa, they need to connect two of those existing people without creating a duplicate Relative. This supports correcting and reconnecting their own account while keeping every relationship authored by the person and subject to the same private-entry limits as the rest of their whakapapa.

## What Changes

- Add a link operation that records one parent-child Relationship between two existing people identified as Me or a Relative.
- Refuse self-links, duplicate live links, and links that would create a cycle; share these rules in plain TypeScript domain logic and re-check them in the coordinator before writing.
- Add “Link to existing person” to each person's menu, with parent/child choices and explanations for refused options.
- Prove successful links are returned by the read model and refused links write no Relationship.
- Keep names and relationship contents private. Peers may see that the author wrote Relationship actions and when, but not their contents.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `own-whakapapa`: allow one person to connect two existing people with a valid parent-child relationship in their own private account.

## Impact

- Depends on `store-own-whakapapa` and `show-own-whakapapa-tree` being merged first.
- Extends the whakapapa coordinator zome, shared plain TypeScript domain rules, the feature client, and the tree's per-person menu and picker.
- Adds unit and conductor-backed coverage for link rules, readback, and refused writes. Conductor privacy and atomicity evidence remains local-only.
- Retracting links and showing people disconnected by a retraction, renaming relatives, and refining the layout remain separate later changes; they are out of scope here.
