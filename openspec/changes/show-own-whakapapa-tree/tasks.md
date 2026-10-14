# Tasks

## 1. Build and verify the tree domain

- [ ] 1.1 Before implementation, read the merged `store-own-whakapapa` design and use its recorded private-validation spike result and `get_whakapapa` contract; verify the client types and read behavior are available.
- [ ] 1.2 Add pure `buildWhakapapa()` logic that retains Me and every returned relative, accepts only valid non-self edges, skips dangling, duplicate, and cycle-closing edges deterministically, and returns Me's component plus all floating components; add unit tests for each malformed-edge case and verify unaffected people and edges remain.
- [ ] 1.3 Add pure `layoutWhakapapa()` logic with deterministic layered coordinates, Me at generation zero, parents above and children below, and longest-path generations; add unit tests for these relationships and stable output.

## 2. Show and add to the tree

- [ ] 2.1 Replace the Whakapapa empty page with an accessible SVG tree that labels floating components "Not connected to you", hides relationship lines from assistive technology, exposes people as buttons in generation order, puts Add parent/Add child in each person's menu, preserves heading focus, and confines narrow-screen scrolling to the tree; verify behavior with component tests using a pretend client.
- [ ] 2.2 Connect the page through the existing feature-client boundary and app composition, rendering the author's read result and showing a clear refusal when an add is not saved; use the pretend client for component coverage and verify the app boundary check still passes.
- [ ] 2.3 Add the privacy and authorship explanation, accurately stating that contents stay on the author's chain while peers can see authored Relative/Relationship actions and timing; component tests verify the wording and that the account is not presented as universal or biological truth.

## 3. Update navigation behavior contract

- [ ] 3.1 Modify the navigation delta so only Archive and the tribe list retain the still-to-come empty state and no-Holochain-call requirements; keep the focus-on-heading requirement, and verify `openspec validate show-own-whakapapa-tree` passes.

## 4. Integration verification

- [ ] 4.1 Verify the `/me/whakapapa` route renders the tree from the feature client's author-chain read, adding a parent and child updates the displayed tree, failures do not display unsaved people, and Archive/tribe navigation behavior remains intact using the focused app test command.
