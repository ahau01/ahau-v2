# ahau-lib-ssb-plugins-ssb-submissions

GitLab: `ahau/lib/ssb-plugins/ssb-submissions`  
GitHub: `MakingEverythingAchievableNZ/ssb-submissions`  
23 MRs, 1 issues (1 open) — activity 2022-12-01 to 2023-11-27

## Open issues — unresolved, inherited as-is

### #1 Linked submissions! (ISSUE, opened, 2023-03-31)

Proposes how to support multi-part submissions (e.g. create a new profile then link it) since the current submissions API only allows one record part plus one submission part; weighs option A, a multi-part submission with an ordered list of record parts that can reference earlier parts like $id_0, against option B, separate 'linked' submissions where one submission declares a dependency on another and its recordDetails can reference a $dependency placeholder that gets swapped for the real id once the dependency is approved.
- category: `decision`
- ⚠ gotcha: Placeholder references like $dependency may fail schema validation; proposed workarounds are swapping in a dummy id for validation then restoring it, or ignoring validation errors tied to the placeholder.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-submissions/-/work_items/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-submissions/-/work_items/1)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2023-11-27 | !23 | Upgrade to db2 | merged | powersource |
| 2023-10-02 | !22 | test how submissions work for whakapapa views | merged | chereseeriepa |
| 2023-07-05 | !21 | More info | merged | chereseeriepa |
| 2023-07-05 | !20 | add source to submissions, update ssb-profile | merged | chereseeriepa |
| 2023-07-05 | !19 | WIP start adding support for web registrations | closed | chereseeriepa |
| 2023-05-29 | !18 | add link API to link submissions together | merged | chereseeriepa |
| 2023-05-24 | !17 | fix how the execute update validates record details | merged | chereseeriepa |
| 2023-05-24 | !16 | update record detail validation to accept when a parent or child in a link is missing | closed | chereseeriepa |
| 2023-05-23 | !15 | write API endpoint to execute and approve submissions | merged | chereseeriepa |
| 2023-05-08 | !14 | Handler tweaks | merged | mixmix |
| 2023-05-04 | !13 | rename targetId to sourceId | merged | chereseeriepa |
| 2023-05-02 | !12 | require groupId on submissions | merged | chereseeriepa |
| 2023-04-19 | !11 | add submissions.list | merged | chereseeriepa |
| 2023-04-06 | !10 | change how proposeEdit validate its input | merged | chereseeriepa |
| 2023-04-06 | !9 | Draft: Rename approve | closed | chereseeriepa |
| 2023-04-06 | !8 | Draft: added 'accepting a submission that doesn't exist' test and started on... | closed | chereseeriepa |
| 2023-03-30 | !7 | update propose tombstone | merged | chereseeriepa |
| 2023-03-29 | !6 | Update tombstone tests | merged | chereseeriepa |
| 2023-03-28 | !5 | update proposeEdit function and tests | merged | chereseeriepa |
| 2023-03-24 | !4 | Update propose new tests | merged | chereseeriepa |
| 2023-03-23 | !3 | Draft: update tests | closed | chereseeriepa |
| 2023-01-30 | !2 | added 'accepting a submission that doesn't exist' test and started on... | merged | twoBitSoda |
| 2022-12-01 | !1 | Added tests, added accept | merged | twoBitSoda |
