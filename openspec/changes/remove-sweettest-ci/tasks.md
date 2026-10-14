# Tasks

## 1. Remove SweetTest from CI

- [ ] 1.1 Remove the SweetTest workflow step and stale cache comment from `.github/workflows/ci.yml`; verify it matches `continuous-integration`: fast pull request checks remain, Holochain runs on relevant changes and fail-closed detection, docs-only changes skip successfully, and manual dispatch runs both checks without adding a push-to-main trigger.

## 2. Remove redundant README CI guidance

- [ ] 2.1 Remove the `## CI` section from `README.md`; verify CI behavior is covered by the `continuous-integration` spec and the local `npm run test:sweettest` command remains in the useful checks list and defined in `package.json`.
