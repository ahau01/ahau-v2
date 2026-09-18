# ahau-lib-ssb-crut

GitLab: `ahau/lib/ssb-crut`  
GitHub: `MakingEverythingAchievableNZ/ssb-crut`  
41 MRs, 9 issues (3 open) — activity 2020-10-28 to 2023-12-12

## Open issues — unresolved, inherited as-is

### #9 Clarify errs (ISSUE, opened, 2023-09-17)

Errors bubbling up from deep inside crut produce unhelpful stack traces, forcing the reporter to add console.logs inside node_modules to trace the problem; suggests adopting a library like clarify-error to get more useful error output.
- category: `chore`
- [https://gitlab.com/ahau/lib/ssb-crut/-/work_items/9](https://gitlab.com/ahau/lib/ssb-crut/-/work_items/9)

### #8 README isValidUpdate (ISSUE, opened, 2023-05-08)

The README documents a property called isValidUpdate and points to ssb-crut-authors as an example of its use, but the reporter believes this is a documentation mistake and the correct name should be isValidNextStep.
- category: `chore`
- [https://gitlab.com/ahau/lib/ssb-crut/-/work_items/8](https://gitlab.com/ahau/lib/ssb-crut/-/work_items/8)

### #5 tombstone merge conflict (ISSUE, opened, 2022-01-25)

Notes that a tangle can end up in a branched conflict state, which could cause crut.tombstone to fail if the conflict is left unresolved; suggests finding a way to guarantee tombstone always succeeds.
- category: `bug`
- ⚠ gotcha: crut.tombstone can fail when a tangle is in an unresolved branched conflict state.
- [https://gitlab.com/ahau/lib/ssb-crut/-/work_items/5](https://gitlab.com/ahau/lib/ssb-crut/-/work_items/5)

## Notable changes

### #4 isValidNextStep could use ssb (ISSUE, closed, 2022-01-11)

While writing a more complex validator, the reporter needed access to the ssb server instance, but isValidNextStep currently only receives context (accT and graph) from @tangle/reduce; proposes passing server through as well via a small change to resolve-tangle.js and handle-publish.js.
- category: `feature`
- [https://gitlab.com/ahau/lib/ssb-crut/-/work_items/4](https://gitlab.com/ahau/lib/ssb-crut/-/work_items/4)

### #3 optionalProps (ISSUE, closed, 2022-01-11)

While working on fusion identities, the reporter noticed some message transformations (e.g. the proof property on a proof-of-key transformation) carry extra info that shouldn't appear in the final state; since staticProps only applies to the root message, proposes adding an optionalProps mechanism that behaves like staticProps but is excluded from read output.
- category: `decision`
- [https://gitlab.com/ahau/lib/ssb-crut/-/work_items/3](https://gitlab.com/ahau/lib/ssb-crut/-/work_items/3)

### !16 Allow create / update to include keys for meta feeds (MR, closed, 2021-11-25)

While building a 'groupies' project needing to edit group titles/rooms via crut, the author found crut only allowed publishing with the main SSB identity's keys; this MR changes the create and update methods to accept a keys parameter, enabling crut to be used with meta feeds (per the ssb-meta-feeds-spec).
- category: `feature`
- [https://gitlab.com/ahau/lib/ssb-crut/-/merge_requests/16](https://gitlab.com/ahau/lib/ssb-crut/-/merge_requests/16)

### !13 Use equal instead of slowEqual for db2 (MR, merged, 2021-10-04)

While working on fusion identities, the author found that since these cruts share the same type, root: null can be used to find the root/initial message of a tangle instead of relying on type, which lets queries reuse the automatically created index; switches from slowEqual to equal for db2 accordingly. Kept as a draft pending a cleaner solution for reusing the seeker+equal approach elsewhere.
- category: `refactor`
- ⚠ gotcha: bipf is used but not declared as a package.json dependency, since it's only needed for db2 — flagged by the author as 'a bit sneaky'.
- [https://gitlab.com/ahau/lib/ssb-crut/-/merge_requests/13](https://gitlab.com/ahau/lib/ssb-crut/-/merge_requests/13)

### !11 Db2 (MR, merged, 2021-08-19)

Adds ssb-db2 support to ssb-crut (needed for a fusion identity library), with most changes made in resolve-tangle; existing tests needed updating because db2, unlike db1, doesn't JSON stringify/decode to strip undefined values such as recps. Intended to leave existing db1 functionality unaffected.
- category: `feature`
- ⚠ gotcha: db2 doesn't strip undefined values (e.g. recps) via JSON stringify/decode the way db1 does, requiring test changes.
- [https://gitlab.com/ahau/lib/ssb-crut/-/merge_requests/11](https://gitlab.com/ahau/lib/ssb-crut/-/merge_requests/11)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2023-12-12 | !41 | add opts.alwaysIncludeStates | merged | mixmix |
| 2023-12-08 | !40 | No states | merged | mixmix |
| 2023-12-08 | !39 | refactor defaultPublish (BREAKING) | merged | mixmix |
| 2023-11-27 | !38 | Adapt to ssb-tribes with db2 | merged | powersource |
| 2023-11-13 | !37 | Draft: Adapt guard allowPublic arg to ssb.db.create | closed | powersource |
| 2023-04-27 | !36 | getTransformation(msg, d) - add distance back in for @tangle/linear-append | merged | mixmix |
| 2023-03-29 | !35 | Draft: Tombstone Error | closed | chereseeriepa |
| 2022-09-19 | !34 | Change from agpl to lgpl | merged | powersource |
| 2022-06-02 | !33 | add opts.groupId to #list | merged | mixmix |
| 2022-04-21 | !32 | list opts.read | merged | mixmix |
| 2022-04-12 | !31 | Transformation props | merged | arj03 |
| 2022-04-11 | !30 | Make ssb available in isValidNextStep | merged | arj03 |
| 2022-04-11 | !29 | better error handling in list on limit | merged | arj03 |
| 2022-04-05 | #7 | opts.limit check if integer | closed | arj03 |
| 2022-03-16 | !28 | opts.orderBy = updateTime | merged | mixmix |
| 2022-03-16 | !27 | opts.filter | merged | mixmix |
| 2022-03-16 | !26 | write forceUpdate demo code | merged | mixmix |
| 2022-03-10 | !25 | add crut.list | merged | mixmix |
| 2022-01-26 | #6 | tombstone needs undo even if it says it is optional | closed | arj03 |
| 2022-01-25 | !24 | Props collisions | merged | mixmix |
| 2022-01-25 | !23 | Merge conflicts | merged | mixmix |
| 2022-01-14 | !22 | Better db2 query refactor | merged | mixmix |
| 2022-01-12 | !21 | Read state | merged | cpilbrow |
| 2022-01-12 | !20 | upgrade isValidNextStep to handle merge | merged | mixmix |
| 2022-01-09 | #2 | Overwrite type | closed | arj03 |
| 2021-12-11 | !19 | Keys are not needed in create / update | merged | arj03 |
| 2021-12-09 | !18 | Custom publish | merged | mixmix |
| 2021-12-09 | !17 | Data | merged | cpilbrow |
| 2021-11-16 | !15 | Reduce is now passed nodes instead of msgs | merged | mixmix |
| 2021-11-15 | !14 | Data | merged | cpilbrow |
| 2021-09-08 | #1 | Better isRoot and isUpdate error messages | closed | chereseeriepa |
| 2021-09-07 | !12 | Arbitrary root | merged | mixmix |
| 2021-07-01 | !10 | refactor getTransformation to close some bugs | merged | mixmix |
| 2021-02-18 | !9 | Return promise if no callback is passed | merged | luandro |
| 2021-02-16 | !8 | add tombstone support | merged | mixmix |
| 2021-01-31 | !7 | allow custom typePattern | merged | mixmix |
| 2021-01-14 | !6 | Moar hooks | merged | mixmix |
| 2020-11-29 | !5 | change schema pattern for types | merged | chereseeriepa |
| 2020-11-04 | !4 | update guard to include recpsGuard, change get to return feedId | closed | chereseeriepa |
| 2020-10-30 | !3 | collect { ...staticProps, ...props } in crut.create | merged | mixmix |
| 2020-10-29 | !2 | Read | merged | mixmix |
| 2020-10-28 | !1 | Draft: added tests for create method | merged | chereseeriepa |
