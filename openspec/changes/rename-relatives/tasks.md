# Tasks

## 1. Private Relative updates

- [ ] 1.1 Read the validation spike result in `store-own-whakapapa/design.md` and carry its app-side versus storage-enforced wording into this change; verify the chosen validation boundary matches that evidence.
- [ ] 1.2 Add coordinator `rename_relative(relative, name)` and integrity validation for author-only updates anchored at the Relative's first Create; cover non-first targets with `npm run test:zomes`.
- [ ] 1.3 Add conductor coverage for latest-name reads, both versions remaining in source-chain history, another agent's rename refusal, and refusal of an update not pointing at the first Create; run the local SweetTest proof with `npm run test:sweettest`.

## 2. Read model and feature client

- [ ] 2.1 Extend the Whakapapa read model to return each Relative's latest name while preserving first-Create identity for relationships; add focused unit coverage and verify it with `npm test`.
- [ ] 2.2 Expose rename through `src/whakapapa/` and test its success and refusal results; verify feature-client imports remain behind the app boundary with `src/profile/boundary.test.ts`.

## 3. Rename in the tree

- [ ] 3.1 Add Rename to each Relative's person menu and keep Me on profile editing; add component coverage verifying Me has no rename action and a refused rename keeps the entered name and reason visible, then run `npm run test:app` and `npm run check:app`.
