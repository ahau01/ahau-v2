# ahau-lib-graphql-ssb-graphql-submissions

GitLab: `ahau/lib/graphql/ssb-graphql-submissions`  
GitHub: `MakingEverythingAchievableNZ/ssb-graphql-submissions`  
33 MRs, 3 issues (3 open) — activity 2023-01-31 to 2024-02-07

## Open issues — unresolved, inherited as-is

### #3 Rename dependencies to dependents (ISSUE, opened, 2023-09-19)

Proposes renaming 'dependencies' to 'dependents', following discussion in a note on merge request 28.
- category: `refactor`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/work_items/3](https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/work_items/3)

### #2 Rename allowedFields (ISSUE, opened, 2023-09-19)

Proposes renaming 'allowedFields', following discussion in a note on merge request 28.
- category: `refactor`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/work_items/2](https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/work_items/2)

### #1 Dont require the groupId on some of proposal API methods (ISSUE, opened, 2023-09-19)

Proposes updating proposal API methods that take a record id (e.g. whakapapaId in proposeEditWhakapapView) so they no longer also require a groupId, per discussion in a note on merge request 28.
- category: `refactor`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/work_items/1](https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/work_items/1)

## Notable changes

### !27 fix bug rendering link updates, fix bug with tests (MR, merged, 2023-08-09)

Fixes a bug where querying a whakapapa link submission failed to resolve its targetRecord because the record wasn't in the expected format; the fix reuses the renderUpdate method already used for target profiles and adds support for additional fields. Also fixes the underlying cause of tests not running after an earlier attempt to fix it by naming the tests didn't work, eventually tracking down and fixing the actual failing test.
- category: `bug`
- ⚠ gotcha: Root cause of the targetRecord format mismatch was unclear; fixed by reusing the target-profile renderUpdate method rather than addressing the underlying format issue.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/merge_requests/27](https://gitlab.com/ahau/lib/graphql/ssb-graphql-submissions/-/merge_requests/27)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-02-07 | !33 | fix bug where you couldnt query submissions | merged | chereseeriepa |
| 2024-02-07 | !32 | Upgrade to db2 | merged | powersource |
| 2023-10-30 | !31 | fix bug where link submissions arent loading as its complaining about authors field | merged | chereseeriepa |
| 2023-10-08 | !30 | add API to propose edits to a whakapapa link | merged | chereseeriepa |
| 2023-10-04 | !29 | fix bug where ignored profiles isnt loading properly | merged | chereseeriepa |
| 2023-09-19 | !28 | add API to propose edits to a whakapapa view | merged | chereseeriepa |
| 2023-07-26 | !26 | update list method to filter out dependent submissions, add depdenancies resolver | merged | chereseeriepa |
| 2023-07-10 | !25 | allow admin-fields on proposeNewGroupPerson | merged | chereseeriepa |
| 2023-07-05 | !24 | More info | merged | chereseeriepa |
| 2023-07-05 | !23 | add source to submissions, rename existing source and target to sourceProfile and targetProfile | merged | chereseeriepa |
| 2023-07-04 | !22 | plug in profile modules for the new source field | merged | chereseeriepa |
| 2023-05-31 | !21 | Linked submissions | merged | chereseeriepa |
| 2023-05-31 | !20 | Whakapapa link | merged | chereseeriepa |
| 2023-05-30 | !19 | add API for whakapapa link submissions | closed | chereseeriepa |
| 2023-05-24 | !18 | plug in the new execute and approve endpoint | merged | chereseeriepa |
| 2023-05-22 | !17 | add api endpoint for creating and linking a profile submission | closed | chereseeriepa |
| 2023-05-21 | !16 | change format of allowedFields on approve api | merged | chereseeriepa |
| 2023-05-18 | !15 | Approve and Execute | merged | chereseeriepa |
| 2023-05-09 | !14 | update ssb-submissions, rename targetId to sourceId | merged | chereseeriepa |
| 2023-05-03 | !13 | require groupId on propose mutations | merged | chereseeriepa |
| 2023-04-30 | !12 | allow custom fields on submissions | merged | chereseeriepa |
| 2023-04-30 | !11 | allow saving and querying altNames on a submission | merged | chereseeriepa |
| 2023-04-28 | !10 | allow poBoxId on recps | merged | chereseeriepa |
| 2023-04-24 | !9 | resolve comment authors profiles | merged | chereseeriepa |
| 2023-04-23 | !8 | make recps required for all submissions, resolve the group they are encrypted to | merged | chereseeriepa |
| 2023-04-23 | !7 | resolve the target profile for a submission | merged | chereseeriepa |
| 2023-04-23 | !6 | write queries to get information about who made the submission | merged | chereseeriepa |
| 2023-04-19 | !5 | write query to get submissions | merged | chereseeriepa |
| 2023-04-12 | !4 | add recps to proposeEditGroupPerson | merged | chereseeriepa |
| 2023-04-06 | !3 | Update api and tests | merged | chereseeriepa |
| 2023-02-08 | !2 | stable build | merged | twoBitSoda |
| 2023-01-31 | !1 | Got accept submission and reject submission working | merged | twoBitSoda |
