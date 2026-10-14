# Tasks

## 1. Disconnection domain rule

- [ ] 1.1 Implement pure `disconnectedBy(tree, relationship)` graph logic that returns exactly the people newly outside Me's connected component after removing that edge; add unit cases for a bridge, alternate path, parallel edge, existing floating component, and multiple people in the cut-off component, and verify with the focused domain test command.

## 2. Author-only relationship retraction

- [ ] 2.1 Add `retract_relationship(hash)` to the coordinator and feature client; verify the coordinator only targets a live Relationship on the author's chain and writes one Delete, and add unit coverage for invalid or stale targets.
- [ ] 2.2 Add SweetTest coverage proving the relationship is absent from live reads while its Create/Delete history remains, a different agent's delete is refused, people and unrelated links remain, and re-linking the same pair creates a new live Relationship; run `npm run test:sweettest` locally and report that conductor proof is not part of CI.

## 3. Confirm and show the resulting groups

- [ ] 3.1 Add “Remove link to X” to each person's menu and show a plain confirmation for an empty disconnection set or a confirmation naming exactly the affected people; after success, keep all people and remaining links visible in their resulting components, label floating components “not connected to you,” and use retraction/history wording; add component tests for both confirmation cases and verify with the focused UI test command.
- [ ] 3.2 Handle coordinator refusal after a stale preview without changing the displayed tree, and add a component test that preserves the current view and presents the refusal so the author can review the current graph.
