# Tasks

## 1. Remove SweetTest from CI

- [x] 1.1 Remove the SweetTest workflow step and stale cache comment from `.github/workflows/ci.yml`, and reduce the Holochain timeout to 60 minutes; verify the change matches `continuous-integration` and retains the other CI behavior with adequate margin over the measured cold zome test and setup time.

## 2. Remove redundant README CI guidance

- [x] 2.1 Remove the `## CI` section from `README.md`; verify CI behavior is covered by the `continuous-integration` spec and the local `npm run test:sweettest` command remains in the useful checks list and defined in `package.json`.
