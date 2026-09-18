# ahau-lib-ssb-plugins-ssb-hyper-blobs

GitLab: `ahau/lib/ssb-plugins/ssb-hyper-blobs`  
GitHub: `MakingEverythingAchievableNZ/ssb-hyper-blobs`  
14 MRs, 1 issues (1 open) — activity 2021-03-08 to 2024-02-19

## Open issues — unresolved, inherited as-is

### #1 Failed to auto-prune (ISSUE, opened, 2023-11-28)

CI pipeline reports the auto-prune functionality failing, with a test failure at test/prune/auto-prune.test.js:141 in the checkAutoPruned timeout handler.
- category: `bug`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/work_items/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/work_items/1)

## Notable changes

### !12 add local replication test (MR, opened, 2023-09-05)

Adds a local replication test; no further description was provided.
- category: `chore`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/merge_requests/12](https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/merge_requests/12)

### !10 Draft: Add a test to demonstrate intendend behaviour with 'sparse replication' (MR, opened, 2021-08-05)

Draft adding a test intended to demonstrate a possible problem with sparse replication: when two peers follow each other and connect, they should only replicate each other's files upon explicitly requesting a specific file, and after restarting and reconnecting should not replicate any additional data - the test aims to surface a case where this expected behavior may not hold.
- category: `bug`
- ⚠ gotcha: Draft test meant to reveal a suspected sparse-replication bug where unrequested data may replicate after reconnect.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/merge_requests/10](https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/merge_requests/10)

### !7 Pataka friends (MR, merged, 2021-06-17)

Major version change to how drives are registered between peers: instead of blindly registering a peer's hyperdrive, a remote call now asks the peer for their driveAddress (which they may decline to give by replying null), and the requester then registers that address locally themselves. This inversion lets Pataka first check whether a connecting peer is someone it follows before deciding whether to replicate their data, rather than fully replicating any stranger it talks to.
- category: `feature`
- ⚠ gotcha: Major breaking version change: drive registration flow inverted, changing how peers are asked for and register drive addresses.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/merge_requests/7](https://gitlab.com/ahau/lib/ssb-plugins/ssb-hyper-blobs/-/merge_requests/7)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-02-19 | !14 | Use new artefact versions with new dht bootstrap nodes | merged | powersource |
| 2024-02-16 | !13 | Use artefact modules with new dht | merged | powersource |
| 2023-08-23 | !11 | Db2 refactor | merged | zachmandeville |
| 2021-07-18 | !9 | add api function to get auto prune config | merged | chereseeriepa |
| 2021-07-15 | !8 | create setAutoPrune method | merged | mixmix |
| 2021-06-09 | !6 | auto-prune | merged | chereseeriepa |
| 2021-06-09 | !5 | add onReady fn | merged | mixmix |
| 2021-05-31 | !4 | minor refactor, clarification of README | merged | mixmix |
| 2021-05-10 | !3 | Storage management | merged | chereseeriepa |
| 2021-04-12 | !2 | stop pataka from registering its non-existent driveAddress with peers | merged | mixmix |
| 2021-03-08 | !1 | add data-to-url helper | merged | mixmix |
