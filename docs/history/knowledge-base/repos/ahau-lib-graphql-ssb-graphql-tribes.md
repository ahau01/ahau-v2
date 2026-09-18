# ahau-lib-graphql-ssb-graphql-tribes

GitLab: `ahau/lib/graphql/ssb-graphql-tribes`  
GitHub: `MakingEverythingAchievableNZ/ssb-graphql-tribes`  
17 MRs, 0 issues (0 open) — activity 2020-07-09 to 2024-01-19

## Notable changes

### !12 Kaitiaki applications (MR, merged, 2021-10-03)

Replaces the old 'applications' concept with ssb-tribes-registration: a profile/person/admin record is published with the registration; on approval a group-profile is created from the admin-profile and linked to the applicant, and on decline the admin-profile is tombstoned. The GraphQL API stays almost the same but a few unneeded fields were removed.
- category: `feature`
- ⚠ gotcha: Removed GraphQL fields make this likely a major version bump; the new applicant link only shows up in findByFeedId if selfLinkOnly is set to false, and auto-private-profile still needs a follow-up fix to copy that link.
- [https://gitlab.com/ahau/lib/graphql/ssb-graphql-tribes/-/merge_requests/12](https://gitlab.com/ahau/lib/graphql/ssb-graphql-tribes/-/merge_requests/12)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-01-19 | !17 | Upgrade to db2 | merged | powersource |
| 2023-02-14 | !16 | add support for custom field type dates | merged | chereseeriepa |
| 2022-09-21 | !15 | Custom Field - Visible By | merged | chereseeriepa |
| 2022-07-21 | !14 | Custom Fields | merged | chereseeriepa |
| 2022-07-21 | !13 | update all outdated devDependencies | closed | chereseeriepa |
| 2021-09-28 | !11 | upgrade testing | merged | mixmix |
| 2021-09-15 | !10 | sugroup api tweaks | merged | chereseeriepa |
| 2021-08-17 | !9 | subgroups API + tests | merged | chereseeriepa |
| 2021-06-28 | !8 | Applicant | merged | chereseeriepa |
| 2021-02-22 | !7 | Decline Group Applications | merged | chereseeriepa |
| 2021-02-15 | !6 | Application API Update | merged | chereseeriepa |
| 2020-09-05 | !5 | Broken tape (for maintainers) | closed | mixmix |
| 2020-09-04 | !4 | add listGroupAuthors | merged | mixmix |
| 2020-07-31 | !3 | Group application | merged | luandro |
| 2020-07-13 | !2 | Add inviteToGroup() API | closed | christianbundy |
| 2020-07-09 | !1 | Get list | merged | christianbundy |
