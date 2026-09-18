# ahau-lib-graphql-ssb-graphql-profile

GitLab: `ahau/lib/graphql/ssb-graphql-profile`  
GitHub: `MakingEverythingAchievableNZ/ssb-graphql-profile`  
93 MRs, 1 issues (1 open) — activity 2020-01-26 to 2024-04-10

## Open issues — unresolved, inherited as-is

### #1 Remove cache (ISSUE, opened, 2024-04-10)

Proposes removing a cache, following discussion in a note on merge request 88.
- category: `refactor`
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/work_items/1](https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/work_items/1)

## Notable changes

### !82 Tombstone Person (MR, merged, 2023-03-21)

Adds a tombstone-person endpoint with role-dependent cascade behavior: when a member deletes a group profile, only that profile is deleted (the linked admin profile is left alone since the member lacks access to it); when a kaitiaki deletes a group profile, the linked admin profile is also found and deleted, and likewise deleting an admin profile as kaitiaki also deletes its linked group profile.
- category: `feature`
- ⚠ gotcha: Deletion cascades differently by role: members leave linked admin profiles intact, but kaitiaki deletions cascade to linked profiles.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/merge_requests/82](https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/merge_requests/82)

### !81 Create Admin Profile (MR, merged, 2023-03-08)

Fixes a bug preventing direct creation of an admin profile, reproduced by creating a kaitiaki-only whakapapa and importing a CSV with custom fields, which errored around groupDetails. Root cause was that the savePerson create logic incorrectly sorted fields into groupDetails/adminDetails, dropping fields and throwing; the fix required looking up the admin group's parent group to find the correct custom field definitions and determine where each field should be saved.
- category: `bug`
- ⚠ gotcha: savePerson needs the admin group's parent group to correctly resolve custom field definitions for groupDetails vs adminDetails.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/merge_requests/81](https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/merge_requests/81)

### !15 Profile links + Tribes (MR, merged, 2020-07-28)

