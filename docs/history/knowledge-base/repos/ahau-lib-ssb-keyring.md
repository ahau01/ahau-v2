# ahau-lib-ssb-keyring

GitLab: `ahau/lib/ssb-keyring`  
GitHub: `MakingEverythingAchievableNZ/ssb-keyring`  
32 MRs, 3 issues (1 open) — activity 2021-09-01 to 2023-10-12

## Open issues — unresolved, inherited as-is

### #2 "Usage" section in readme might be incorrect (ISSUE, opened, 2023-09-19)

Reports that the README's 'Usage' section documents signing.add in a way that doesn't actually work; the reporter shares the workaround they used in ssb-tribes instead, creating an empty object reference and merging the KeyRing API into it via Object.assign after async initialization completes.
- category: `chore`
- ⚠ gotcha: signing.add can't be used as documented; workaround creates an empty object reference and Object.assign's the API into it after init.
- [https://gitlab.com/ahau/lib/ssb-keyring/-/work_items/2](https://gitlab.com/ahau/lib/ssb-keyring/-/work_items/2)

## Notable changes

### #1 Allow many keys for reading and picking one for writing (ISSUE, closed, 2023-02-24)

Design notes from a meeting proposing a reworked groupInfo API shape with a single current write key plus a readKeys array (in reverse order) for decryption, alongside scheme and root fields. Discusses needing to fetch additional keys during decryption (referencing ssb-box2's format.js and envelope-js's key-slot.js, which currently uses only .key) and is left as an open question on how to update the API.
- category: `decision`
- [https://gitlab.com/ahau/lib/ssb-keyring/-/work_items/1](https://gitlab.com/ahau/lib/ssb-keyring/-/work_items/1)

### !16 remove sodium-universal as dependency (MR, merged, 2022-10-17)

Removes sodium-universal as a dependency, since ssb-keyring only used it for constants (e.g. the buffer size 32) rather than any actual crypto operations; sodium-universal pulls in native C code (sodium-native) and heavy deps like blake2b-wasm. Removing it avoids requiring C compilation and shrinks node_modules, benefiting Manyverse and other consuming apps; adds tests using na.crypto_secretbox_KEYBYTES to verify the hardcoded sizes are correct (checked in tests, not derived at runtime).
- category: `chore`
- ⚠ gotcha: Buffer-size constants are now hardcoded and only verified against na.crypto_secretbox_KEYBYTES in tests, not derived at runtime.
- [https://gitlab.com/ahau/lib/ssb-keyring/-/merge_requests/16](https://gitlab.com/ahau/lib/ssb-keyring/-/merge_requests/16)

### !12 group.add does not enforce info.root (MR, merged, 2022-07-19)

Removes the enforcement check for info.root in group.add (pending merge request 11 landing first). Argues that root validation isn't ssb-keyring's responsibility but that of whichever module handles group invites, since ssb-keyring currently can't verify a passed info.root actually corresponds to the real group - a caller could pass an arbitrary/moot msg id and keyring would accept it.
- category: `decision`
- ⚠ gotcha: Depends on merge request 11 landing first; after this, ssb-keyring no longer validates that info.root actually belongs to the group.
- [https://gitlab.com/ahau/lib/ssb-keyring/-/merge_requests/12](https://gitlab.com/ahau/lib/ssb-keyring/-/merge_requests/12)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2023-10-12 | !32 | Test pobox stored with old keyring can still be gotten in same format | merged | powersource |
| 2023-10-12 | #3 | Test old vs new db storage of own keys & pobox keys and see if they need migrating | closed | powersource |
| 2023-10-07 | !31 | Getting re-added to a group by adding an old key | merged | powersource |
| 2023-10-06 | !30 | Migrate group key storage format | merged | powersource |
| 2023-09-14 | !29 | Add po-box logic back in again | merged | powersource |
| 2023-05-09 | !28 | Get un-excluded when adding a new key to an excluded group | merged | powersource |
| 2023-05-08 | !27 | Skip picking key if it's already picked | merged | powersource |
| 2023-04-27 | !26 | Only remove writeKey on exclusion | merged | powersource |
| 2023-04-24 | !25 | Fix exclude boolean being stored in db | merged | powersource |
| 2023-04-19 | !24 | Add getUpdates | merged | powersource |
| 2023-04-07 | !23 | Add group.remove | merged | powersource |
| 2023-03-02 | !22 | Multiple keys per group | merged | powersource |
| 2023-02-03 | !21 | Add listSync to readme | merged | powersource |
| 2023-02-03 | !20 | Add listSync | merged | powersource |
| 2023-01-24 | !19 | Add live arg to list | merged | powersource |
| 2022-11-14 | !18 | support funky 2b recps for DMs | merged | staltz |
| 2022-11-02 | !17 | Allow identity/group uris to be group ids | merged | powersource |
| 2022-10-14 | !15 | Allow group root to be URI | merged | powersource |
| 2022-08-07 | !14 | Use sodium-universal instead of sodium-native for browser support | merged | arj03 |
| 2022-07-22 | !13 | update deps, add test:only check | merged | mixmix |
| 2022-07-19 | !11 | add GitLab CI config | merged | staltz |
| 2022-07-19 | !10 | rename addFromDMKeys to addFromSSBKeys | merged | staltz |
| 2022-07-19 | !9 | ssb-uri2 is a dependency | merged | staltz |
| 2022-07-19 | !8 | new api | merged | mixmix |
| 2022-07-15 | !7 | Draft: Mix 2022 07 15 | closed | mixmix |
| 2022-07-13 | !6 | Meta keyrings | merged | mixmix |
| 2022-07-07 | !5 | Staltz metakeyring | merged | mixmix |
| 2022-06-21 | !4 | Draft: Box2ready | closed | mixmix |
| 2022-06-09 | !3 | set license to LGPL-3.0 | merged | staltz |
| 2021-09-13 | !2 | add processPOBox | merged | mixmix |
| 2021-09-01 | !1 | Pobox | merged | mixmix |
