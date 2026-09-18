# ahau-lib-ssb-plugins-ssb-profile

GitLab: `ahau/lib/ssb-plugins/ssb-profile`  
GitHub: `MakingEverythingAchievableNZ/ssb-profile`  
75 MRs, 2 issues (2 open) — activity 2019-11-22 to 2024-04-10

## Open issues — unresolved, inherited as-is

### #2 Update changelog (ISSUE, opened, 2023-12-01)

The changelog is missing several released versions and needs to be brought up to date.
- category: `chore`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/work_items/2](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/work_items/2)

### #1 More fully explore implications of Tombstone (ISSUE, opened, 2019-12-05)

Raises open questions about how tombstoning records should behave, including whether updates should be blocked on tombstoned records, how it affects link-identity/find-by-feedId, and downstream in ssb-whakapapa what happens when a person mid-tree is deleted, whether deleting a profile auto-deletes its link, whether a link can be deleted without deleting the profile (leaving 'hanging profiles'), and how relationship links should be edited.
- category: `decision`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/work_items/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/work_items/1)

## Notable changes

### !71 Optimize Find (MR, merged, 2024-01-25)

Attempts to optimize the Find method from issue #34 by exploring ssb-search2 integration; the author started patching ssb-search2 upstream but judged that out of scope for that module, so submits this MR as an alternative optimization instead.
- category: `refactor`
- ⚠ gotcha: Author is unsure this MR is optimization enough; a custom db plugin might still be needed.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/71](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/71)

### !62 Person Custom Fields for files (MR, merged, 2023-07-12)

Adds a new custom field type ('group' and 'admin') on Person profiles to support attaching files, allowing customFields entries with a type (document, video, audio, photo) and a Blob or HyperBlob, either as a single entry or an array of multiple.
- category: `feature`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/62](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/62)

### !61 Community Custom Field Definitions for files (MR, merged, 2023-07-12)

Adds a new custom field definition type ('public') on Community profiles to support file uploads, letting a definition specify fileType (document/video/audio/photo), label, description, multiple, visibleBy, and order.
- category: `feature`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/61](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/61)

### !34 Profile split (MR, merged, 2021-07-06)

Removes the generic 'profile' type and replaces it with four distinct types: publicPerson, privatePerson, publicCommunity, and privateCommunity, splitting the original test suite across them with heavier coverage on the private types since they have more fields. The author considered restoring a generic ssb.profile.create/update/get wrapper that dispatches to the right type to avoid rewriting GraphQL, but this remains a breaking change since arbitrary/generic profiles are no longer supported.
- category: `refactor`
- ⚠ gotcha: Breaking change: the generic profile type is removed, so any code relying on arbitrary profile types will break.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/34](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/34)

### !17 fails when opts.getProfile is given, changed to return results (MR, merged, 2020-09-09)

Fixes a TypeError ('Cannot read property length of undefined' on res.recps.length) in find-profile-by-feed-id that occurred when a custom opts.getProfile getter was supplied that only returned profileIds, since the code then tried to read recps off a result missing that field.
- category: `bug`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/17](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/17)

### !13 Find profiles (MR, merged, 2020-06-29)

Modifies the API to support claiming multiple profiles across different spheres (e.g. personal, group), returning all linked profiles and including a 'recps' scope on anything using getProfile; also reformats the underlying link message to match the format used in whakapapa work.
- category: `feature`
- ⚠ gotcha: Breaking API change requiring a major version bump, affecting @ssb-graphql/profile and main.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/13](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/13)

### !1 Private profiles (MR, merged, 2019-11-22)

