# Tasks

## 1. Sweettest setup

- [ ] 1.1 Add the Holochain 0.6.3 test dependency and Sweettest support to the profiles coordinator crate; verify the coordinator test target compiles with `cargo test -p profiles --no-run`.
- [ ] 1.2 Set up the Sweettest harness to load the rogue test hApp for owner and adversarial agents, and verify the fixture uses the same profiles integrity DNA as production.

## 2. Port profile guarantees to real conductors

- [ ] 2.1 Port the cross-agent authorship and privacy cases: another agent cannot overwrite or delete a profile or personal information, cannot read personal-information contents, and cannot create a profile under another agent's key. Verify these cases through Sweettest, including DHT synchronization before remote reads.
- [ ] 2.2 Port the profile and personal-information creation rules: personal information requires a profile; an agent cannot create a second profile or second personal-information entry; invalid profile fields are rejected; Rust gender values accept valid variants and reject an invalid value. Verify each case through Sweettest, including rogue coordinator calls for bypass cases.
- [ ] 2.3 Port the author's allowed profile and personal-information updates, rejection of updates that point to an earlier version, and refusal of profile deletion by its author. Verify each case through Sweettest and confirm rejected operations leave the accepted state intact.

## 3. Test command and migration

- [ ] 3.1 Add `npm run test:sweettest` to build/package the test hApp and run the isolated Sweettest cases in parallel; verify the command passes without a serialized test-thread override.
- [ ] 3.2 Remove Tryorama, the `test:conductor` command, and the three TypeScript conductor test files; regenerate the npm lockfile and verify no active scripts or dependencies reference Tryorama.
- [ ] 3.3 Capture the existing `test:conductor` runtime and the new `test:sweettest` runtime under comparable conditions, and record both commands, environment, and timings in the change/CI summary. Verify the comparison is informational and has no pass threshold.
- [ ] 3.4 Add a dedicated CI job using the pinned Holochain 0.6.3 toolchain to run `npm run test:sweettest`, and update README test instructions; verify the job invokes the dedicated command and the documented instructions match it.

## 4. Integration checks

- [ ] 4.1 Run the existing fast `npm run test:zomes` and default `npm test` paths after removing Tryorama; verify they remain independent of Sweettest conductor startup and pass.
- [ ] 4.2 Verify the Holochain dependency remains pinned to 0.6.3, the Sweettest command and CI job are separate from default test commands, and the full change passes `git diff --check`.
