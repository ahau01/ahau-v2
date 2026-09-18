# ahau-lib-ssb-plugins-ssb-pataka

GitLab: `ahau/lib/ssb-plugins/ssb-pataka`  
GitHub: `MakingEverythingAchievableNZ/ssb-pataka`  
20 MRs, 1 issues (1 open) — activity 2021-04-12 to 2025-04-03

## Open issues — unresolved, inherited as-is

### #1 dev pataka code throwing error in dev ahau (ISSUE, opened, 2024-03-20)

Pasting a testbot pataka invite code into a dev ahau instance throws an uncaught 'invalid ipv4 address' exception from ip.isPrivate inside ssb-conn-hub's inferPeerType, which breaks the ahau instance.
- category: `bug`
- ⚠ gotcha: Error breaks the ahau instance and reappears immediately even after dismissing it.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/work_items/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/work_items/1)

## Notable changes

### !16 temporarily hide files from the web reg form (MR, opened, 2024-03-20)

Temporarily hides files from the web registration form; no further detail given in the description.
- category: `chore`
- ⚠ gotcha: Change is explicitly described as temporary, implying the files field will need to be restored or properly fixed later.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/merge_requests/16](https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/merge_requests/16)

### !13 Update custom field order (MR, merged, 2024-02-15)

Re-implements how the profile form is generated, using custom fields (plus a default set) to build the full form with fields ordered per the custom field config or a default order, including custom setup for the WPH tribe.
- category: `feature`
- ⚠ gotcha: Untested on custom field type 'files', does not support profile images, only tested against the WPH tribe, and array/checkbox fields were forced to 12 columns as a design compromise.
- files mentioned: `plugins/web-registration.js`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/merge_requests/13](https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/merge_requests/13)

### !11 Upgrade to db2 (MR, opened, 2023-12-06)

Upgrades the module to use ssb-db2, tracked against issue #34 in the main ahau repo.
- category: `infra`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/merge_requests/11](https://gitlab.com/ahau/lib/ssb-plugins/ssb-pataka/-/merge_requests/11)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2025-04-03 | !20 | fix bug where web registration form would allow an empty submission | merged | chereseeriepa |
| 2024-09-03 | !19 | Field ordering fixes | merged | chereseeriepa |
| 2024-03-26 | !18 | Proxy | merged | mixmix |
| 2024-03-21 | !17 | Draft: Web reg https | closed | chereseeriepa |
| 2024-03-11 | !15 | update deps, remove force order over-ride | merged | mixmix |
| 2024-03-06 | !14 | Mix patch | merged | mixmix |
| 2024-01-29 | !12 | Update config | merged | chereseeriepa |
| 2023-07-27 | !10 | Custom fields | merged | mixmix |
| 2023-07-18 | !9 | fix pataka custom-fields bug | merged | mixmix |
| 2023-07-13 | !8 | Form ui | merged | mixmix |
| 2023-07-13 | !7 | README fixes, package updates | merged | mixmix |
| 2023-07-09 | !6 | Form ui | merged | chereseeriepa |
| 2023-07-05 | !5 | Web reg | merged | mixmix |
| 2023-02-14 | !4 | Upgrade | merged | mixmix |
| 2021-07-23 | !3 | update graphql server to use express graphql | merged | chereseeriepa |
| 2021-07-14 | !2 | Update ahau env | merged | mixmix |
| 2021-04-12 | !1 | update ahau-env depdendency | closed | chereseeriepa |
