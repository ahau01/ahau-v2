# ahau-lib-ssb-plugins-ssb-whakapapa

GitLab: `ahau/lib/ssb-plugins/ssb-whakapapa`  
GitHub: `MakingEverythingAchievableNZ/ssb-whakapapa`  
24 MRs, 1 issues (1 open) — activity 2019-11-25 to 2023-12-05

## Open issues — unresolved, inherited as-is

### #1 We don't seem to be testing encryption to groups (ISSUE, opened, 2023-12-05)

A search for 'recps' shows tests only cover encrypting to feedIds, even though the README states that encryption to groups is also supported, meaning group encryption may be untested.
- category: `bug`
- ⚠ gotcha: Group encryption path appears to have no test coverage despite being documented as supported.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/work_items/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/work_items/1)

## Notable changes

### !6 Links refactor (MR, merged, 2020-05-14)

Refactors the links code to remove repetition: renames link.get to link.getLinksOfType, adds a missing README for the link API, collects validators and type info into helper objects like spec/view/index.js, and replaces the internals of child methods with link functions.
- category: `refactor`
- ⚠ gotcha: Renaming link.get to link.getLinksOfType is a breaking change that requires a corresponding update in @ssb-graphql/whakapapa.
- files mentioned: `spec/view/index.js`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/merge_requests/6](https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/merge_requests/6)

### !5 Links (MR, merged, 2020-05-03)

Adds the ability to create, get, update, and tombstone links between entities (e.g. story-artefact, story-profile, story-story), supporting typed links such as link/story-profile/mention, link/story-profile/contributor, link/story-story, and link/story-artefact to make resolver lookups easier in the graphql layer.
- category: `feature`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/merge_requests/5](https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/merge_requests/5)

### !1 Saved view (MR, merged, 2019-11-25)

Adds CRUD methods for 'saved views' (starting points for whakapapa trees) and generalizes relationship update logic, e.g. allowing a legallyAdopted status to be updated.
- category: `feature`
- ⚠ gotcha: Delete is not yet implemented for views, and the author flags server.whakapapa.child.update as a confusing name since it updates a relationship/child link rather than the child itself.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/merge_requests/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-whakapapa/-/merge_requests/1)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2023-11-28 | !24 | Remove db1 stuff and update db2 stuff | merged | powersource |
| 2023-09-19 | !23 | Return the crut API for whakapapa with the whakapapa API | merged | chereseeriepa |
| 2023-07-09 | !22 | fix accidentally uncommented line | closed | zachmandeville |
| 2023-07-05 | !21 | Db2 | merged | mixmix |
| 2022-11-21 | !20 | convert to db2 | closed | zachmandeville |
| 2022-09-23 | !19 | added permission string to whakapapa views | merged | Tairea |
| 2022-05-30 | !18 | Upgrade crut | merged | mixmix |
| 2022-02-17 | !17 | Crutify | closed | mixmix |
| 2021-11-23 | !16 | all the crut! | merged | mixmix |
| 2021-11-07 | !15 | Authors | merged | chereseeriepa |
| 2021-10-19 | !14 | add view.importantRelationships | merged | mixmix |
| 2021-10-19 | !13 | change ssb.whakapapa.view.* to use ssb-crut | merged | mixmix |
| 2021-09-06 | !12 | added recordCount to view spec | merged | Tairea |
| 2021-03-22 | !11 | partner links | merged | chereseeriepa |
| 2021-02-01 | !10 | upgrade to latest @tangle logic | merged | mixmix |
| 2020-07-24 | !9 | Fixed recps, updated test-bot | merged | chereseeriepa |
| 2020-06-30 | !8 | add tests around link/story (root) | merged | mixmix |
| 2020-05-25 | !7 | Schema refactors | merged | mixmix |
| 2020-02-14 | !4 | [[ Ignore Profiles ]] adds support for ignoredProfiles | merged | soapdog |
| 2020-02-10 | !3 | get returns relationshipId, updated tests and README | merged | chereseeriepa |
| 2020-01-09 | !2 | added image to ssb-whakapapa | merged | iantairea |
