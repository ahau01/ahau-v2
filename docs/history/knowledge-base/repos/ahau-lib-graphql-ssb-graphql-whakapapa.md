# ahau-lib-graphql-ssb-graphql-whakapapa

GitLab: `ahau/lib/graphql/ssb-graphql-whakapapa`  
GitHub: `MakingEverythingAchievableNZ/ssb-graphql-whakapapa`  
46 MRs, 3 issues (3 open) — activity 2020-01-26 to 2026-04-24

## Open issues — unresolved, inherited as-is

### #3 Adopt legal and custom partner relationship types + widen relationshipType fields in schema (ISSUE, opened, 2026-04-24)

Proposes upstreaming a downstream patch-package fix currently applied to @ssb-graphql/whakapapa@6.0.0 in the ahau desktop app: widen LinkInput.relationshipType and WhakapapaLink.relationshipType from ChildRelationshipType to String in src/typeDefs.js, and add 'legal' and 'custom' values to the PartnerRelationshipType enum, so the shared saveLink mutation and WhakapapaLink query can represent legally-recognised and culturally-defined partnerships used throughout the ahau UI (rendering, filtering, CSV import/export). Suggests a minor version bump (e.g. 6.1.0 or 7.1.0) since the change is additive and backward-compatible.
- category: `decision`
- ⚠ gotcha: Patch is pinned to v6.0.0 and silently skipped on a version bump to ^7.0.0; the mobile app has no equivalent patch, so it rejects legal/custom values.
- files mentioned: `src/typeDefs.js`, `ui/src/lib/constants.mjs`, `ui/src/store/modules/tree/lib/layout-partner-links.mjs`, `ui/src/store/modules/tree/lib/layout-secondary-links.mjs`, `ui/src/store/modules/whakapapa/get-partner-type.test.mjs`, `ui/src/store/modules/whakapapa/import-from-csv-actions.mjs`, `ui/src/store/modules/whakapapa/index.mjs`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/work_items/3](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/work_items/3)

### #2 Update error handling (ISSUE, opened, 2024-04-10)

Requests updating the GraphQL testbot to surface actual errors instead of a generic 'unexpected error' message, pointing to how ssb-ahau handles error reporting as a reference.
- category: `chore`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/work_items/2](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/work_items/2)

### #1 loadFamilyLinks is returning tombstoned links (ISSUE, opened, 2022-02-09)

Reports that loadFamilyLinks(id, extended:true) incorrectly returns links to tombstoned (deleted) profiles, including a tombstoned partner of a deleted person, even though querying person(id) { partners {...} } correctly excludes it; proposes filtering out links pointing to tombstoned profiles in loadFamilyLinks.
- category: `bug`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/work_items/1](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/work_items/1)

## Notable changes

### !34 Important Relationships Tests (MR, merged, 2021-11-22)

Adds more tests around important relationships (create/delete/update) and fixes two bugs: relationshipType on an importantRelationship wasn't detected because the code only searched links in the parent=>child direction and not child=>parent, and important relationships with no listed attributes (just a profileId) weren't being filtered out correctly.
- category: `bug`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/34](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/34)

### !25 Whakapapa Links - siblings, partners (MR, merged, 2021-03-25)

Adds a BlobInput type (fixing a failing artefacts test), a partners type and resolver with tests, and auto-generated sibling links (reused from earlier work). Restructures WhakapapaLink handling by removing profile nesting and instead adding relationshipType and legallyAdopted directly onto the person profile type, returning profiles instead of separate whakapapa-link objects to simplify how the frontend tracks relationship types between profiles; also adds a new query to fetch link info (notably linkId) for updates.
- category: `feature`
- ⚠ gotcha: Adding children to two parents in a single mutation is left unimplemented, noted as needing more design.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/25](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/25)

### !20 Fix prune function multiplying duplicates (MR, merged, 2020-07-30)

Fixes the prune() function, which had a bug causing duplicate profiles to be multiplied to fill the array instead of being deduplicated; rewritten from scratch because the original logic was hard to follow.
- category: `bug`
- ⚠ gotcha: Rewritten from scratch; the author isn't fully certain no subtle behavior from the original implementation was lost.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/20](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/20)

### !12 adds ability to get any related record (parent + child) (MR, merged, 2020-07-06)

