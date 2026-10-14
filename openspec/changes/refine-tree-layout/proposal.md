# Proposal

## Why

The first hand-written layout is intentionally basic and can place co-parents
awkwardly, create avoidable line crossings, or make floating parts of the tree
hard to distinguish from Me's connected tree. After the complete tree and
retraction behavior have been used on a real tree, this optional refinement
makes those relationships easier to read while keeping Me as the anchor.

## What Changes

- Refine only the pure `layoutWhakapapa()` function so co-parents of shared
  children sit side by side, avoidable edge crossings are reduced, and floating
  components are separated from Me's component.
- Keep Me as the anchor and make coordinates deterministic for the same input.
- Add layout requirements and relative-position unit scenarios; do not assert
  pixel coordinates.
- Apply only after `store-own-whakapapa`, `show-own-whakapapa-tree`,
  `rename-relatives`, `link-existing-relatives`, and
  `retract-whakapapa-links` are implemented and a real tree has been used.
- Out of scope: pan or zoom, adding a partner relationship type, and any data
  or storage changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `own-whakapapa`: refine the observable spatial arrangement of the tree while
  preserving its people, relationship data, and groups.

## Impact

- Refines the pure layout domain function and its unit tests under
  `src/whakapapa/`.
- Updates the `own-whakapapa` layout contract with testable relative-position
  and determinism scenarios.
- No Holochain calls, source-chain actions, data migration, UI controls, or
  dependencies are required.