Adds saveProfileLink to link a profile to a feedId or groupId, and adds a tribes query that fetches all community profiles linked to a group; removes the outdated communities query (replaced by tribes) and the unused persons query, which is noted as needing a future overhaul if brought back.
- category: `feature`
- ⚠ gotcha: Breaking change requiring a major version bump; removes the communities and persons queries.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/merge_requests/15](https://gitlab.com/ahau/lib/graphql/ssb-graphql-profile/-/merge_requests/15)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-04-10 | !94 | update ssb-graphql-main | merged | chereseeriepa |
| 2024-03-04 | !93 | Update Custom Field Ordering | merged | chereseeriepa |
| 2024-01-31 | !92 | fix listPerson to work with latest crut.list | merged | mixmix |
| 2024-01-31 | !91 | fix listPerson for crut@5 | merged | mixmix |
| 2023-12-13 | !90 | change fileType to support multiple types | merged | chereseeriepa |
| 2023-12-13 | !89 | Person custom field file | merged | chereseeriepa |
| 2023-12-06 | !88 | Upgrade to db2 | merged | powersource |
| 2023-12-05 | !87 | add issuesVerifiedCredentials to community public profile | merged | chereseeriepa |
| 2023-11-29 | !86 | Allow Verified Credentials - Community Public Profile | merged | chereseeriepa |
| 2023-07-12 | !85 | Community Custom Field Definition for Files | merged | chereseeriepa |
| 2023-07-04 | !84 | add source field to person profiles | merged | chereseeriepa |
| 2023-05-17 | !83 | add ability to see blocked patakas | merged | mixmix |
| 2023-03-05 | !80 | upgrade modules | merged | mixmix |
| 2023-02-19 | !79 | add PatakaProfileInput | merged | mixmix |
| 2023-02-14 | !78 | Update custom fields | merged | chereseeriepa |
| 2022-09-07 | !77 | Draft: Speed up bulk update | closed | chereseeriepa |
| 2022-09-01 | !76 | Custom Field - Date | merged | chereseeriepa |
| 2022-08-09 | !75 | dont allow custom fields on bulk update | merged | chereseeriepa |
| 2022-07-18 | !74 | tidy up tests, use test helpers | merged | chereseeriepa |
| 2022-07-07 | !73 | allow custom field list to have a multiple flag | merged | chereseeriepa |
| 2022-06-30 | !72 | plug in the ability to tombstone custom fields | merged | chereseeriepa |
| 2022-06-22 | !71 | separate fixInput methods for savePerson and saveCommunity | merged | chereseeriepa |
| 2022-06-22 | !70 | write method to saveCommunity | merged | chereseeriepa |
| 2022-06-22 | !69 | Custom Fields - Person | merged | chereseeriepa |
| 2022-06-21 | !68 | Split saveProfile | merged | chereseeriepa |
| 2022-06-07 | !67 | Custom fields | merged | chereseeriepa |
| 2022-06-06 | !66 | Update Profile typeDefs | merged | chereseeriepa |
| 2022-05-17 | !65 | Draft: WIP: Bug editing admin fields in your personal group | closed | chereseeriepa |
| 2022-05-10 | !64 | Toggle Community Features | merged | chereseeriepa |
| 2022-05-10 | !63 | Duplicate Admin Profile Bug | merged | chereseeriepa |
| 2022-04-21 | !62 | Upgrade crut | merged | mixmix |
| 2021-12-07 | !61 | No Admin Subgroup Bug | merged | chereseeriepa |
| 2021-11-22 | !60 | WIP: tombstoning profiles | closed | chereseeriepa |
| 2021-11-12 | !59 | Admin profile cache fix | merged | mixmix |
| 2021-11-10 | !58 | have query { person } use unowned admin links | merged | mixmix |
| 2021-11-02 | !57 | Extend find person | merged | mixmix |
| 2021-10-27 | !56 | Update unowned test | merged | chereseeriepa |
| 2021-10-27 | !55 | WIP: add admin-only profiles for unowned profiles, as required | closed | chereseeriepa |
| 2021-10-19 | !54 | dont complain when didnt find an admin subgroup | merged | chereseeriepa |
| 2021-10-13 | !53 | update outdated dev dependencies + update tests | closed | chereseeriepa |
| 2021-10-13 | !52 | add adminProfile query to person | merged | chereseeriepa |
| 2021-10-06 | !51 | Bulk update | merged | chereseeriepa |
| 2021-10-06 | !50 | Draft: attempt to fix bulk update | merged | chereseeriepa |
| 2021-09-23 | !49 | WIP: Admin profile | closed | chereseeriepa |
| 2021-09-22 | !48 | Upgrade profiles | merged | mixmix |
| 2021-09-16 | !47 | link.create parentGroupId | merged | chereseeriepa |
| 2021-08-23 | !46 | Subgroups Profiles | merged | chereseeriepa |
| 2021-08-12 | !45 | add dmkey to community profiles | merged | chereseeriepa |
| 2021-07-14 | !44 | pataka profile type | merged | chereseeriepa |
| 2021-07-13 | !43 | Profile upgrade | merged | mixmix |
| 2021-06-29 | !42 | Private Person API | merged | chereseeriepa |
| 2021-06-26 | !41 | failing test for the bug | merged | chereseeriepa |
| 2021-06-17 | !40 | Draft: Community crut types | closed | chereseeriepa |
| 2021-06-14 | !39 | Tombstone Public Profile in saveProfile | merged | BlakeAkapita |
| 2021-06-09 | !38 | bound update of public profiles | merged | mixmix |
| 2021-06-09 | !37 | Added tombstone of public profile in saveProfile mutation | closed | BlakeAkapita |
| 2021-05-18 | !36 | Update whoami resolver | merged | chereseeriepa |
| 2021-04-23 | !35 | check for a uri when resolving the image | merged | chereseeriepa |
| 2021-04-20 | !34 | Find Persons Update | merged | chereseeriepa |
| 2021-03-08 | !33 | do Image { uri } the graphql way (duhh) | merged | mixmix |
| 2021-02-25 | !32 | Profile Fields Updates | merged | chereseeriepa |
| 2021-02-14 | !31 | Profile Query | merged | chereseeriepa |
| 2021-02-08 | !30 | Additional profile fields | merged | chereseeriepa |
| 2021-02-03 | !29 | Custom forms | merged | chereseeriepa |
| 2020-11-26 | !28 | Extract Authors into ssb-ahau | merged | chereseeriepa |
| 2020-11-11 | !27 | default tiaki is original author | merged | chereseeriepa |
| 2020-11-05 | !26 | authors + crut ssb-profile | merged | chereseeriepa |
| 2020-10-08 | !25 | Draft: Authors field | closed | chereseeriepa |
| 2020-09-23 | !24 | Patakas | merged | Tairea |
| 2020-09-22 | !23 | fix canEdit on commmunity | merged | chereseeriepa |
| 2020-09-22 | !22 | Add community fields | merged | chereseeriepa |
| 2020-09-14 | !21 | Connections | merged | mixmix |
| 2020-09-08 | !20 | Save current identity | merged | chereseeriepa |
| 2020-08-25 | !19 | add recps to find persons query, add tests | merged | chereseeriepa |
| 2020-08-14 | !18 | Test person | merged | mixmix |
| 2020-08-04 | !17 | Person type with feedId | merged | luandro |
| 2020-07-28 | !16 | change canEdit to use feedId | merged | chereseeriepa |
| 2020-07-25 | !14 | fix profile cache | merged | mixmix |
| 2020-07-20 | !13 | add getTiaki as getterWithCache | merged | chereseeriepa |
| 2020-07-12 | !12 | Recps guard | merged | mixmix |
| 2020-07-02 | !11 | remove context function | merged | mixmix |
| 2020-07-02 | !10 | add "unbox" field to avatarImage + headerImage | merged | mixmix |
| 2020-05-26 | !9 | change dates | merged | mixmix |
| 2020-04-06 | !7 | updated typedefs to include deceased, phone, email, address | merged | Tairea |
| 2020-03-21 | !6 | Add profile fields | merged | Tairea |
| 2020-02-19 | !5 | added function to convert Int to Date | merged | chereseeriepa |
| 2020-02-11 | !4 | Search by name | merged | chereseeriepa |
| 2020-01-30 | !3 | added orderOfBirth updates | merged | chereseeriepa |
| 2020-01-29 | !2 | altNames updates | merged | chereseeriepa |
| 2020-01-26 | !1 | Review | merged | mixmix |