Adds the ability to fetch related records in both directions: get-links previously only returned one-way childLinks for relatedRecords, so a related story wouldn't automatically show up on the child side; now checks for both parentId and childId and combines parentLinks and childLinks in the result.
- category: `feature`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/12](https://gitlab.com/ahau/lib/graphql/ssb-graphql-whakapapa/-/merge_requests/12)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-04-10 | !46 | plug versions in for updated modules | merged | chereseeriepa |
| 2024-01-08 | !45 | Upgrade to db2 | merged | powersource |
| 2023-10-04 | !44 | return the update id instead of original id when saving a whakapapa view | merged | chereseeriepa |
| 2022-09-23 | !43 | added permissions to whakapapa view | merged | Tairea |
| 2022-07-17 | !42 | add getDescendantLinks | merged | mixmix |
| 2022-06-16 | !41 | Benchmark | merged | mixmix |
| 2022-06-06 | !40 | Upgrade | merged | mixmix |
| 2022-05-05 | !39 | stop links from being retombstoned | merged | chereseeriepa |
| 2022-05-05 | !38 | Dont allow tombstoneProfileAndLinks to delete profiles that are the focus on a whakapapa | merged | chereseeriepa |
| 2022-02-17 | !37 | Tombstone person and links | merged | mixmix |
| 2022-02-03 | !36 | Load family | merged | mixmix |
| 2021-11-24 | !35 | install ssb-whakapapa@latest, fix tests | merged | mixmix |
| 2021-11-15 | !33 | rudementary links cache | merged | mixmix |
| 2021-11-11 | !32 | Filter views | merged | mixmix |
| 2021-11-11 | !31 | resolve type Relationship on ImportantRelationships. TODO: need to get the link | merged | chereseeriepa |
| 2021-11-07 | !30 | Authors | merged | chereseeriepa |
| 2021-10-28 | !29 | plug importantRelationships into whakapapaViews | merged | chereseeriepa |
| 2021-09-07 | !28 | added recordCount to whakapapaView | merged | Tairea |
| 2021-09-01 | !27 | fix bug where you cant query partner links using whakapapaLink | merged | chereseeriepa |
| 2021-08-31 | !26 | fix bug with tombstoned links | merged | chereseeriepa |
| 2021-01-11 | !24 | Get Tiaki bug | merged | chereseeriepa |
| 2020-12-05 | !23 | Draft: Auto generated relationships | closed | chereseeriepa |
| 2020-11-11 | !22 | Get stories | merged | chereseeriepa |
| 2020-09-01 | !21 | allow mention getter etc to fail gracefully | merged | mixmix |
| 2020-07-28 | !19 | updated deps, rm canEdit on person, change canEdit on whakapapaView to use feedId | merged | chereseeriepa |
| 2020-07-22 | !18 | Kaitiaki fields to record types | merged | chereseeriepa |
| 2020-07-21 | !17 | Updated tests | merged | chereseeriepa |
| 2020-07-19 | !16 | Can edit field | merged | chereseeriepa |
| 2020-07-13 | !15 | added artefact type document links | merged | chereseeriepa |
| 2020-07-13 | !14 | add creators to stories | merged | chereseeriepa |
| 2020-07-07 | !13 | changed links to filter tombstones before pruning | merged | chereseeriepa |
| 2020-07-01 | !11 | update deps | merged | chereseeriepa |
| 2020-06-29 | !10 | Update whakapapa links to links | merged | chereseeriepa |
| 2020-06-26 | !9 | Links named | merged | mixmix |
| 2020-06-22 | !8 | update testing setup | merged | mixmix |
| 2020-05-06 | !7 | Links | merged | chereseeriepa |
| 2020-02-25 | !6 | ignoredProfiles | merged | mixmix |
| 2020-02-13 | !5 | updated dependencies | merged | chereseeriepa |
| 2020-02-11 | !4 | Edit whakapapa | merged | Tairea |
| 2020-02-11 | !3 | updated deps | merged | chereseeriepa |
| 2020-02-10 | !2 | added relationshipId, updated ssb-whakapapa & typeDefs | merged | chereseeriepa |
| 2020-01-26 | !1 | change API to reduce duplicate caches | merged | mixmix |
