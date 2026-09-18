# ahau-lib-artefact-server

GitLab: `ahau/lib/artefact-server`  
GitHub: `MakingEverythingAchievableNZ/artefact-server`  
6 MRs, 0 issues (0 open) — activity 2021-02-23 to 2024-02-16

## Notable changes

### !3 API tweaks (MR, merged, 2021-03-01)

Tweaks the http server's API so that blobId is no longer used as the fileName, to avoid someone accidentally overwriting an important record with a duplicate filename (e.g. elder-story.mp3); flagged as FYI-only and not needing review.
- category: `refactor`
- ⚠ gotcha: Author notes filename collisions are still only partly mitigated and says they're still thinking about how best to avoid them.
- [https://gitlab.com/ahau/lib/artefact-server/-/merge_requests/3](https://gitlab.com/ahau/lib/artefact-server/-/merge_requests/3)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2024-02-16 | !6 | Use new artefact store and fix tests | merged | powersource |
| 2021-06-26 | !5 | add support for adding blobs with multipart forms | merged | romuloalves |
| 2021-03-24 | !4 | add support for http 206 responses | merged | mixmix |
| 2021-02-25 | !2 | allow required server to be shut down, refactor opts. add simple init/ close tests | merged | mixmix |
| 2021-02-23 | !1 | add dev script, add .gitignore | merged | mixmix |
