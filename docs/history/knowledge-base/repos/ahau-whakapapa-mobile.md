# ahau-whakapapa-mobile

GitLab: `ahau/whakapapa-mobile`  
GitHub: `MakingEverythingAchievableNZ/whakapapa-mobile`  
11 MRs, 2 issues (1 open) — activity 2020-01-18 to 2020-02-04

## Open issues — unresolved, inherited as-is

### #2 Fix real profile pic upload, it should work on mobile devices (ISSUE, opened, 2020-02-03)

Profile picture upload is broken on both web and real mobile devices because loading the resulting blob: image URL is refused by the app's Content Security Policy, since img-src is not explicitly set and falls back to default-src.
- category: `bug`
- [https://gitlab.com/ahau/whakapapa-mobile/-/work_items/2](https://gitlab.com/ahau/whakapapa-mobile/-/work_items/2)

## Notable changes

### !11 WIP: Merging desktop and mobile apps (MR, opened, 2020-02-04)

Work-in-progress effort to merge the desktop and mobile apps, with a proof-of-concept Electron setup done; remaining tasks include deciding on and running a linter, including/testing desktop build scripts, porting ssb-ahoy fundamentals, adding storybook, updating the README, merging responsive components with the latest desktop versions, and generating/testing installers.
- category: `refactor`
- ⚠ gotcha: Marked WIP with most checklist items still incomplete; testing requires checking package.json scripts to run web, Electron, or Android builds.
- files mentioned: `package.json`
- [https://gitlab.com/ahau/whakapapa-mobile/-/merge_requests/11](https://gitlab.com/ahau/whakapapa-mobile/-/merge_requests/11)

### #1 Running Android app on Mac (ISSUE, closed, 2020-01-28)

Building the Android app fails on Mac with a linker error ('undefined reference to main') in the standalone Android toolchain, followed by an npm install failure for the bufferutil native module's node-gyp-build install script.
- category: `bug`
- [https://gitlab.com/ahau/whakapapa-mobile/-/work_items/1](https://gitlab.com/ahau/whakapapa-mobile/-/work_items/1)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2020-01-30 | !10 | Whakapapa Show | merged | luandro |
| 2020-01-30 | !9 | Profile edit | merged | staltz |
| 2020-01-30 | !8 | Whakapapa index | merged | luandro |
| 2020-01-30 | !7 | make Appbar component responsive for mobile | merged | staltz |
| 2020-01-28 | !6 | Vuetify | merged | luandro |
| 2020-01-28 | !5 | add placeholder Tree D3 component for WhakapapaShow | closed | staltz |
| 2020-01-27 | !4 | WIP: CreateUser page | closed | luandro |
| 2020-01-27 | !3 | WIP: Whakapapa page | closed | luandro |
| 2020-01-23 | !2 | Graphql backend | merged | luandro |
| 2020-01-18 | !1 | Graphql frontend | merged | luandro |
