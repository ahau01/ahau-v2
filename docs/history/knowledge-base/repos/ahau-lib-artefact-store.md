# ahau-lib-artefact-store

GitLab: `ahau/lib/artefact-store`  
GitHub: `MakingEverythingAchievableNZ/artefact-store`  
28 MRs, 1 issues (1 open) — activity 2021-01-06 to 2024-02-11

## Open issues — unresolved, inherited as-is

### #1 refactor code to use latest version of hyper* (ISSUE, opened, 2024-02-08)

Tracking issue to upgrade artefact-store to the latest hyper-* tooling used by artefact-server for implementing hyper-ssb-blobs. The legacy hyper community bootstrap nodes the library relied on were retired, and recreating them is undocumented and difficult, so upgrading to current software/bootstrap nodes is seen as the better path forward.
- category: `infra`
- ⚠ gotcha: Legacy bootstrap nodes were retired and recreating them is undocumented and difficult.
- [https://gitlab.com/ahau/lib/artefact-store/-/work_items/1](https://gitlab.com/ahau/lib/artefact-store/-/work_items/1)

## Notable changes

### !29 wip: add hyper-sdk (MR, opened, 2024-02-11)

Adds hyper.sdk and attempts to get the first test passing, explicitly described as unworking, work-in-progress code shared as a snapshot in time rather than a finished change.
- category: `feature`
- ⚠ gotcha: Code is explicitly unworking/WIP; author intends to clean it up in further commits.
- [https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/29](https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/29)

### !26 Add additional test to check for change in remote drive size after reconnect (MR, opened, 2021-09-02)

Adds a test to check for an inconsistency where the reported remote drive size changes after a reconnect, reproducing an issue also referenced in ssb-hyper-blobs merge request 10.
- category: `bug`
- [https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/26](https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/26)

### !15 Offer more information about connected peers (MR, merged, 2021-02-23)

Adds a method and two events exposing information about connected peers, including noise public keys, IP addresses, and associated hyperdrive info drawn from the hyper-* stack. Notes these raw peer objects could later be mapped to simpler objects, and that noise public keys can be mapped to drive addresses via crypto_sign_ed25519_pk_to_curve25519 for clearer peer identification.
- category: `feature`
- ⚠ gotcha: Exposes raw peer connection data (IPs, noise keys) rather than a simplified, purpose-built object.
- [https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/15](https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/15)

### !14 uncomment parts which speed up making connections (MR, opened, 2021-02-23)

Uncomments code to speed up connection setup: when connecting one's own drive, stop waiting once the 'opened' event fires; when connecting to others' drives, stop waiting for 'flush' if either 'peer-add' or 'flush' occurs. Merge is intentionally deferred until the team is confident the change works, so it can be determined whether any resulting issues are new or pre-existing.
- category: `refactor`
- ⚠ gotcha: Merge deliberately held back until behavior is verified, to isolate whether this change causes or merely reveals existing breakage.
- [https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/14](https://gitlab.com/ahau/lib/artefact-store/-/merge_requests/14)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-02-10 | !28 | Test and change the bootstrap servers | merged | powersource |
| 2023-02-28 | !27 | Upgrade | merged | mixmix |
| 2021-06-26 | !25 | addFileStream receives a readstream as input | merged | romuloalves |
| 2021-06-16 | !24 | check sparse replication only when reading files | merged | mixmix |
| 2021-06-13 | !23 | Bug in driveSize function | merged | chereseeriepa |
| 2021-06-09 | !22 | refactor loading of drives | merged | mixmix |
| 2021-06-08 | !21 | update hyperdrive | closed | mixmix |
| 2021-05-25 | !20 | artefactStore.fileStats and tests | merged | chereseeriepa |
| 2021-05-06 | !19 | Get All Files By Drive | merged | chereseeriepa |
| 2021-03-04 | !18 | Tweaks | merged | mixmix |
| 2021-03-01 | !17 | READEME tweaks, linting | merged | mixmix |
| 2021-02-26 | !16 | Add hyperdrive's drive.ready to getDrive | merged | aeluteia |
| 2021-02-16 | !13 | export pataka code | merged | pegpeg |
| 2021-02-15 | !12 | add debug logging | merged | pegpeg |
| 2021-01-25 | !11 | upgrade sodium native to version 3 | merged | aeluteia |
| 2021-01-19 | !10 | tweaks | merged | mixmix |
| 2021-01-19 | !8 | async/await example.js | merged | pegpeg |
| 2021-01-18 | !7 | File size | merged | aeluteia |
| 2021-01-17 | !6 | Load drives test | merged | aeluteia |
| 2021-01-16 | !5 | DHT bootstrap nodes | merged | pegpeg |
| 2021-01-11 | !4 | fix encrypt.test.js | merged | pegpeg |
| 2021-01-11 | !3 | Dht connect speed | merged | pegpeg |
| 2021-01-08 | !2 | Test remove | merged | aeluteia |
| 2021-01-06 | !1 | add total size function as a utility function for tests | merged | pegpeg |
