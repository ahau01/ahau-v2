# ahau-lib-pataka-cli

GitLab: `ahau/lib/pataka-cli`  
GitHub: `MakingEverythingAchievableNZ/pataka-cli`  
7 MRs, 2 issues (1 open) — activity 2021-08-03 to 2024-04-03

## Open issues — unresolved, inherited as-is

### #2 Error: CORS issue (ISSUE, opened, 2023-05-08)

Running pataka-cli v1.3.3 in Docker produces a CORS error; reproduced by running the communityfirst/pataka-cli Docker image with PATAKA_HOST and PATAKA_WEB_PORT env vars on the host network.
- category: `bug`
- [https://gitlab.com/ahau/lib/pataka-cli/-/work_items/2](https://gitlab.com/ahau/lib/pataka-cli/-/work_items/2)

## Notable changes

### #1 public messages of type "profile/pataka" not allowed (ISSUE, closed, 2023-03-22)

On the first screen for creating a new pataka, savePataka fails because ssb-recps-guard rejects a public message of type 'profile/pataka'; the reporter traces the likely cause to index.js lines 45-46.
- category: `bug`
- [https://gitlab.com/ahau/lib/pataka-cli/-/work_items/1](https://gitlab.com/ahau/lib/pataka-cli/-/work_items/1)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-04-03 | !7 | Updates | merged | mixmix |
| 2023-03-30 | !6 | Docker release | merged | luandro |
| 2023-03-13 | !5 | Upgrade | merged | mixmix |
| 2021-09-17 | !4 | updated files to use url | merged | Tairea |
| 2021-08-10 | !3 | Cli password | merged | Tairea |
| 2021-08-09 | !2 | Host hacks | merged | Tairea |
| 2021-08-03 | !1 | Master | closed | mixmix |
