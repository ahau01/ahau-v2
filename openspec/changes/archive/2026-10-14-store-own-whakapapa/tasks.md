# Tasks

## 1. Private validation spike

- [x] 1.1 Verify whether the pinned Holochain/HDI author-side callback exposes private-entry content through raw `Op::StoreRecord`; source-level proof against the pinned HDI API is sufficient, or add an executable test. Record the observed result and evidence in `design.md`, and distinguish app-side refusals from storage-enforced rules.

## 2. Integrity zome

- [x] 2.1 Add the whakapapa integrity zome and DNA registration for private `Relative` and `Relationship` entries, with `PersonRef`/direction types and a random nonce field; verify the DNA and workspace compile.
- [x] 2.2 Implement metadata-based author-only update/delete and first-Create checks plus the profile-exists chain check; unit-test valid updates, refused updates of updates, wrong target types, unrelated deletes, and author refusals with `cargo test -p whakapapa_integrity`.

## 3. Coordinator and privacy proof

- [x] 3.1 Add the coordinator zome and DNA dependency, implement atomic `add_relative` with coordinator-side checks supported by the spike, and implement `get_whakapapa` from source-chain query results with latest relative names and live relationships; verify create/read and failure atomicity in SweetTest.
- [x] 3.2 Extend the rogue test zome and SweetTest to verify another agent finds each private action but receives null contents, and verify unauthorized update/delete attempts are refused; run `npm run test:sweettest` locally.

## 4. Feature client

- [x] 4.1 Add `src/whakapapa/` client types and calls for add/read using the feature-client boundary; add focused Node test-runner coverage and verify with `npm run build && node --test dist/whakapapa/client.test.js dist/profile/boundary.test.js`.
