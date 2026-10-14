# Tasks

## 1. Shared link rules

- [ ] 1.1 Add the pure link-eligibility rule beside the whakapapa tree domain functions, covering self-links, duplicate live links, and cycles; add unit tests for each refusal and a valid link, and verify with `npm run test:app`.

## 2. Coordinator write path

- [ ] 2.1 Add `link(parent, child)` to the whakapapa coordinator and feature client contract, rechecking the shared rule against the current chain-local live relationships before creating one private Relationship; verify success, readback, and that each refusal writes no Relationship in SweetTest with `npm run test:sweettest`.

## 3. Tree picker

- [ ] 3.1 Add “Link to existing person” to each person's menu with explicit parent/child selection from existing tree people, keeping invalid pairings visible with explanations and retaining state when a coordinator refusal occurs; verify successful and refused flows with component tests using the pretend client and `npm run test:app`.

## 4. Integration

- [ ] 4.1 Verify the whakapapa feature client remains the only app Holochain boundary and that its link API, tree picker, and domain types pass `npm run typecheck` and `src/profile/boundary.test.ts`.
