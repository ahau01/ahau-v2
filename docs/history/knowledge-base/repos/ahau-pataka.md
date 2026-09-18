# ahau-pataka

GitLab: `ahau/pataka`  
GitHub: `MakingEverythingAchievableNZ/pataka`  
29 MRs, 3 issues (3 open) — activity 2021-05-12 to 2026-01-15

## Open issues — unresolved, inherited as-is

### #3 Old pataka repo? (ISSUE, opened, 2026-01-15)

Asks whether the matou-collective/pataka GitLab repo is the current/new home of the project, as opposed to this one.
- category: `chore`
- [https://gitlab.com/ahau/pataka/-/work_items/3](https://gitlab.com/ahau/pataka/-/work_items/3)

### #2 Vue multiword components set to fail after 2025-05-01 (ISSUE, opened, 2026-01-15)

Reports that .eslintrc.js contains a hardcoded date check (isTimeToFix comparing Date.now() to 2025-05-01) controlling the 'vue/multi-word-component-names' rule, which causes `npm run dev` to start failing once that date passes unless the date constant is manually bumped forward. Reporter also notes the Vue version is out of date, Node 24 may cause additional problems, port 8088 doesn't work while 18088 does, and suggests Docker to pin a specific Node version.
- category: `bug`
- ⚠ gotcha: eslintrc.js has a hardcoded date-based flag that breaks `npm run dev` after 2025-05-01 unless manually bumped.
- [https://gitlab.com/ahau/pataka/-/work_items/2](https://gitlab.com/ahau/pataka/-/work_items/2)

### #1 Docker deployment? (ISSUE, opened, 2022-07-29)

Feature request asking whether a Docker container could be developed for deploying Patka.
- category: `infra`
- [https://gitlab.com/ahau/pataka/-/work_items/1](https://gitlab.com/ahau/pataka/-/work_items/1)

## Notable changes

### !27 Upgrade to db2 (MR, opened, 2024-02-09)

Upgrades Pataka to db2, done in support of ahau/ahau issue 34.
- category: `chore`
- [https://gitlab.com/ahau/pataka/-/merge_requests/27](https://gitlab.com/ahau/pataka/-/merge_requests/27)

### !7 update avatar image picker / dialogs (MR, merged, 2021-07-22)

Fixes avatar image upload where the UI showed nothing and no error message because the GraphQL uploadFile mutation never returned a result from the server. Investigation included checking how the main ahau app handles file upload and comparing upload client versions; updating the upload client to match did not resolve the issue, pointing to the middleware in ssb-pataka as the likely remaining culprit.
- category: `bug`
- ⚠ gotcha: Updating the upload client version alone did not fix the issue; root cause likely lies in ssb-pataka's middleware.
- [https://gitlab.com/ahau/pataka/-/merge_requests/7](https://gitlab.com/ahau/pataka/-/merge_requests/7)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-09-11 | !29 | add matou as a publisherName | merged | mixmix |
| 2024-03-27 | !28 | Proxy | merged | mixmix |
| 2024-01-30 | !26 | fix web reg, couple module updates, update-package script | merged | mixmix |
| 2023-12-01 | !25 | allow changes to the app name through env | merged | chereseeriepa |
| 2023-11-27 | !24 | updates: ahoy, secret-stack, friends, notes etc | merged | mixmix |
| 2023-11-15 | !23 | Update Web Registration Form Docs | merged | chereseeriepa |
| 2023-07-27 | !22 | Online peers | closed | mixmix |
| 2023-07-21 | !21 | show online peers | merged | mixmix |
| 2023-07-11 | !20 | Web reg | merged | mixmix |
| 2022-11-02 | !19 | can now edit profile | merged | Tairea |
| 2022-11-02 | !18 | added email codes button | merged | Tairea |
| 2022-10-31 | !17 | updated cloudhost check it use url | merged | Tairea |
| 2021-09-01 | !16 | hide type pataka from people display | merged | chereseeriepa |
| 2021-08-17 | !15 | Small Pataka fixes | merged | Tairea |
| 2021-08-16 | !14 | tidy config persistence, clear logging | merged | mixmix |
| 2021-08-10 | !13 | spelling mistake | merged | Tairea |
| 2021-08-10 | !12 | force select network | merged | Tairea |
| 2021-08-10 | !11 | Password | merged | Tairea |
| 2021-08-09 | !10 | Host hacks | merged | Tairea |
| 2021-08-09 | !9 | updated packages | merged | Tairea |
| 2021-08-09 | !8 | Ui polishing | merged | Tairea |
| 2021-07-21 | !6 | Pataka ports | merged | mixmix |
| 2021-07-14 | !5 | fix display where people werent showing properly | merged | chereseeriepa |
| 2021-07-11 | !4 | use env-paths for new pataka app home dir, ahau-env v3 | merged | chereseeriepa |
| 2021-06-24 | !3 | Analytics | merged | mixmix |
| 2021-06-05 | !2 | updated logic to allow user to generate local or internet codes | merged | Tairea |
| 2021-05-12 | !1 | fix typo | merged | chereseeriepa |
