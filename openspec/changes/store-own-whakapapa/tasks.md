# Tasks

## 1. Private validation spike

- [ ] 1.1 Verify whether the pinned Holochain/HDI author-side callback exposes private-entry content through raw `Op::StoreRecord`; add a focused spike proof or executable test, record the observed result and evidence in `design.md`, and confirm the corresponding refusal wording for app-side versus storage-enforced content rules.

## 2. Integrity zome

- [ ] 2.1 Add the whakapapa integrity zome and DNA registration for private `Relative` and `Relationship` entries, with `PersonRef`/direction types and a random nonce field; verify the DNA and workspace compile.
- [ ] 2.2 Implement metadata-based author-only update/delete and first-Create checks plus the profile-exists chain check; add validation unit tests and verify them with `npm run test:zomes`.

## 3. Coordinator and privacy proof

- [ ] 3.1 Add the coordinator zome and DNA dependency, implement atomic `add_relative` with coordinator-side checks supported by the spike, and implement `get_whakapapa` from source-chain query results with latest relative names and live relationships; verify create/read and failure atomicity in SweetTest.
- [ ] 3.2 Extend the rogue test zome and SweetTest to verify another agent finds each private action but receives null contents, and verify unauthorized update/delete attempts are refused; run `npm run test:sweettest` locally.

## 4. Feature client

- [ ] 4.1 Add `src/whakapapa/` client types and calls for add/read using the feature-client boundary; add focused client tests and verify them with the relevant Vitest command and `src/profile/boundary.test.ts`.
