# ahau-lib-ssb-plugins-ssb-atala-prism

GitLab: `ahau/lib/ssb-plugins/ssb-atala-prism`  
GitHub: `MakingEverythingAchievableNZ/ssb-atala-prism`  
13 MRs, 2 issues (2 open) — activity 2023-10-26 to 2024-06-05

## Open issues — unresolved, inherited as-is

### #2 AutoIssuance being triggered twice (ISSUE, opened, 2024-02-20)

Reports that receiving a 'connection invite sent' message on the holder side triggers two 'connection complete' messages, causing auto credential issuance to fire twice. Suspected to be a timing issue related to invites and joining a new group plus a subsequent rebuild.
- category: `bug`
- ⚠ gotcha: Suspected cause is a timing issue around invites and joining a new group plus rebuild, but not confirmed.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/work_items/2](https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/work_items/2)

### #1 URLSchema for ISSUER_URL and VERIFIER_URL doesnt support http urls (ISSUE, opened, 2023-12-11)

Reports that the URL schema validation for ISSUER_URL and VERIFIER_URL rejects http:// URLs, which breaks local development setups that need to configure a local issuer over plain http.
- category: `bug`
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/work_items/1](https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/work_items/1)

## Notable changes

### !12 Docker (MR, closed, 2024-05-30)

Adds Docker configuration attempting to upgrade the mediator, cloud agents, and SDK, and to pin exact versions for testing. Left multiple open problems: localhost addresses may interfere with DID/connection resolution, missing API_KEY handling is unclear, and it's unclear how @pluto-encrypted/leveldb and other breaking changes work with SDK v5.1.1. Author argues getting this working is strategically valuable for connections/SDK work, giving a place to test ideas and enabling documentation.
- category: `infra`
- ⚠ gotcha: Unresolved: localhost addresses may break DID/connections; missing API_KEY handling; unclear leveldb/SDK 5.1.1 compatibility.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/merge_requests/12](https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/merge_requests/12)

### !9 Draft: Docker (MR, closed, 2024-05-21)

Draft version of the Docker setup (same intent as merge request 12): adds Docker to upgrade the mediator, cloud agents, and SDK and pin exact test versions, with the same open problems around localhost addresses affecting DIDs/connections, unclear API_KEY handling, and unclear @pluto-encrypted/leveldb and SDK v5.1.1 breaking changes.
- category: `infra`
- ⚠ gotcha: Unresolved: localhost addresses may break DID/connections; missing API_KEY handling; unclear leveldb/SDK 5.1.1 compatibility.
- [https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/merge_requests/9](https://gitlab.com/ahau/lib/ssb-plugins/ssb-atala-prism/-/merge_requests/9)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-06-05 | !13 | fix:upgrade sdk to latest version | closed | mixmix |
| 2024-05-28 | !11 | Initiate connection example | closed | chereseeriepa |
| 2024-05-26 | !10 | use SDK.Agent.initialize function | merged | chereseeriepa |
| 2024-03-15 | !8 | Fixes | merged | chereseeriepa |
| 2024-03-11 | !7 | Galaxy maps | merged | Tairea |
| 2024-02-13 | !6 | Presentation api | merged | mixmix |
| 2023-12-11 | !5 | Draft: Resolve "URLSchema for ISSUER_URL and VERIFIER_URL doesnt support http urls" | closed | chereseeriepa |
| 2023-12-11 | !4 | update readme | merged | chereseeriepa |
| 2023-11-08 | !3 | Refactor | merged | mixmix |
| 2023-10-31 | !2 | High level offer credential | merged | mixmix |
| 2023-10-26 | !1 | Listen | merged | mixmix |