Adds the ability to create, update, and read private profiles by publishing to specific recipients (recps), initially limited to yourself or a small set of friends, with the same API intended to later support private groups by simply passing a group id. Also updates the link method (connecting a feedId to a profile) to block publicly linking a private profile to one's feed.
- category: `feature`
- ⚠ gotcha: Users are currently blocked from publicly linking a private profile to their feed.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-profile/-/merge_requests/1)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-04-10 | !75 | fix bug where find method failed when it came across an empty profile field | merged | chereseeriepa |
| 2024-04-09 | !74 | fixes | merged | chereseeriepa |
| 2024-04-09 | !73 | Draft: Search2 find | closed | chereseeriepa |
| 2024-03-03 | !72 | Change Custom Field Order type | closed | chereseeriepa |
| 2023-12-13 | !70 | change custom field def fileType to allow multiple | merged | chereseeriepa |
| 2023-12-11 | !69 | Update ssb-crut | merged | mixmix |
| 2023-12-05 | !68 | add issuesVerifiedCredentials to community public profile | merged | chereseeriepa |
| 2023-11-29 | !67 | Allow Verified Credentials - Community Public Profile | merged | chereseeriepa |
| 2023-11-10 | !66 | Draft: Fix ci on db2 branch | closed | powersource |
| 2023-11-09 | !65 | More db2 adaptations | merged | powersource |
| 2023-11-02 | !64 | Db refactor | closed | zachmandeville |
| 2023-10-31 | !63 | Db2 refactor | merged | mixmix |
| 2023-07-04 | !60 | add source to person group and admin profiles | merged | chereseeriepa |
| 2022-09-01 | !59 | Custom Field - Date | merged | chereseeriepa |
| 2022-07-07 | !58 | allow community.customField list.multiple | merged | chereseeriepa |
| 2022-06-30 | !57 | allow tombstoning of custom fields | merged | chereseeriepa |
| 2022-06-07 | !56 | Custom Fields - Person | merged | chereseeriepa |
| 2022-05-25 | !55 | Custom fields - Community | merged | chereseeriepa |
| 2022-05-10 | !54 | add fields to community profiles | merged | chereseeriepa |
| 2022-04-20 | !53 | Crut upgrade | merged | mixmix |
| 2022-04-12 | !52 | allow search to find profiles with or without macrons | merged | chereseeriepa |
| 2021-12-02 | !51 | Find deeper | merged | mixmix |
| 2021-11-02 | !50 | extend find with more opts | merged | mixmix |
| 2021-11-01 | !49 | add opts to findFeedsByProfileId - selfLinkOnly | merged | mixmix |
| 2021-10-28 | !48 | Diagram | merged | mixmix |
| 2021-10-28 | !47 | Link unowned profiles | merged | chereseeriepa |
| 2021-10-20 | !46 | allow person.admin.profile to be sent to group only | merged | mixmix |
| 2021-09-23 | !45 | filter admin groups from findByGroupId | closed | chereseeriepa |
| 2021-09-22 | !44 | make sure each profile type is encrypted to EXACTLY the right sort of recps | merged | mixmix |
| 2021-09-15 | !43 | Shared profiles | merged | Tairea |
| 2021-09-10 | !42 | write tests for fixLinkCreateArgs input | merged | chereseeriepa |
| 2021-09-09 | !41 | add support for linking profiles outside of a group | merged | chereseeriepa |
| 2021-09-09 | !40 | rename dmKey to poBoxId, update the pattern for this field in the spec | merged | chereseeriepa |
| 2021-08-25 | !39 | link/group-profile meta data parentGroupId | merged | chereseeriepa |
| 2021-08-24 | !38 | Refactor Links | merged | chereseeriepa |
| 2021-08-10 | !37 | subgroup dmkey on community profile | merged | chereseeriepa |
| 2021-07-19 | !36 | modify link.create API (patch), allow linking on behalf of others | merged | mixmix |
| 2021-07-13 | !35 | add profile/pataka, fix bugs | merged | mixmix |
| 2021-06-29 | !33 | Private Person Spec | merged | chereseeriepa |
| 2021-06-11 | !32 | allow null for image schema | merged | chereseeriepa |
| 2021-06-10 | !31 | expand spec to allow clearing fields to null | merged | mixmix |
| 2021-06-02 | !30 | ssb-crut-authors v2.0.2 with tombstone support | merged | chereseeriepa |
| 2021-04-19 | !29 | Find Feeds By Profile | merged | chereseeriepa |
| 2021-02-25 | !28 | Add Profile Fields | merged | chereseeriepa |
| 2021-02-09 | !27 | allow empty altnames | merged | mixmix |
| 2021-02-08 | !26 | Additional Profile Fields | merged | chereseeriepa |
| 2021-02-02 | !25 | Custom forms | merged | chereseeriepa |
| 2021-01-14 | !24 | WIP: Joining questions field | closed | chereseeriepa |
| 2020-11-05 | !23 | extract authors logic into ssb-crut-authors | merged | mixmix |
| 2020-11-04 | !22 | Crut | merged | mixmix |
| 2020-11-03 | !21 | misc updating methods to fix errors with new crut | merged | mixmix |
| 2020-11-02 | !20 | Draft: WIP updated spec | closed | chereseeriepa |
| 2020-10-27 | !19 | Author tweaks | merged | chereseeriepa |
| 2020-10-04 | !18 | Authors complex set | closed | chereseeriepa |
| 2020-08-04 | !16 | added feedId to profile | merged | luandro |
| 2020-07-28 | !15 | add "findByGroupId" | merged | mixmix |
| 2020-07-23 | !14 | Link group profile | merged | mixmix |
| 2020-05-21 | !12 | Dates change | merged | mixmix |
| 2020-04-06 | !11 | added deceased, phone, email, address | merged | Tairea |
| 2020-03-21 | !10 | Added new profile fields | merged | Tairea |
| 2020-02-10 | !9 | TypeError in find.js | merged | chereseeriepa |
| 2020-01-30 | !8 | added orderOfBirth, updated tests, fixed typo | merged | chereseeriepa |
| 2020-01-15 | !7 | added diedAt | merged | chereseeriepa |
| 2020-01-14 | !6 | find-by-name | merged | mixmix |
| 2020-01-14 | !5 | Date picker update | merged | chereseeriepa |
| 2020-01-06 | !4 | added bornAt | merged | mixmix |
| 2019-12-05 | !3 | Tombstone | merged | mixmix |
| 2019-11-24 | !2 | add gender to profiles | merged | mixmix |
