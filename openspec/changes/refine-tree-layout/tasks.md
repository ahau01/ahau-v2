# Tasks

## 1. Confirm prerequisites and real-tree evidence

- [ ] 1.1 Confirm the storage, tree, rename, existing-person linking, and relationship retraction changes are implemented; use the resulting Whakapapa view with a real tree and record concrete layout observations in `design.md` before changing the algorithm
- [ ] 1.2 Inspect the merged `layoutWhakapapa()` and its tests; identify how its stable person identity, generation ordering, and floating components map to the requested relative-position assertions

## 2. Refine and verify the layout

- [ ] 2.1 Refine the pure layout ordering to place co-parents of shared children side by side, reduce avoidable crossings, separate floating components, preserve Me's generation-zero anchor, and break unresolved ties deterministically; verify existing people and edges are unchanged
- [ ] 2.2 Add or update domain unit tests for shared-child co-parents, avoidable crossings, floating-component separation, Me's anchor, and repeated-input determinism using relative positions; run the focused layout tests
- [ ] 2.3 Run the project test suite and confirm the rendered tree retains its existing people and relationships while meeting the layout scenarios
