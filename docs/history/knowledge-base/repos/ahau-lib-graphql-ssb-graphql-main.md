# ahau-lib-graphql-ssb-graphql-main

GitLab: `ahau/lib/graphql/ssb-graphql-main`  
GitHub: `MakingEverythingAchievableNZ/ssb-graphql-main`  
26 MRs, 0 issues (0 open) — activity 2020-01-26 to 2024-02-16

## Notable changes

### !20 Profile migration (MR, merged, 2021-09-22)

Adds a profile migration that ensures new accounts get a profile/person/source profile in their personal group, copying details from an old profile/person record if one exists (then creating the new type and tombstoning the old one); also splits load-context.js into separate files for readability and to simulate legacy setup in tests, splits and modernizes tests to async/await.
- category: `feature`
- ⚠ gotcha: Email, phone, and address are not copied over during migration and will be lost; confirmed acceptable by Ben.
- files mentioned: `load-context.js`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-main/-/merge_requests/20](https://gitlab.com/ahau/lib/graphql/ssb-graphql-main/-/merge_requests/20)

### !9 pataka profiles for loadContext (MR, merged, 2020-09-07)

Adds a loadContext option suited to patakas: it creates a profile of type 'pataka' and skips creating a private group or private profile, which allows ssb-tribes to be removed from the pataka installation and speeds up processing since nothing needs decrypting.
- category: `feature`
- ⚠ gotcha: The pataka setup itself still needs to be modified after this is merged and published to actually take advantage of the new options.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-main/-/merge_requests/9](https://gitlab.com/ahau/lib/graphql/ssb-graphql-main/-/merge_requests/9)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-02-16 | !26 | Use hyper modules with our dht bootstrap | merged | powersource |
| 2023-12-13 | !25 | Switch to db2 | merged | powersource |
| 2023-07-12 | !24 | Blob hostname | merged | mixmix |
| 2022-07-19 | !23 | Tombstoned Linked ProfileIds | merged | chereseeriepa |
| 2022-05-05 | !22 | add a query to get all your personal profile ids | merged | chereseeriepa |
| 2021-11-28 | !21 | refactor load-context | merged | mixmix |
| 2021-09-21 | !19 | Upgrades | merged | mixmix |
| 2021-07-16 | !18 | add query + mutation for setting auto prune config | merged | chereseeriepa |
| 2021-07-13 | !17 | Profile upgrade | merged | mixmix |
| 2021-06-10 | !16 | Fix public profiles | merged | mixmix |
| 2021-05-19 | !15 | Bug upload | merged | chereseeriepa |
| 2021-05-17 | !14 | Added Auto Add Settings | merged | BlakeAkapita |
| 2021-05-12 | !13 | Tombstone Date Fix | merged | chereseeriepa |
| 2021-03-24 | !12 | Dup upload hack | merged | mixmix |
| 2021-03-08 | !11 | Hyper blobs | merged | mixmix |
| 2020-11-05 | !10 | Crut | merged | chereseeriepa |
| 2020-07-16 | !8 | updated ssb-serve-blob devDep | closed | chereseeriepa |
| 2020-07-13 | !7 | rename blob to blobId | merged | chereseeriepa |
| 2020-07-13 | !6 | WIP fix load-context | closed | mixmix |
| 2020-06-09 | !5 | updated dependencies | merged | chereseeriepa |
| 2020-06-08 | !4 | added Tombstone input+type to typeDefs | merged | chereseeriepa |
| 2020-06-07 | !3 | EdtfDate and EdtfInterval Scalars | merged | chereseeriepa |
| 2020-05-20 | !2 | Add encrypted blobs | merged | christianbundy |
| 2020-01-26 | !1 | Context fix | merged | mixmix |
