# ahau-ahau

GitLab: `ahau/ahau`  
GitHub: `MakingEverythingAchievableNZ/ahau`  
975 MRs, 42 issues (20 open) — activity 2019-10-14 to 2026-08-06

## Open issues — unresolved, inherited as-is

### #52 fix: resolve pre-existing static-check CI failures (brace-style, camelcase, no-undef) (ISSUE, opened, 2026-04-24)

Tracks 37 pre-existing eslint violations (brace-style across DataModel.vue, FieldList.vue, several store modules, etc.; camelcase locale keys like en_NZ/en_US in translations/index.mjs; no-undef for the nodejs cordova global in cordova-nodejs-client.js; a no-var in csv.mjs) that make npm run static-check fail on master, even though npm run lint passes because static-check runs with --no-inline-config and no auto-fix. MR !980 introduced none of these violations; the fix is to auto-fix the brace-style cases with eslint --fix and manually resolve the rest so static-check exits 0 without adding new eslint-disable comments.
- category: `chore`
- ⚠ gotcha: npm run lint passes but npm run static-check fails, since static-check ignores inline eslint-disable comments.
- files mentioned: `ui/src/components/dialog/community/DataModel.vue`, `ui/src/components/dialog/profile/NewPersonDialog.vue`, `ui/src/components/submission/FieldList.vue`, `ui/src/lib/csv.mjs`, `ui/src/lib/svg-export.mjs`, `ui/src/plugins/cordova-nodejs-client.js`, `ui/src/store/index.js`, `ui/src/store/modules/error/index.js`, `ui/src/store/modules/loading/index.mjs`, `ui/src/store/modules/person/index.js`, `ui/src/store/modules/tree/index.mjs`, `ui/src/store/modules/tree/lib/layout-child-links.mjs`, `ui/src/store/modules/whakapapa/import-from-csv-actions.mjs`, `ui/src/store/modules/whakapapa/index.mjs`, `ui/src/translations/index.mjs`
- [https://gitlab.com/ahau/ahau/-/work_items/52](https://gitlab.com/ahau/ahau/-/work_items/52)

### #51 Add timeout/fallback for Cordova theme bridge during startup (ISSUE, opened, 2026-04-24)

During Cordova startup, initializeThemeService awaits callCordovaThemeBridge('get'), whose promise only resolves when the nodejs bridge posts a theme:result/theme:error message; if the bridge never responds, Vue never mounts and the splash screen never hides, so the app appears frozen. Proposes wrapping the bridge call in Promise.race with a 3-5s timeout, cleaning up the stale entry in pendingMobileRequests, and rejecting with a ThemeBridgeTimeoutError so the existing catch in loadThemeConfig falls back to localStorage/default theme.
- category: `bug`
- ⚠ gotcha: unbounded await on the Cordova theme bridge response can hang app startup indefinitely with no timeout.
- files mentioned: `ui/src/lib/theme/theme-service.mjs`
- [https://gitlab.com/ahau/ahau/-/work_items/51](https://gitlab.com/ahau/ahau/-/work_items/51)

### #40 Adding a new data point to my tribe doesn't save (ISSUE, opened, 2024-02-15)

A user running their own pataka (v4.3.2) and connected Ahau profile (v2.25.6) reports that adding a new data point/custom field to their tribe fails with an 'Error updating a community ApolloError', preventing the field from becoming usable by the Kaitiaki.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/40](https://gitlab.com/ahau/ahau/-/work_items/40)

### #39 mixpanel in mobile (ISSUE, opened, 2024-02-12)

Basic anonymous analytics (mixpanel), used only to count how many people open the app, does not currently work on the mobile build and needs fixing.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/39](https://gitlab.com/ahau/ahau/-/work_items/39)

### #38 Start using ssb-ebt (and ssb-replication-scheduler?) (ISSUE, opened, 2024-02-01)

Proposes switching whakapapa replication from the older createHistoryStream-based approach to ssb-ebt, which replicates much faster, and possibly also adopting ssb-replication-scheduler since ssb-replicate is deprecated in its favor.
- category: `decision`
- [https://gitlab.com/ahau/ahau/-/work_items/38](https://gitlab.com/ahau/ahau/-/work_items/38)

### #37 Editing custom data field type lists (ISSUE, opened, 2024-01-29)

In the community data model, editing is disabled for the option lists of custom data fields, so on Ahau 2.25.6 users cannot add or remove list options even though they expect to be able to.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/37](https://gitlab.com/ahau/ahau/-/work_items/37)

### #36 Upgrading ahau to db2 (ISSUE, opened, 2024-01-25)

Tracking issue to update the Ahau app's dependent modules to their db2 versions, following the parallel per-library db2 upgrade work tracked in ahau/ahau issue #34.
- category: `infra`
- [https://gitlab.com/ahau/ahau/-/work_items/36](https://gitlab.com/ahau/ahau/-/work_items/36)

### #34 Upgrading the stack to ssb-tribes with db2 (ISSUE, opened, 2023-11-07)

Master checklist for migrating the whole stack to ssb-tribes with db2, listing per-library MRs (ssb-whakapapa, ssb-hyper-blobs, ssb-profile, ssb-submissions, ssb-story, ssb-settings, ssb-artefact, ssb-pataka, ssb-tribes-registration, the ssb-graphql-* packages, ssb-ahau) plus remaining gaps such as missing group-encryption tests for ssb-whakapapa/ssb-artefact and missing ssb-tribes tests for ssb-story.
- category: `infra`
- [https://gitlab.com/ahau/ahau/-/work_items/34](https://gitlab.com/ahau/ahau/-/work_items/34)

### #33 Windows 11 bug? (ISSUE, opened, 2023-10-16)

On Windows 11 (Ahau v2.24.1) the app installs and the backend starts and runs fine (confirmed via Command Prompt, including an unusual IPv6 host address), but the front end crashes after 1-2 seconds with no JS error popup while the backend keeps running.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/33](https://gitlab.com/ahau/ahau/-/work_items/33)

### #32 FEATURE: Import GEDCOM files to Whakapapa records (ISSUE, opened, 2023-09-14)

Feature request to allow importing (uploading) GEDCOM files into whakapapa records in Āhau, motivated by two separate whānau requests raised during Ahau training sessions; GEDCOM is described as a standard cross-compatible genealogy file-interchange format.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/work_items/32](https://gitlab.com/ahau/ahau/-/work_items/32)

### #31 Artefact replication (ISSUE, opened, 2023-09-05)

A contributor reports that story/collection text data replicates fine across peers but attached images only display on the contributor's own Ahau; a GET request to the artefact drive's blob endpoint returns 404 for the failing image even though other images load successfully through the same call stack.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/31](https://gitlab.com/ahau/ahau/-/work_items/31)

### #28 test service desk (ISSUE, opened, 2023-04-10)

A test issue created through the service-desk email-to-issue integration, containing only Ben Tairea's (CEO) email signature and a question checking whether logging issues by email works.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/issues/28](https://gitlab.com/ahau/ahau/-/issues/28)

### #27 BUG - Unexpected replication of artefacts upon restarting the app (ISSUE, opened, 2021-09-02)

In ssb-hyper-blobs, remote artefacts should only download when the tribe's archive page is opened, but after a peer's drive has been downloaded once, later app restarts unexpectedly re-download new artefacts from that peer without them being requested. The reporter wrote reproduction tests at both the ssb-hyper-blobs and underlying artefact-store levels, but neither reproduces the issue, suspecting it may relate to how scuttle-testbot simulates app restarts rather than a deeper storage bug.
- category: `bug`
- ⚠ gotcha: root cause not isolated; reproduction tests at two different layers both fail to trigger the reported behavior.
- [https://gitlab.com/ahau/ahau/-/work_items/27](https://gitlab.com/ahau/ahau/-/work_items/27)

### #25 App page refresh (ISSUE, opened, 2020-12-09)

Refreshing any page in the app is broken; changing <base href="./"/> to <base href="/"/> in index.html fixed the refresh issue but broke the production build (missing files), so the change had to be reverted. Suggests a possible fix of updating the paths of the files the production build complains about instead of reverting outright.
- category: `bug`
- ⚠ gotcha: a known fix (changing the base href) was reverted because it broke production builds; reapplying it needs an accompanying file-path fix.
- files mentioned: `index.html`
- [https://gitlab.com/ahau/ahau/-/work_items/25](https://gitlab.com/ahau/ahau/-/work_items/25)

### #23 TimelineCard transition issue - hover exit collapses too fast and is a bit jarring (ISSUE, opened, 2020-09-28)

The TimelineCard's hover-exit transition collapses too quickly, producing a visually jarring effect; no further detail provided.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/23](https://gitlab.com/ahau/ahau/-/work_items/23)

### #22 NewRecordDialog -> Related records -> ComboBox doesn't scroll (ISSUE, opened, 2020-09-27)

In NewRecordDialog's related-records ComboBox (via the profileSearchBar component), the dropdown menu shows a scrollbar but does not actually scroll; attempts to fix it with the allow-overflow prop or an inline overflow-y:scroll style were unsuccessful.
- category: `bug`
- ⚠ gotcha: allow-overflow and overflow-y:scroll style overrides do not fix the non-scrolling combobox menu.
- [https://gitlab.com/ahau/ahau/-/work_items/22](https://gitlab.com/ahau/ahau/-/work_items/22)

### #21 ProfileSearchBar adds item when 'enter' key is pressed (ISSUE, opened, 2020-09-13)

Pressing Enter in ProfileSearchBar while searching for a nonexistent person or tribe incorrectly adds an item to the avatar group; also reports that the search no longer surfaces tribes and is sometimes unresponsive with an error. Notes the search bar likely needs a broader UX rework to be more user-friendly and easy to search.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/21](https://gitlab.com/ahau/ahau/-/work_items/21)

### #15 can add sibling to partner even if they don't have a parent (ISSUE, opened, 2020-09-07)

A sibling can incorrectly be added to a partner in the whakapapa tree even when that partner has no parent record; no further detail provided.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/15](https://gitlab.com/ahau/ahau/-/work_items/15)

### #9 Seeing peer changes to whakapapa (ISSUE, opened, 2020-09-02)

When a peer makes a change to a whakapapa, the new person doesn't appear in the UI until the user leaves and re-enters that whakapapa view, which could lead to duplicate-record creation if a user adds the same person again before seeing the peer's update.
- category: `bug`
- ⚠ gotcha: stale UI after peer edits can prompt users to create duplicate records before the update is visible.
- [https://gitlab.com/ahau/ahau/-/work_items/9](https://gitlab.com/ahau/ahau/-/work_items/9)

### #8 Available Disk space not showing on Windows, (ISSUE, opened, 2020-09-02)

Available disk space is not displayed on Windows; reporter asks whether this works correctly on the Mac version of Pataka.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/8](https://gitlab.com/ahau/ahau/-/work_items/8)

## Notable changes

### !984 fix outdated Node/npm version requirements and add missing setup notes (MR, merged, 2026-08-06)

desktop/README.md documented an outdated Node/npm requirement (node v14.16.1-v15.0.0, npm v7.11.2-v8.0.0) that no longer matches the project's actual --engine-strict requirement (node >=18 <19, npm >=9), causing npm install --engine-strict to fail for anyone following the README on a fresh setup. Updates the Requirements section and adds a previously-undocumented note that the desktop folder needs its own separate npm install, which if skipped causes a "'cross-env' is not recognized" error.
- category: `chore`
- ⚠ gotcha: the desktop/ folder requires a separate npm install beyond the root install, or you'll hit a missing cross-env error.
- files mentioned: `desktop/README.md`
- [https://gitlab.com/ahau/ahau/-/merge_requests/984](https://gitlab.com/ahau/ahau/-/merge_requests/984)

### !981 feat(theme): tribal identity customization - bundled theming system (MR, merged, 2026-04-23)

Adds a bundled theming system letting tribes customize app colors and avatar assets per device: Electron/Cordova backend theme-config modules with JSON persistence, a bundled-themes registry with manifest validation and key-by-key fallback resolution (default -> bundled -> external), Vuetify runtime theme switching, an AppearanceSettings UI component, a default theme plus an 'Are'Are reference theme, and i18n keys across all 6 locales (also fixing a 'Portugese' typo in en_NZ). Also hardens CI by making static-check blocking (removing allow_failure), removing --no-inline-config from eslint so inline disable comments are respected again, adding the nodejs cordova eslint global, and fixing a var-to-const issue in csv.mjs.
- category: `feature`
- ⚠ gotcha: the static-check CI job was changed from advisory (allow_failure) to blocking as part of this MR.
- files mentioned: `theme-config.js`
- [https://gitlab.com/ahau/ahau/-/merge_requests/981](https://gitlab.com/ahau/ahau/-/merge_requests/981)

### !980 feat: multiple partner relationship (MR, merged, 2026-04-23)

Adds support for multiple partner types (legal and custom) per person: extends PARTNER_RELATIONSHIPS and CSV import routing, requests relationshipType in all whakapapa GraphQL queries, updates tree layout to draw legal/custom links alongside existing partner/inferred links, adds create/edit/review flows and i18n labels for the new types, adds bounded recursion/iteration guards for large partner graphs, patches @ssb-graphql/whakapapa to support the new types, and normalises legacy partner types to 'legal' on read and write. Includes a 15-partner test fixture (chief-multiple-wives.mjs) and 820 passing tests.
- category: `feature`
- files mentioned: `apollo-helpers.mjs`, `chief-multiple-wives.mjs`, `layout-partner-links.mjs`
- [https://gitlab.com/ahau/ahau/-/merge_requests/980](https://gitlab.com/ahau/ahau/-/merge_requests/980)

### !979 fix: replace hardcoded strings with i18n translations (MR, merged, 2026-04-23)

Adds a detection script (check-hardcoded-translations.sh) that found 197 hardcoded text strings across 42 Vue components (19 with no i18n setup, 23 partially translated), then systematically replaces them with $t() translation calls and new keys added to translations/en_NZ/default.js, grouped by dialog/button components, archive components, and views.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/979](https://gitlab.com/ahau/ahau/-/merge_requests/979)

### !978 feat: expand guardrails with hooks, secret scanning, commit linting, CI hardening (MR, merged, 2026-04-23)

Expands repo guardrails from a minimal setup to 8 CI jobs across 2 stages (tests, lint, commit-lint, secret-scan, install-check, static-check, build:desktop, smoke-test, build:mobile), plus new pre-commit hooks for staged .mjs/.vue linting, secret scanning, and blocking test.only/it.only/describe.only patterns, and a commit-msg hook enforcing lowercase-or-conventional-prefix messages under 100 chars (merge/revert commits exempted). Also fixes two pre-existing issues found along the way: a vue/no-mutating-props error in FilterMenu.vue and a test:no-only script false-positive matching .md files.
- category: `infra`
- files mentioned: `FilterMenu.vue`, `package.json`, `scripts/pre-commit-lint.sh`
- [https://gitlab.com/ahau/ahau/-/merge_requests/978](https://gitlab.com/ahau/ahau/-/merge_requests/978)

### !977 fix issuer and verifier example urls, change registration approval to only... (MR, closed, 2024-12-15)

Fixes incorrect example URLs for the issuer and verifier and changes registration approval behavior (title text is truncated), and updates the image picker so it works with both avatarImage and headerImage fields, including handling large avatar image changes.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/977](https://gitlab.com/ahau/ahau/-/merge_requests/977)

### !974 update packages for sdk v6 (MR, closed, 2024-08-04)

Updates packages for SDK v6: bumps ssb-ahau to a version with ssb-atala-prism@2.1.1 plugged in, updates ssb-atala-prism to 2.1.1, and adds a patch to the SDK needed to fix mediation issues; verified-credential features (mediator, issuer/verifier config) still needed smoke testing on Ahau and Pataka, and the MR was closed rather than merged.
- category: `chore`
- ⚠ gotcha: requires an SDK patch to work around mediation issues; verified-credential smoke testing was left unchecked when the MR was closed.
- [https://gitlab.com/ahau/ahau/-/merge_requests/974](https://gitlab.com/ahau/ahau/-/merge_requests/974)

### !973 fix bug with registration form not passing custom fields properly (MR, merged, 2024-07-16)

Fixes a bug where the registration form wasn't passing custom fields through, which left new users stuck at the edit-profile step when joining a tribe with required custom fields. Author warns this may conflict with the specific prior commit (24c32bcb) that originally introduced the bug.
- category: `bug`
- ⚠ gotcha: may conflict with commit 24c32bcb, the change that originally introduced the bug being fixed here.
- [https://gitlab.com/ahau/ahau/-/merge_requests/973](https://gitlab.com/ahau/ahau/-/merge_requests/973)

### !972 New Crowdin updates (MR, opened, 2024-04-22)

Automated MR pulling in the latest Crowdin translation updates; no further description provided.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/972](https://gitlab.com/ahau/ahau/-/merge_requests/972)

### !967 Auto presentation (MR, merged, 2024-03-12)

Implements automatically sending a credential to a verifier: entering a code/URL in an input-code dialog triggers the sendCredentialProof flow.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/967](https://gitlab.com/ahau/ahau/-/merge_requests/967)

### !966 Loading rework (MR, merged, 2024-03-11)

Reworks the mobile loading UI: because a busy backend rebuild can cause GraphQL queries to time out, the UI now polls indexing status and shows a generic 'loading...' spinner when a fetch times out, so users at least see the app is doing something. Also extracts a dedicated vuex 'loading' module, more clearly separates the 'loading' and 'indexing' concepts, and renames 'syncing' to 'isJoiningPataka' to reduce confusion.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/966](https://gitlab.com/ahau/ahau/-/merge_requests/966)

### #41 Use our own dht bootstrap node (ISSUE, closed, 2024-02-16)

Hyperswarm 4.0.1's default DHT bootstrap nodes were taken offline, so the project now hosts its own bootstrap node; this tracking issue lists and closes out the per-library MRs (artefact-store, artefact-server, ssb-hyper-blobs, @ssb-graphql/main, ssb-ahau, and the ahau app itself) needed to start using it.
- category: `infra`
- [https://gitlab.com/ahau/ahau/-/work_items/41](https://gitlab.com/ahau/ahau/-/work_items/41)

### !960 Auto presentation (MR, merged, 2024-02-14)

Adds the ability for tribes to toggle requesting member credentials during registration, and to review submitted membership credentials on new registrations.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/960](https://gitlab.com/ahau/ahau/-/merge_requests/960)

### !956 Draft: Gallery Icon implemented in sideNavMenu.vue (MR, opened, 2024-02-07)

Draft MR implementing a gallery icon in sideNavMenu.vue; the standard MR template (description, smoke tests, checks, screenshots) was left unfilled.
- category: `feature`
- ⚠ gotcha: draft/WIP MR with the template unfilled, so scope and testing status are undocumented.
- [https://gitlab.com/ahau/ahau/-/merge_requests/956](https://gitlab.com/ahau/ahau/-/merge_requests/956)

### !955 Start using ssb-ebt and ssb-replication-scheduler (MR, opened, 2024-02-02)

Fixes issue #38 by uninstalling ssb-replicate and installing ssb-ebt and ssb-replication-scheduler in its place, for improved replication speeds; the rest of the MR template was left unfilled.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/955](https://gitlab.com/ahau/ahau/-/merge_requests/955)

### !953 Upgrade to db2 and migrate from db1 (MR, opened, 2024-01-25)

Upgrades the app's database from db1 to db2, including automatic migration, and closes issue #36. Notes recommend backing up the db before trying it, especially for anyone who might want to keep using db1 afterward; one remaining lint error is noted as unrelated to this MR.
- category: `infra`
- ⚠ gotcha: automatic db1->db2 migration is effectively one-way in practice; back up your db first if you might need db1 again.
- [https://gitlab.com/ahau/ahau/-/merge_requests/953](https://gitlab.com/ahau/ahau/-/merge_requests/953)

### !952 Draft: Resolve "Upgrading ahau to db2" (MR, closed, 2024-01-25)

Draft MR to upgrade Ahau's database from db1 to db2, closing issue #36; automatic data migration was expected to be handled in a separate follow-up MR.
- category: `infra`
- ⚠ gotcha: Automatic migration from db1 to db2 was deliberately left out and deferred to another MR.
- [https://gitlab.com/ahau/ahau/-/merge_requests/952](https://gitlab.com/ahau/ahau/-/merge_requests/952)

### !948 View registration files (MR, opened, 2023-12-20)

Adds an artefact section to the ReviewRegistration form so applicants and kaitiaki can view uploaded photos and download other documents submitted with a registration.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/948](https://gitlab.com/ahau/ahau/-/merge_requests/948)

### !947 Registration form files (MR, opened, 2023-12-14)

Adds a new step to the registration form that presents custom-field file uploads when the tribe's community data model defines file-type custom fields. The file picker is restricted to whatever file types (e.g. photo, document) the kaitiaki configured, allows multiple files if multiple types were selected, and shows the kaitiaki-authored description as hint text; descriptive UI text was still a listed TODO.
- category: `feature`
- ⚠ gotcha: upload file types are limited to whatever the kaitiaki configured per field; some descriptive text was still pending at MR time.
- [https://gitlab.com/ahau/ahau/-/merge_requests/947](https://gitlab.com/ahau/ahau/-/merge_requests/947)

### !946 allow kaitiaki to define a new custom field of type file (MR, opened, 2023-12-13)

Adds a new 'file' custom field type to the DataModel so kaitiaki can define file-attachment fields, with audio and video disabled for this first pass. Viewing the field is implemented read-only (editing deferred to a follow-up PR), and visibleBy is hard-coded to kaitiaki-only rather than configurable for now.
- category: `feature`
- ⚠ gotcha: audio/video attachments disabled, fields are view-only (not yet editable), and visibility is forced kaitiaki-only in this first pass.
- [https://gitlab.com/ahau/ahau/-/merge_requests/946](https://gitlab.com/ahau/ahau/-/merge_requests/946)

### !945 Toggle beta features (MR, merged, 2023-12-10)

Implements a beta features toggle that is off by default unless acceptsVerifiedCredentials or issuesVerifiedCredentials is enabled, and syncs state between the two settings locations.
- category: `feature`
- ⚠ gotcha: Beta toggle auto-disables on dialog close unless one of the two nested VC settings is enabled, and can't be turned off while a nested setting is active.
- [https://gitlab.com/ahau/ahau/-/merge_requests/945](https://gitlab.com/ahau/ahau/-/merge_requests/945)

### !934 toggle accepts vc setting (MR, merged, 2023-11-28)

Adds a kaitiaki-facing setting to toggle whether a tribe accepts verified credentials, shows the VC section on the registration form when enabled, and moves the toggle into DataModel.vue with corresponding backend changes across ssb-profile, @ssb-graphql/profile, and ssb-ahau.
- category: `feature`
- files mentioned: `DataModel.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/934](https://gitlab.com/ahau/ahau/-/merge_requests/934)

### !931 Draft: move search bar into its own component, create new readonly profile form (MR, opened, 2023-11-22)

Draft attempt to fix an infinite-loop bug by splitting ProfileForm into a separate search-bar component and a dedicated readonly profile form, with an edit-mode form planned as a follow-up. Only the readonly portion is functionally complete; the work is still WIP.
- category: `refactor`
- ⚠ gotcha: WIP draft — only the readonly form path is finished; the edit form has not been built yet.
- [https://gitlab.com/ahau/ahau/-/merge_requests/931](https://gitlab.com/ahau/ahau/-/merge_requests/931)

### !930 get mobile building (MR, closed, 2023-11-22)

Work to get the mobile build working again by updating ssb plugin modules, locking node-gyp to version 9, switching to Node 18 for the UI build, and patching packages that call require on ssb-db2, while debugging why the built .apk showed nothing (checked adb logcat and added logs in main.js).
- category: `infra`
- ⚠ gotcha: node-gyp version pinned to 9 specifically to fix the mobile build.
- files mentioned: `main.js`
- [https://gitlab.com/ahau/ahau/-/merge_requests/930](https://gitlab.com/ahau/ahau/-/merge_requests/930)

### !922 refactor submission notifications (MR, merged, 2023-10-29)

Refactors submission notifications so the Submissions module owns the source of truth for submissions instead of Notifications knowing too much; Notifications now derives notification data from Submissions, and a hook was added into tombstoneSubmission to update cached state instead of relying on UI-level hacks.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/922](https://gitlab.com/ahau/ahau/-/merge_requests/922)

### !914 Allow submissions to update a relationship (MR, opened, 2023-10-02)

Lets members of a submit-only whakapapa create submissions (via SideNodeDialog edit mode) to update or delete parent/child/partner relationship links, which kaitiaki and members can then review and the kaitiaki can approve or reject; kaitiaki retain the ability to make these edits directly without going through the submission/review flow.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/914](https://gitlab.com/ahau/ahau/-/merge_requests/914)

### #30 BUG - Updating profile while completing a registration get stuck loading (ISSUE, closed, 2023-08-25)

While completing tribe registration on Ahau 2.21.0, updating required profile fields causes the profile dialog to close and then get permanently stuck on a 'submitting changes' loading state, instead of updating and advancing to the next registration step.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/30](https://gitlab.com/ahau/ahau/-/work_items/30)

### !889 Submit existing parent (MR, merged, 2023-08-23)

Adds support for submitting a link to an existing parent: re-enables parent suggestions (now suggesting the parent's partners) and creates the submission linking the selected profile to the existing parent, while adding a parent directly to the focus profile is disabled for now. Also fixes a bug where a partner link was incorrectly created from the existing parent to the parent's partner when one already existed.
- category: `feature`
- ⚠ gotcha: Adding a parent to the focus profile is intentionally disabled (TODO), and duplicate-link handling for existing parents/partners is not yet covered.
- [https://gitlab.com/ahau/ahau/-/merge_requests/889](https://gitlab.com/ahau/ahau/-/merge_requests/889)

### !870 Web form ui (MR, merged, 2023-07-11)

Work-in-progress UI for a web registration form; still missing a select-all checkbox and needs checkbox label styling updated to visually distinguish the key from the value.
- category: `feature`
- ⚠ gotcha: Select-all checkbox and key/value label styling are not yet implemented (checklist items unchecked).
- [https://gitlab.com/ahau/ahau/-/merge_requests/870](https://gitlab.com/ahau/ahau/-/merge_requests/870)

### !866 Fix secondary links (MR, merged, 2023-06-14)

Fixes two link-creation bugs: creating a duplicate link when adding a person that already existed, and inferred birth-parent partner links duplicating when both parents already exist on the same whakapapa.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/866](https://gitlab.com/ahau/ahau/-/merge_requests/866)

### !865 docs - web registration (MR, merged, 2023-06-13)

Adds documentation for the web registration feature, naming the expected behaviour and sketching out the architecture and systems it touches; author notes the scope is surprisingly broad and suggests it may be worth consolidating the API into a single module (while still needing to support both Ahau and Pataka).
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/865](https://gitlab.com/ahau/ahau/-/merge_requests/865)

### !863 move whakapapaShow route (MR, opened, 2023-05-31)

Moves the whakapapaShow route; no further description was provided.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/863](https://gitlab.com/ahau/ahau/-/merge_requests/863)

### !854 disable adding people, deleting people in submit-only whakapapa if you're not the kaitiaki (MR, merged, 2023-05-26)

Disables the ability to add or delete people in a submit-only whakapapa for anyone who is not the kaitiaki, verified via smoke tests that kaitiaki retain full access while members do not, and normal whakapapa behaviour is unaffected.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/854](https://gitlab.com/ahau/ahau/-/merge_requests/854)

### !853 Add a child submission (MR, merged, 2023-05-23)

Adds the ability to submit a new child in a submit-only whakapapa: creates a profile-creation submission and a link-creation submission joined by a link message, where the link submission depends on the profile submission being approved first; also adds kaitiaki review flow to select fields/links and approve both submissions together. Lists follow-up work to add new parent/sibling and existing child/parent submission types.
- category: `feature`
- ⚠ gotcha: Advanced cases (ignored profiles, important links, duplicate links) still need special handling in follow-up work.
- [https://gitlab.com/ahau/ahau/-/merge_requests/853](https://gitlab.com/ahau/ahau/-/merge_requests/853)

### !852 add ability to block pataka (MR, merged, 2023-05-22)

Adds the ability to block/unblock a pataka, with backend validation ensuring the target is a valid pataka before the action is allowed (making the Apollo endpoints safe); also tidies up the Pataka List using Vuetify components. No design was provided, so placement/UX was done by feel.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/852](https://gitlab.com/ahau/ahau/-/merge_requests/852)

### !847 change csv dividers *within* a field to "|" (MR, closed, 2023-05-15)

Proposes fixing an ambiguous CSV delimiter issue in multi-value fields like altNames: since "," is also the column separator, the author proposes using a special subfield delimiter "|" within a field instead.
- category: `bug`
- ⚠ gotcha: Multi-value fields (e.g. altNames) use "|" instead of "," as an internal delimiter to avoid clashing with the CSV column separator.
- [https://gitlab.com/ahau/ahau/-/merge_requests/847](https://gitlab.com/ahau/ahau/-/merge_requests/847)

### !831 New csv import/export (MR, merged, 2023-02-28)

Reintroduces CSV import/export support for custom fields (previously lost when MR #800 was reverted incorrectly): export now includes custom fields, and import creates new custom fields for extra columns not in the tribe's field definitions, or fills existing custom fields when the header matches. Fixes bugs where export returned no profiles, exported profiles lacked an adminProfile, import gave duplicate timestamps to fast-created fields, the person index didn't reload after import, and visibility couldn't be set on newly imported custom fields.
- category: `feature`
- ⚠ gotcha: Reintroduces code that was lost when an earlier MR (#800) was reverted incorrectly.
- [https://gitlab.com/ahau/ahau/-/merge_requests/831](https://gitlab.com/ahau/ahau/-/merge_requests/831)

### !829 fix bugs with custom field UI (MR, merged, 2023-02-22)

Plugs in backend changes (new ssb-ahau version) for saving custom fields to the correct profile based on visibleBy, and fixes bugs where SideNodeDialog threw errors related to custom fields and where custom field data wasn't shown after a reload.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/829](https://gitlab.com/ahau/ahau/-/merge_requests/829)

### !825 uninstall storybook (MR, merged, 2022-12-07)

Removes Storybook from the project, verified that dev setup and production build still work; author is unsure whether other now-unused dependencies that were only needed for Storybook can also be removed, since the dependency-check tool didn't work well given the lack of a single entrypoint and unclear Vue file support.
- category: `chore`
- ⚠ gotcha: Some Storybook-only dependencies may remain unremoved since dependency-check tooling couldn't reliably analyze the project.
- [https://gitlab.com/ahau/ahau/-/merge_requests/825](https://gitlab.com/ahau/ahau/-/merge_requests/825)

### !823 Update test CICD pipeline (MR, merged, 2022-11-23)

Updates the CI/CD pipeline so tests only run when a PR (including Draft) is created or on pushes to master, reducing wasted GitLab pipeline minutes from running tests on every branch push.
- category: `infra`
- [https://gitlab.com/ahau/ahau/-/merge_requests/823](https://gitlab.com/ahau/ahau/-/merge_requests/823)

### !821 Fixed personIndex customFields bugs (MR, merged, 2022-11-22)

Fixes personIndex custom field bugs: corrects ProfileForm and SideNodeDialog profile fields, fixes loading of adminProfiles with adminFields, fixes CSV import, and adds a success notification when a key download completes.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/821](https://gitlab.com/ahau/ahau/-/merge_requests/821)

### !820 Large loading performance (MR, merged, 2022-11-21)

Improves performance for large whakapapa loads by changing the logic used to load whakapapa, profiles, and the tree, and updating node logic to check whether a node is within the user's current view.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/820](https://gitlab.com/ahau/ahau/-/merge_requests/820)

### !814 Custom Field - VisibleBy (MR, merged, 2022-11-07)

Adds backend logic so custom field data is saved to the correct profile based on the field's visibleBy setting during tribal applications: all fields (member + admin) save to the admin profile on application, and only member-visible fields propagate to the group profile on kaitiaki acceptance; personIndex and whakapapaShow are updated to display adminProfile.customFields to kaitiaki and groupProfile.customFields to other members.
- category: `feature`
- ⚠ gotcha: This PR does not cover checks for updating custom fields on existing profiles and ensuring they save to the correct profile.
- [https://gitlab.com/ahau/ahau/-/merge_requests/814](https://gitlab.com/ahau/ahau/-/merge_requests/814)

### !806 updated canBeImported to have default value (MR, closed, 2022-09-30)

Adds custom fields and additionalColumns support to CSV export, and defines CSV import behaviour where unrecognized additional columns are auto-created as new custom fields (keyed by a generated timestamp, labeled by the column name).
- category: `feature`
- ⚠ gotcha: Type handling for auto-created custom fields from CSV import is undecided (TODO: default to string, or prompt the user to specify a type or ignore the field).
- [https://gitlab.com/ahau/ahau/-/merge_requests/806](https://gitlab.com/ahau/ahau/-/merge_requests/806)

### !804 Dob required + sideNodeDialog editing (MR, merged, 2022-09-27)

Adds validation rules and handling for a required date-of-birth field in NewRegistrationDialog and ProfileForm, updates SideNodeDialog to show contact information to kaitiaki, and merges custom fields into SideNodeDialog when the adminProfile is out of date relative to the profile (which happens when a user updates their own profile without the adminProfile being updated).
- category: `feature`
- ⚠ gotcha: adminProfile can show stale/out-of-date data when a user updates their own profile; author flagged this for further investigation as a separate task.
- [https://gitlab.com/ahau/ahau/-/merge_requests/804](https://gitlab.com/ahau/ahau/-/merge_requests/804)

### !803 Added permissions to whakapapa (MR, merged, 2022-09-25)

Adds view/edit permission options to whakapapa records: updates the whakapapa GraphQL schema and UI (whakapapa index/show cards) to reflect permissions, and hides add/edit controls (NodeMenu, edit button, add parent/partner/child buttons) in SideNodeDialog for non-kaitiaki users viewing a view-only record. Requires publishing updated ssb-whakapapa and @ssb-graphql/whakapapa packages and updating ssb-ahau accordingly.
- category: `feature`
- ⚠ gotcha: Requires coordinated publishing/updating of ssb-whakapapa, @ssb-graphql/whakapapa, and ssb-ahau; tests and smoke tests were not yet passing at time of PR.
- [https://gitlab.com/ahau/ahau/-/merge_requests/803](https://gitlab.com/ahau/ahau/-/merge_requests/803)

### !802 Whakapapa overlapping fixes (MR, merged, 2022-09-23)

Fixes whakapapa graph layout bugs: corrects the ordering of children and the ordering/positioning of partners.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/802](https://gitlab.com/ahau/ahau/-/merge_requests/802)

### !800 Custom Fields - CSV Import/Export (MR, merged, 2022-09-07)

Adds custom fields and additionalColumns support to CSV export/import; unrecognized columns in an imported CSV are auto-created as new custom fields keyed by a generated timestamp and labeled by column name.
- category: `feature`
- ⚠ gotcha: Type handling for auto-created custom fields from CSV import is undecided (TODO: default to string, or prompt the user to specify a type or ignore the field).
- [https://gitlab.com/ahau/ahau/-/merge_requests/800](https://gitlab.com/ahau/ahau/-/merge_requests/800)

### !781 update AlertMessage to use vuex getters within component, better snackbars when saving your profile (MR, merged, 2022-08-18)

Moves AlertMessage's Vuex getters into the component itself and changes the save-profile flow's messaging: the dialog now closes immediately, a persistent loading snackbar shows while the (slower, background bulk) update happens, and it is then overwritten with a completion message once the update and UI reload finish.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/781](https://gitlab.com/ahau/ahau/-/merge_requests/781)

### !773 Mobile 1.5.0 (MR, merged, 2022-08-04)

Mobile release upgrading dependencies and adapting the build to support Node 12+ packages, given that the mobile app only supports Node 12 or earlier; validated via smoke tests covering profile/collection/story/tribe creation, invites, collaborative editing, and Pataka communication.
- category: `infra`
- ⚠ gotcha: Mobile only supports Node 12 or earlier, so the build had to be specially adapted to work with packages requiring Node 12+.
- [https://gitlab.com/ahau/ahau/-/merge_requests/773](https://gitlab.com/ahau/ahau/-/merge_requests/773)

### !772 SVG printing of shown whakapapa (MR, merged, 2022-07-29)

Adds the ability to download the currently shown whakapapa graph as an SVG: embeds images as data-urls, removes zoom controls, and inlines text styles. Author raises an open question about print suitability, since SVG isn't CMYK-friendly and printers typically want PDF.
- category: `feature`
- ⚠ gotcha: SVG export may not be suitable for professional printing (not CMYK-friendly); how to split large drawings into a printable format (e.g. PDF) is unresolved.
- [https://gitlab.com/ahau/ahau/-/merge_requests/772](https://gitlab.com/ahau/ahau/-/merge_requests/772)

### !769 Handling Graphql errors (MR, merged, 2022-07-18)

Adds a proper error-handling pattern for GraphQL errors: introduces an error store that, when set, shows a snackbar at the bottom of the page which can be expanded to view error details, replacing the prior approach of silently console.logging errors with no user feedback.
- category: `feature`
- ⚠ gotcha: Errors are still also console.logged for debugging since not all possible GraphQL error shapes are fully parsed for display yet.
- [https://gitlab.com/ahau/ahau/-/merge_requests/769](https://gitlab.com/ahau/ahau/-/merge_requests/769)

### !761 Create custom fields (MR, closed, 2022-07-11)

Reworks the tribe-editing UI to bring back flat cards and reorganizes sections, and adds the ability to create and view custom fields when editing a tribe.
- category: `feature`
- ⚠ gotcha: initGroup does not yet save customFields, and adding a 'multiple' field type with options is not yet implemented.
- [https://gitlab.com/ahau/ahau/-/merge_requests/761](https://gitlab.com/ahau/ahau/-/merge_requests/761)

### !757 Add person from list and persist whakapapa sessions (MR, merged, 2022-05-30)

Adds persistence of whakapapa view sessions for faster reloading, and adds the ability to add a person directly from the Person Index either straight to the DB without links or via SideNodeDialog with relationships; also merges the search-whakapapa and expand functionality.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/757](https://gitlab.com/ahau/ahau/-/merge_requests/757)

### !756 Draft: changed how we load and store whakapapa information to make it faster to open... (MR, closed, 2022-05-25)

Draft changing how whakapapa is loaded and stored for faster opening: renames lastView to views to track open whakapapa records and previously opened nodes, changes loadDescendants to only load currently viewable nodes, persists childLinks after leaving a whakapapa for quick reload, and discards viewChanges focus if the previous session was focused on a partner.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/756](https://gitlab.com/ahau/ahau/-/merge_requests/756)

### !750 finished table toggling columns and added isLoadingWhakapapa label to... (MR, merged, 2022-05-20)

A large combined branch (author apologizes for its size) that adds images, multiple filters, and toggleable columns to the people list, a loading label and spinner for whakapapa loading, removes background color from whakapapa icons, hides the timeline/archive toggle when there are no stories, fixes a CSV import bug with people listed more than once, speeds up whakapapa loading via changed node-profile fetching, disables people-list scrolling, moves table filters into a shared lib, caches all profiles in the store, and inverts the auto-collapse setting language.
- category: `feature`
- ⚠ gotcha: Bundles many unrelated features and fixes into one large 'mini-mega branch'; several smoke test checklist items were left unchecked.
- [https://gitlab.com/ahau/ahau/-/merge_requests/750](https://gitlab.com/ahau/ahau/-/merge_requests/750)

### !745 People list export (MR, merged, 2022-05-18)

Adds the ability to export profiles from the people list; verified the exported file can also be re-imported successfully.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/745](https://gitlab.com/ahau/ahau/-/merge_requests/745)

### !744 Move timeline (MR, merged, 2022-05-18)

Moves the timeline view from the side navigation into the archives section, with the ability to swap between archive and timeline views preserved.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/744](https://gitlab.com/ahau/ahau/-/merge_requests/744)

### !742 added csv import from peoples list (MR, merged, 2022-05-17)

Adds the ability to import profiles via CSV from the people list without requiring parent/child link information, while confirming existing parent/child-linked imports and whakapapa importing still work.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/742](https://gitlab.com/ahau/ahau/-/merge_requests/742)

### !741 updated large importing files (MR, merged, 2022-05-16)

Updates large CSV import handling: excludes the header and profile image from required attributes, raises the max import size to 10,000 records, chunks profile and link imports into batches of 100, and updates the loading spinner to show a percentage value.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/741](https://gitlab.com/ahau/ahau/-/merge_requests/741)

### !735 move access options to vuex (MR, merged, 2022-05-11)

Moves accessOptions calculation from individual components into a single Vuex store location, and moves tribes out of profile-mixins into Vuex as well, simplifying currentAccess/accessOptions calculation. Along the way fixes bugs: isKaitiaki incorrectly showing false, missing collections when creating/editing a story, an empty-looking members section when there was only one member, a disabled access button still showing a dropdown, a null-field push error in school/education, and broken UI when a kaitiaki's profile was tombstoned (now hides the kaitiaki section when there is no kaitiaki).
- category: `refactor`
- ⚠ gotcha: TODO noted: users should be barred from joining a group whose kaitiaki has deleted their profile, but this isn't implemented yet.
- [https://gitlab.com/ahau/ahau/-/merge_requests/735](https://gitlab.com/ahau/ahau/-/merge_requests/735)

### !720 List profiles (MR, closed, 2022-04-26)

Adds a toggle to enable/disable auto-collapsing of whakapapa nodes; when disabled, all existing collapsed-node state is wiped and future nodes load uncollapsed, and when enabled, new nodes auto-collapse after loading 2 generations. Auto-collapse defaults to true.
- category: `feature`
- ⚠ gotcha: Turning auto-collapse off wipes existing collapse state and only affects nodes added after the change, to handle graphs still mid-load.
- [https://gitlab.com/ahau/ahau/-/merge_requests/720](https://gitlab.com/ahau/ahau/-/merge_requests/720)

### !715 upgrade ahoy (MR, merged, 2022-04-06)

Upgrades ssb-ahoy to Electron 18 and shrinks the desktop build size by moving video content to YouTube, optimizing large images via Photoshop, bundling desktop/main.js into a single file with noderify for faster startup, and trimming electron-builder config to include only necessary modules (keeping exceptions for native-dependency modules and ssb-ahau migrations).
- category: `infra`
- ⚠ gotcha: electron-builder config excludes most modules by design except those with native (C) bindings and ssb-ahau migrations — easy to break the build by missing an exception.
- files mentioned: `desktop/main.js`
- [https://gitlab.com/ahau/ahau/-/merge_requests/715](https://gitlab.com/ahau/ahau/-/merge_requests/715)

### !712 awesome spacing (MR, merged, 2022-03-25)

Fixes whakapapa graph layout so cousins' partners no longer collide, and adjusts spacing so cousins sit slightly further apart than siblings while siblings with partners are packed more closely together.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/712](https://gitlab.com/ahau/ahau/-/merge_requests/712)

### !709 include ignored children in raw childLinks etc (MR, merged, 2022-03-20)

Fixes a bug where getRawChildLinks and related functions weren't returning ignored profiles, causing a person's SideNodeDialog to not display all of their children (ignored children should be included). Author is unsure if this is the right solution and requests review, noting it didn't visibly break existing trees they checked.
- category: `bug`
- ⚠ gotcha: Author is uncertain whether this fix is the correct approach and explicitly asks for review before relying on it.
- [https://gitlab.com/ahau/ahau/-/merge_requests/709](https://gitlab.com/ahau/ahau/-/merge_requests/709)

### !693 Link delete refactor (MR, merged, 2022-03-11)

Consolidates all link-deletion logic into a single Vuex action (deleteChildLink) that finds and deletes the link, adjusts any affected importantRelationships (persisting and updating Vuex), and updates local childLinks state to redraw the graph, rather than spreading this logic across the UI.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/693](https://gitlab.com/ahau/ahau/-/merge_requests/693)

### !688 Load more down (MR, merged, 2022-03-07)

Adds a depth concept to loadDescendants: it still loads the full graph of links but auto-collapses nodes after 2 generations so they render instantly when expanded (since links were already looked up), and loads 2 more generations at a time going forward. Also fixes a bug where loadDescendants was being called twice, and changes the "..." indicator to only show on nodes with undrawn children or partners.
- category: `feature`
- ⚠ gotcha: loadDescendants was previously firing twice (now fixed); a linked hackmd doc tracks further known bugs for this PR.
- [https://gitlab.com/ahau/ahau/-/merge_requests/688](https://gitlab.com/ahau/ahau/-/merge_requests/688)

### !682 change focus to partners on click (MR, merged, 2022-02-28)

Restores the ability to click a partner to focus on them and see their ancestors, currently loading 3 generations above the partner; also changes the graph's repositioning behavior so the newly focused node is drawn at (0,0) rather than at its previous location, though the author notes the graph ideally should reposition to keep the clicked node under the mouse.
- category: `feature`
- ⚠ gotcha: Only loads 3 generations of ancestors above a focused partner, and the graph re-centers on the new focus rather than keeping it under the cursor.
- [https://gitlab.com/ahau/ahau/-/merge_requests/682](https://gitlab.com/ahau/ahau/-/merge_requests/682)

### !679 prioritise partner positioning on birth relationships (MR, merged, 2022-02-24)

Changes partner positioning in the whakapapa graph to be based only on birth children rather than all child relationships, since adopted/whangai children were pulling partners into unintuitive graph positions. Author flags this may need further tuning across different family structures.
- category: `bug`
- ⚠ gotcha: Positioning now considers only birth children, which may need further tuning for families with many adopted/whangai relationships.
- [https://gitlab.com/ahau/ahau/-/merge_requests/679](https://gitlab.com/ahau/ahau/-/merge_requests/679)

### !676 draw all links (MR, merged, 2022-02-23)

Reworks how links are drawn in the whakapapa graph: all link-defining logic moved into the vuex tree module, removing mapPartners and ghostPartner; avatar coordinates now represent the image center to simplify drawing math; extracted graph-related constants replace ad hoc 'fudge factors'; uses d3 to count all nodes in the graph.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/676](https://gitlab.com/ahau/ahau/-/merge_requests/676)

### !675 delete links connected to a person when the person is deleted (MR, merged, 2022-02-17)

Deleting a person now cascades to delete all associated links (child-links, partners, mentions, contributors) via a graphql endpoint, verified by checking backend tombstone logging and confirming the UI no longer shows the links.
- category: `feature`
- ⚠ gotcha: Author is unsure whether this cascade delete should also apply when a user closes their Ahau account.
- [https://gitlab.com/ahau/ahau/-/merge_requests/675](https://gitlab.com/ahau/ahau/-/merge_requests/675)

### !668 updated add avatar button to show even if theres no tribe members (MR, closed, 2022-01-12)

The 'add avatar' button now shows even when a tribe has no members, and the empty-state text was updated to read 'no members found'.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/668](https://gitlab.com/ahau/ahau/-/merge_requests/668)

### !633 MEGA BRANCH - smaller-data (MR, merged, 2021-11-18)

Large branch aimed at minimizing data passed around the whakapapa tree by having each node fetch its own data, using a 'stale-while-revalidate' strategy (adapted from the swrv library) that shows the cached Apollo data while fresh data loads from the server. Long-term goal is to load only links data for the whakapapa, which would require tombstoning links to avoid linking in tombstoned profiles.
- category: `decision`
- ⚠ gotcha: Uses stale-while-revalidate caching, so nodes may briefly display stale cached data before the latest data loads.
- [https://gitlab.com/ahau/ahau/-/merge_requests/633](https://gitlab.com/ahau/ahau/-/merge_requests/633)

### !611 No avatars 2 (MR, merged, 2021-10-19)

Fixes the ability to add duplicate profiles to a whakapapa and fixes other-parent whakapapa links incorrectly showing the relationship type; also adds options to toggle hiding avatars and showing extended family in the whakapapa view.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/611](https://gitlab.com/ahau/ahau/-/merge_requests/611)

### !610 allow editing for admin profiles (MR, merged, 2021-10-18)

Merges the group profile and admin profile so admins can edit the admin profile directly, with helper text shown in the side dialog when an admin is viewing/editing an owned profile.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/610](https://gitlab.com/ahau/ahau/-/merge_requests/610)

### !600 Plain avatars (MR, merged, 2021-10-05)

Updates the gender-neutral avatar icon and fixes error handling for the record-count total character display.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/600](https://gitlab.com/ahau/ahau/-/merge_requests/600)

### !598 Kaitiaki-only subgroup (MR, merged, 2021-09-24)

Updates ssb-ahau so that creating a group automatically creates a kaitiaki-only subgroup along with its profiles and links.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/598](https://gitlab.com/ahau/ahau/-/merge_requests/598)

### !593 Whakapapa suggestions parents (MR, merged, 2021-09-07)

Fixes a bug that prevented adding existing parents to the root node of a whakapapa, and refactors parent-suggestion logic into vuex with added tests, including suggestions for sibling parents, ignored parents, and parents' partners.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/593](https://gitlab.com/ahau/ahau/-/merge_requests/593)

### !588 hide archive search bar when there are no stories (MR, merged, 2021-08-31)

Hides the archive search bar when an archive has no stories, since it was previously shown even with nothing to search.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/588](https://gitlab.com/ahau/ahau/-/merge_requests/588)

### !582 Tribe refactor (MR, merged, 2021-08-22)

Refactors tribe-related logic by moving the tribe mutation into the vuex store.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/582](https://gitlab.com/ahau/ahau/-/merge_requests/582)

### !579 Record length (MR, merged, 2021-08-22)

Sets a maximum character length on record forms to prevent overly long record content.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/579](https://gitlab.com/ahau/ahau/-/merge_requests/579)

### !576 Table ui fixes (MR, merged, 2021-08-20)

Updates FilterMenu and its inputs in the whakapapa table UI, moves Sorts into FilterMenu, and sets up view columns to support future development.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/576](https://gitlab.com/ahau/ahau/-/merge_requests/576)

### !575 Added partners to ProfileShow.vue (MR, merged, 2021-08-18)

Adds a partners section to ProfileShow.vue so a person's partners are visible on their profile view.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/575](https://gitlab.com/ahau/ahau/-/merge_requests/575)

### !574 tidy config, logging of karakia and startup info (MR, merged, 2021-08-16)

Reduces the amount of state persisted to `config` to fix mystery bugs that were blocking app startup, and pulls in improved startup/karakia logging work from pataka-cli for clearer terminal output across different environments.
- category: `bug`
- ⚠ gotcha: Fix relies on persisting less data to `config`; reverting that could reintroduce the startup bugs.
- [https://gitlab.com/ahau/ahau/-/merge_requests/574](https://gitlab.com/ahau/ahau/-/merge_requests/574)

### !573 Prevent recursive whakapapa loops (MR, merged, 2021-08-16)

Fixes a bug where creating a new whakapapa tree from an existing person could produce an infinite loop by adding one of that person's ancestors as a child; fix filters ancestors out of child-suggestion lists.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/573](https://gitlab.com/ahau/ahau/-/merge_requests/573)

### !572 Table partners (MR, merged, 2021-08-12)

Adds a 'Partners' column to Table.vue showing partner avatars/names, with single-partner rows showing avatar and name and multi-partner rows showing only avatar icons; clicking a partner avatar opens them in SideNodeDialog.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/572](https://gitlab.com/ahau/ahau/-/merge_requests/572)

### !571 Added partners section to SideNodeDialog.cue (MR, merged, 2021-08-12)

Adds a partners section to SideNodeDialog.vue, letting users view partners, click through to a partner's profile, and add a new partner via a '+' button.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/571](https://gitlab.com/ahau/ahau/-/merge_requests/571)

### !570 realign dialog actions (MR, merged, 2021-08-09)

Re-aligns the save/cancel dialog action buttons to be centered on the vertical axis.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/570](https://gitlab.com/ahau/ahau/-/merge_requests/570)

### !567 Whakapapa table filters (MR, merged, 2021-08-01)

Adds location, skills, and age-range filters to FilterMenu.vue in the whakapapa table, supporting combined multi-filter queries.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/567](https://gitlab.com/ahau/ahau/-/merge_requests/567)

### !566 Add story to collection (MR, merged, 2021-07-30)

Fixes the 'New Story' button inside a collection view so a newly created story is actually added to that open collection by default; other collections can still be freely added or removed on the story.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/566](https://gitlab.com/ahau/ahau/-/merge_requests/566)

### !565 Related to (MR, merged, 2021-07-29)

Changes the ProfileForm label to read 'Related to {Name} by', dynamically showing the name of the person being referenced when adding a parent or child.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/565](https://gitlab.com/ahau/ahau/-/merge_requests/565)

### !564 Open related collection (MR, merged, 2021-07-29)

Lets users click a related collection listed on a story card (StoryCard.vue) to open that collection directly.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/564](https://gitlab.com/ahau/ahau/-/merge_requests/564)

### !551 add slot to Dialog.vue for pinning things underneath dialog top bar (MR, merged, 2021-07-21)

Adds a slot to Dialog.vue for pinning content beneath the dialog's top bar, used so the tabs in the edit-node dialog stay visible/pinned when scrolling.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/551](https://gitlab.com/ahau/ahau/-/merge_requests/551)

### !548 fix private profiles trying to save joining questions (MR, merged, 2021-07-21)

Fixes a bug preventing creation or editing of a community that has joining questions, caused by private profiles failing to save those questions.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/548](https://gitlab.com/ahau/ahau/-/merge_requests/548)

### !546 Skeleton loaders (MR, merged, 2021-07-20)

Adds skeleton loaders to Profile.vue so a loading placeholder is shown while profile data is being fetched.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/546](https://gitlab.com/ahau/ahau/-/merge_requests/546)

### !545 Personal Settings Tab (MR, merged, 2021-07-19)

Moves personal settings into a 'Settings' tab within ProfileForm/EditNodeDialog, alongside the existing 'Profile' tab, so users can navigate between profile editing and settings (including language and the delete-Ahau dialog) in one dialog.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/545](https://gitlab.com/ahau/ahau/-/merge_requests/545)

### !542 hide action buttons when keyboard is open on mobile dialogs (MR, merged, 2021-07-11)

On mobile, dialog action buttons are now hidden while the on-screen keyboard is open (i.e., when an input is focused), preventing them from overlapping or being obscured by the keyboard.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/542](https://gitlab.com/ahau/ahau/-/merge_requests/542)

### !541 Record permissions (MR, merged, 2021-07-11)

Adds group-based permissions to record access, updates record access so tribe access can't be changed independently of tribe membership, and includes minor UI changes; the actual permission settings are disabled pending backend support.
- category: `feature`
- ⚠ gotcha: Permission settings are disabled/non-functional in the UI until the corresponding backend work is completed.
- [https://gitlab.com/ahau/ahau/-/merge_requests/541](https://gitlab.com/ahau/ahau/-/merge_requests/541)

### !540 Groups ui (MR, merged, 2021-07-10)

Adds a Groups tab to the community profile dialog with UI for creating, editing, and deleting groups and managing their members; group creation itself remains disabled until the backend is connected.
- category: `feature`
- ⚠ gotcha: Group creation UI is present but disabled until the groups backend is enabled; changelog was intentionally not updated since this is front-end only.
- [https://gitlab.com/ahau/ahau/-/merge_requests/540](https://gitlab.com/ahau/ahau/-/merge_requests/540)

### !539 Upgrade mobile (MR, merged, 2021-07-07)

Upgrades mobile package versions, hides storage settings on mobile since it isn't yet supported there, and removes an unused import that was causing a lint failure.
- category: `chore`
- ⚠ gotcha: Storage settings are hidden on mobile because that feature isn't supported on the mobile platform yet.
- [https://gitlab.com/ahau/ahau/-/merge_requests/539](https://gitlab.com/ahau/ahau/-/merge_requests/539)

### !538 Mobile artefact upload (MR, merged, 2021-07-07)

Implements uploading of hyperblobs using FormData on mobile, enabling artefact/blob uploads (including common ssb blobs) from the mobile client.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/538](https://gitlab.com/ahau/ahau/-/merge_requests/538)

### !536 Group permission (MR, merged, 2021-07-04)

Adds a (currently disabled) permissions tab controlling whether group members can create collections/whakapapa records, restricts creating new whakapapa and collections to kaitiaki only, and prevents users from changing record access themselves.
- category: `feature`
- ⚠ gotcha: The new permission select control is disabled until backend support for it is plugged in.
- [https://gitlab.com/ahau/ahau/-/merge_requests/536](https://gitlab.com/ahau/ahau/-/merge_requests/536)

### !535 Applicant Profile (MR, merged, 2021-07-01)

Before a group application is created, a profile is now made from a copy of the applicant's details and encrypted for the group admins plus the applicant; the new profile's id is attached to the application so kaitiaki can view the applicant's profile information when reviewing it.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/535](https://gitlab.com/ahau/ahau/-/merge_requests/535)

### !534 Show all parents (MR, merged, 2021-06-30)

Fixes a bug where a second parent added to a person wouldn't appear on the whakapapa graph unless that parent was also linked as a partner; now all parents display regardless of partner status.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/534](https://gitlab.com/ahau/ahau/-/merge_requests/534)

### !533 Right click context menu (MR, merged, 2021-06-30)

Adds a right-click context menu on desktop and a long-press context menu on mobile for whakapapa nodes in both the tree and table views.
- category: `feature`
- ⚠ gotcha: A known bug (tracked separately in Asana) currently prevents the node context menu from opening in the whakapapa table view.
- [https://gitlab.com/ahau/ahau/-/merge_requests/533](https://gitlab.com/ahau/ahau/-/merge_requests/533)

### !532 Table node menu bug (MR, merged, 2021-06-29)

Fixes a bug in the whakapapa registry/table where the node context menu was not opening; left-click on the node menu button and right-click both now correctly open it.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/532](https://gitlab.com/ahau/ahau/-/merge_requests/532)

### !531 ON-HOLD: add get stories to vuex (MR, closed, 2021-06-26)

On-hold branch that moves all 'get stories' calls (by group, by mention, for related-record dropdowns, for collection dropdowns) into vuex store functions rather than fetching directly in components.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/531](https://gitlab.com/ahau/ahau/-/merge_requests/531)

### !529 Delete Story - to vuex + snackbar (MR, merged, 2021-06-24)

Creates a new vuex 'story' module and moves the deleteStory function into it, and adds a success snackbar notification when a story is deleted.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/529](https://gitlab.com/ahau/ahau/-/merge_requests/529)

### !527 analytics - send version of application to mixpanel (MR, merged, 2021-06-24)

Adds a `version` field to the application analytics events sent to Mixpanel.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/527](https://gitlab.com/ahau/ahau/-/merge_requests/527)

### !523 Delete Ahau Phrase Confirmation (MR, merged, 2021-06-21)

Requires the user to type a confirmation phrase before the 'Delete Ahau' button is enabled, adding a safeguard against accidentally deleting the local database and profiles.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/523](https://gitlab.com/ahau/ahau/-/merge_requests/523)

### !522 whakapapa view to store (MR, merged, 2021-06-21)

Migrates the whakapapa vuex store module to the newer store pattern and adds a getWhakapapaView action/getter to it.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/522](https://gitlab.com/ahau/ahau/-/merge_requests/522)

### !521 mobile: fix upload of common pictures (MR, merged, 2021-06-19)

Fixes picture upload on mobile, which was broken because a mobile plugin was overwriting the global `File` object.
- category: `bug`
- ⚠ gotcha: Root cause was a mobile plugin silently overwriting the global `File` object.
- [https://gitlab.com/ahau/ahau/-/merge_requests/521](https://gitlab.com/ahau/ahau/-/merge_requests/521)

### !519 Remove kaitiaki bug (MR, closed, 2021-06-17)

Fixes a bug where removing a kaitiaki in NewCommunityDialog did not also remove them from the kaitiaki list on the associated profile.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/519](https://gitlab.com/ahau/ahau/-/merge_requests/519)

### !518 New tribe bug (MR, merged, 2021-06-17)

Fixes a bug preventing NewCommunityDialog from opening when creating a new tribe; the fix required disabling the kaitiaki tab within that dialog.
- category: `bug`
- ⚠ gotcha: The kaitiaki tab in NewCommunityDialog had to be disabled as part of the fix, so kaitiaki can't be managed there for now.
- [https://gitlab.com/ahau/ahau/-/merge_requests/518](https://gitlab.com/ahau/ahau/-/merge_requests/518)

### !517 Save kaitiaki (MR, merged, 2021-06-17)

Adds saving of kaitiaki (community guardians) as authors within NewCommunityDialog when a new community is created, so multiple kaitiaki are properly tracked and can receive group join applications.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/517](https://gitlab.com/ahau/ahau/-/merge_requests/517)

### !515 Tiaki members (MR, merged, 2021-06-16)

Reworks the multiple-kaitiaki UI to list tribe members not yet selected as kaitiaki in a dropdown, letting users add any member as kaitiaki or delete kaitiaki (including themselves) from the list.
- category: `feature`
- ⚠ gotcha: At least one kaitiaki must always remain — deleting all kaitiaki is blocked.
- [https://gitlab.com/ahau/ahau/-/merge_requests/515](https://gitlab.com/ahau/ahau/-/merge_requests/515)

### !514 Multiple kaitiaki (MR, merged, 2021-06-13)

Adds the ability to add a kaitiaki to a community from the edit community profile dialog, converting the dialog to use tabs with tribal registration questions in their own tab and a new kaitiaki management tab.
- category: `feature`
- ⚠ gotcha: Kaitiaki management tab was still marked WIP and automated tests were not passing at merge time.
- [https://gitlab.com/ahau/ahau/-/merge_requests/514](https://gitlab.com/ahau/ahau/-/merge_requests/514)

### !511 Draft: Invite members to join tribe (MR, closed, 2021-06-07)

Proposes letting users invite people to join their tribe via a direct message plus a join code that extends the existing pataka-code mechanism to carry a tribal registration; the invite dialog UI and code-generation were built but the API to list known Ahau users and the notification flow were left unimplemented.
- category: `feature`
- ⚠ gotcha: Left as an unfinished draft — invite API and notification handling were never completed; MR closed unmerged.
- [https://gitlab.com/ahau/ahau/-/merge_requests/511](https://gitlab.com/ahau/ahau/-/merge_requests/511)

### !510 Use server backup (MR, merged, 2021-06-05)

Wires up the ssb-ahau backup query to trigger a backup file download on both desktop and mobile, and marks the backup notification as read once the backup has been generated.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/510](https://gitlab.com/ahau/ahau/-/merge_requests/510)

### !509 New onboarding (MR, merged, 2021-06-05)

Updates the Pataka onboarding flow so new users are prompted to join a Pataka right after creating a profile, and adds a new PatakaHelperDialog offering users additional onboarding options.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/509](https://gitlab.com/ahau/ahau/-/merge_requests/509)

### !507 Ui fixes (MR, merged, 2021-06-03)

Bundles several UI fixes: the landing button, the mobile landing screen, overflow of long community names in the appbar and on profile.vue, overflow of long emails in profile.vue, hiding the tribes list in the appbar when a user has no tribes, and fixing missing addPersonFormTitle translations.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/507](https://gitlab.com/ahau/ahau/-/merge_requests/507)

### !505 Locale picker bug (MR, merged, 2021-06-02)

Fixes a bug where a user's chosen locale wasn't applied until the SettingsDialog was opened; language selection now persists and takes effect on restart without needing to reopen settings.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/505](https://gitlab.com/ahau/ahau/-/merge_requests/505)

### !504 Delete ahau (MR, merged, 2021-05-31)

Adds the UI flow for a user to delete their Ahau profile: confirming via DeleteProfileDialog tombstones their public profile and replaces their feedId with a placeholder across all tribe profiles they belong to.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/504](https://gitlab.com/ahau/ahau/-/merge_requests/504)

### !503 fix create collection bug (MR, merged, 2021-05-30)

Fixes a bug where creating a new collection errored out instead of succeeding; create, edit, and delete collection flows were verified to work correctly afterward.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/503](https://gitlab.com/ahau/ahau/-/merge_requests/503)

### !498 Storage Management (MR, merged, 2021-05-24)

Adds storage management: shows how much space Ahau is using, lets the user set a max storage limit, persists the chosen storage setting, and refactors existing settings code by moving language-related settings into their own file.
- category: `feature`
- ⚠ gotcha: Testing auto-pruning requires configuring custom hyperBlobs.autoPrune delay/interval in desktop/ssb.config.js, having remote peers with hyperBlobs, and possibly manually lowering ssb-ahau's MAX_AHAU_SIZE constant.
- files mentioned: `desktop/ssb.config.js`
- [https://gitlab.com/ahau/ahau/-/merge_requests/498](https://gitlab.com/ahau/ahau/-/merge_requests/498)

### !497 WIP New navbar (MR, merged, 2021-05-23)

Changes the navbar so it lists all of the user's tribes and lets them click between tribes to switch context.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/497](https://gitlab.com/ahau/ahau/-/merge_requests/497)

### !496 Node Menu Translations (MR, merged, 2021-05-19)

Adds missing translation strings for NodeMenu.vue.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/496](https://gitlab.com/ahau/ahau/-/merge_requests/496)

### !494 added deathplace and buriallocation translations (MR, merged, 2021-05-19)

Adds missing translations for the deathplace and buriallocation fields in ProfileForm.vue.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/494](https://gitlab.com/ahau/ahau/-/merge_requests/494)

### !493 I18n deletenode (MR, merged, 2021-05-18)

Implements translations for text in DeleteNodeDialog.vue.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/493](https://gitlab.com/ahau/ahau/-/merge_requests/493)

### !492 added translations for SideNodeDialog.vue (MR, merged, 2021-05-18)

Implements translations for text in SideNodeDialog.vue.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/492](https://gitlab.com/ahau/ahau/-/merge_requests/492)

### !491 update ssb-ahau, add ssb-settings, revert electron change (MR, merged, 2021-05-18)

Updates the ssb-ahau and ssb-settings modules and wires ssb-settings into the app (verified via whoami.personal.settings in the GraphQL playground), while also reverting a previous electron-related change.
- category: `chore`
- ⚠ gotcha: Includes a revert of an earlier electron change bundled in with the dependency updates.
- [https://gitlab.com/ahau/ahau/-/merge_requests/491](https://gitlab.com/ahau/ahau/-/merge_requests/491)

### !490 Settings UI Language Locale in Profile Show (MR, merged, 2021-05-17)

Adds a Settings UI in ProfileShow with a language locale picker, letting users change the app language from the new Settings dialog.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/490](https://gitlab.com/ahau/ahau/-/merge_requests/490)

### !485 changes (MR, merged, 2021-05-13)

Adds more translations across the app and fixes several translation JSON files that existed but had not actually been registered in their index.js files.
- category: `chore`
- ⚠ gotcha: Some translation JSON files had been created but never wired into their index.js — a source of silently missing translations.
- [https://gitlab.com/ahau/ahau/-/merge_requests/485](https://gitlab.com/ahau/ahau/-/merge_requests/485)

### !484 WIP: Add mention to story when name has a macron (MR, closed, 2021-05-11)

Attempts to fix a bug where searching to mention/add a person to a record fails to find them when their name contains a macron, but the fix was left incomplete (smoke tests and checks unfilled) and the MR was closed unmerged.
- category: `bug`
- ⚠ gotcha: Closed without a working fix — macron-containing names may still fail to match in search/mention.
- [https://gitlab.com/ahau/ahau/-/merge_requests/484](https://gitlab.com/ahau/ahau/-/merge_requests/484)

### !480 Key Backup UI (MR, merged, 2021-05-05)

Adds a key backup UI: integrates ssb-settings, adds a KeyBackupDialog and download button in SettingsDialog to back up the personal key, group keys, known pataka locations and latest message sequence number, and adds a notification prompting the user to back up their key (flips keyBackedUp to true once done).
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/480](https://gitlab.com/ahau/ahau/-/merge_requests/480)

### !478 WIP: Electron upgrade (MR, merged, 2021-05-05)

Upgrades Electron-related dependencies (ssb-ahoy to v4.0.0, electron-builder to v22.10.5, electron-notarize to v1.0.0) and bumps the required Node version to v10.0.0 for electron-notarize compatibility; Mac installers were confirmed to build successfully but Windows installer verification was still pending.
- category: `infra`
- ⚠ gotcha: Windows installer build was not yet verified; an unexplained console warning appears on startup but doesn't seem to break anything.
- [https://gitlab.com/ahau/ahau/-/merge_requests/478](https://gitlab.com/ahau/ahau/-/merge_requests/478)

### !477 Show Artefact Image Bug (MR, merged, 2021-05-04)

Fixes the showArtefact image viewer so images (especially taller ones, e.g. 200x900px) are no longer improperly contained/cropped — the bottom of the image was being cut off when opening an artefact from a story card.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/477](https://gitlab.com/ahau/ahau/-/merge_requests/477)

### !463 small archive refactor (MR, merged, 2021-04-24)

Refactors the archive: fixes a delete-story bug, speeds up story/collection reloads after create/update/delete, and removes ArchiveHome.vue by merging it into Archive.vue. The root cause was that CollectionShow and Archive both redundantly reloaded the same stories whenever a collection was edited; the fix removes CollectionShow as a child route of Archive and introduces a per-usage reload function convention for the processStory mixin.
- category: `refactor`
- files mentioned: `Archive.vue`, `ArchiveHome.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/463](https://gitlab.com/ahau/ahau/-/merge_requests/463)

### !460 final translations for view-archive.json (MR, closed, 2021-04-23)

Adds final translation changes to view-archive.json for the archive page, but the author was unsure how to wire in the 'your personal archive' translation string, and the MR was closed rather than merged.
- category: `chore`
- ⚠ gotcha: Author left the 'your personal archive' translation unresolved; MR closed without merging.
- [https://gitlab.com/ahau/ahau/-/merge_requests/460](https://gitlab.com/ahau/ahau/-/merge_requests/460)

### !435 plugging in translations for view-person-whakapapa.json (MR, merged, 2021-04-15)

Plugs in translations for view-person-whakapapa.json.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/435](https://gitlab.com/ahau/ahau/-/merge_requests/435)

### !422 Show video icon (MR, merged, 2021-04-13)

Adds a play icon overlay on video posters, prevents videos from actually rendering/playing while editing an artefact or story (showing only a poster instead), removes the standalone Artefact.vue by merging it into ArtefactCarouselItem, and fixes styling for videos/photos across both the render-media path and the normal video/vImg tags.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/422](https://gitlab.com/ahau/ahau/-/merge_requests/422)

### !417 Quick Add Parents/Children/Partners in Tree (MR, merged, 2021-04-08)

Adds quick-add of parent/child/partner profiles directly from the whakapapa tree via NewNodeDialog, using a new ProfileChip component that displays a person's name, place of birth, birth year, and relation.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/417](https://gitlab.com/ahau/ahau/-/merge_requests/417)

### !406 Fix Record Links (MR, merged, 2021-04-06)

Fixes a bug where creating a new record/collection/whakapapa from a personal archive and then changing its access to a community would still let users link people and stories (mentions, related records, profile search bar) from the wrong tribe instead of the newly selected community's archive.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/406](https://gitlab.com/ahau/ahau/-/merge_requests/406)

### !405 I18n initial (MR, merged, 2021-04-06)

Adds translation functionality (English and Te Reo) for all text in add-person-form.json, though some title-translation functionality was not yet working and the author needed to pair with someone to finish it.
- category: `chore`
- ⚠ gotcha: Some title-translation functionality was not working yet at merge time; needed follow-up pairing to resolve.
- [https://gitlab.com/ahau/ahau/-/merge_requests/405](https://gitlab.com/ahau/ahau/-/merge_requests/405)

### !398 Date Picker Read Only Bug (MR, closed, 2021-03-29)

In NewNodeDialog, sets the date-of-birth and date-of-death pickers to read-only when an existing profile is selected, rather than editable.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/398](https://gitlab.com/ahau/ahau/-/merge_requests/398)

### !397 Accept two digit years in CSVs (MR, closed, 2021-03-28)

Fixes a bug where CSV imports rejected birth/death dates given in two-digit (YY) year format instead of requiring four-digit (YYYY) years, and adds tests in csv.test.js covering the fix.
- category: `bug`
- ⚠ gotcha: Two-digit years are auto-formatted as 19YY (not 20YY) — a hardcoded century assumption.
- [https://gitlab.com/ahau/ahau/-/merge_requests/397](https://gitlab.com/ahau/ahau/-/merge_requests/397)

### !388 All access buttons show "story" (MR, merged, 2021-03-22)

Fixes the AccessButton component across multiple dialogs so it shows the relevant content-type string (e.g. record/collection) instead of always displaying "story" regardless of context.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/388](https://gitlab.com/ahau/ahau/-/merge_requests/388)

### !387 upgrade mobile dependencies (MR, merged, 2021-03-21)

Upgrades mobile dependencies, fixes the whakapapa record view by upgrading ssb-profile, bumps the mobile app version, improves archive scroll performance and navigation, and adds hyperblobs serving support (upload not yet included); this MR also folds in two prior MRs (!384 and !386).
- category: `infra`
- ⚠ gotcha: Hyperblobs upload is not yet supported (serving only); intended to be merged only after testing mobile release 1.1.0.
- [https://gitlab.com/ahau/ahau/-/merge_requests/387](https://gitlab.com/ahau/ahau/-/merge_requests/387)

### !386 improve archive scroll perf (MR, closed, 2021-03-21)

Attempts to improve archive scroll performance in Cordova by rendering a static whakapapa PNG icon for stories (cause of the improvement unclear), caching a previously-computed method as a computed property, trimming extra carousel images when listing stories, and adding a passive event flag to story card clicks; timed to merge after testing release 1.0.9.
- category: `refactor`
- ⚠ gotcha: Root cause of the performance gain from swapping in a static PNG icon is not understood/documented.
- [https://gitlab.com/ahau/ahau/-/merge_requests/386](https://gitlab.com/ahau/ahau/-/merge_requests/386)

### !381 fix mobile titlebar color (MR, merged, 2021-03-16)

Fixes the color of the mobile app's titlebar.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/381](https://gitlab.com/ahau/ahau/-/merge_requests/381)

### !375 Partners (MR, merged, 2021-03-09)

Sets up the whakapapa tree in Storybook and refactors most existing tree features (rendering, centering, collapsing, profile search restricted to one owned profile per group, add-person dialog handling), moving sibling-order and birth-order calculation to the backend; adds new features to add, remove, and edit partners from the tree menu, quick-add parents/children/partners, and relationship lines including dotted lines for adopted/whangai relationships.
- category: `feature`
- ⚠ gotcha: Sibling and birth-order calculation moved from frontend to backend as part of this refactor — a behavioral dependency shift for anything relying on the old frontend logic.
- [https://gitlab.com/ahau/ahau/-/merge_requests/375](https://gitlab.com/ahau/ahau/-/merge_requests/375)

### !372 Update profiles (MR, merged, 2021-03-08)

Reorganizes ProfileForm by moving several fields into a 'More info' section, resizes the avatar and gender icons, relabels fields, and adds new independent education and school fields.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/372](https://gitlab.com/ahau/ahau/-/merge_requests/372)

### !369 WIP: Add viewer server (MR, closed, 2021-03-07)

Proof-of-concept, built with Janeraka Institute for the Awaete peoples of Xingu, for a shared offline/local 'viewer server' device (e.g. Raspberry Pi) that lets a community without individual devices collect and curate cultural data via password-protected login, syncing with normal Ahau users; adapts ssb-ahau for cloud/http serving, but most of the task list (translations, curation archive UI, docker-compose deploy, per-query GraphQL authorization, publishedStatus workflow) was left unimplemented and the MR was closed.
- category: `infra`
- ⚠ gotcha: Closed as an incomplete proof-of-concept; per-query authorization, docker-compose deployment, and the publishedStatus review workflow were never implemented.
- [https://gitlab.com/ahau/ahau/-/merge_requests/369](https://gitlab.com/ahau/ahau/-/merge_requests/369)

### !368 Mobile backbutton fixes (MR, merged, 2021-03-07)

Fixes the mobile back button so it hides the logo instead of showing both at once, fixes it appearing when viewing the archive by replacing a keepAlive/route-based check with a store property toggled by button actions, and adjusts DatePicker padding so it fits in SideViewEditNodeDialog and on mobile without wrapping.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/368](https://gitlab.com/ahau/ahau/-/merge_requests/368)

### !359 Filter Menu: Filter on Names (MR, merged, 2021-03-02)

Adds a filter menu to the whakapapa table that filters displayed nodes by full name, preferred name, or alt names.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/359](https://gitlab.com/ahau/ahau/-/merge_requests/359)

### !346 added skeleton loader to collections (MR, merged, 2021-02-18)

Adds a skeleton loading state to the collections view, which previously had no loading indicator.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/346](https://gitlab.com/ahau/ahau/-/merge_requests/346)

### !345 Dob date picker update (MR, merged, 2021-02-18)

Fixes the buggy date-of-birth picker by switching it from v-autocomplete to v-select, simplifying the component; also changes the displayed month text to a full name (e.g. 'February') while the underlying stored value remains numeric (e.g. '02').
- category: `bug`
- ⚠ gotcha: date.month.text now shows the full month name while date.month.value stays numeric — a display/value mismatch to watch for.
- [https://gitlab.com/ahau/ahau/-/merge_requests/345](https://gitlab.com/ahau/ahau/-/merge_requests/345)

### !342 Collections ui title (MR, merged, 2021-02-11)

Adds an image, title, and description when viewing an individual collection, adds a CollectionViewDialog for mobile users to see collection info, allows adding stories directly from the collection edit dialog, and updates the archive/stories page titles to indicate whose archive or stories are being viewed.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/342](https://gitlab.com/ahau/ahau/-/merge_requests/342)

### !339 ProfileForm UI Changes (MR, merged, 2021-02-05)

Reorganizes several ProfileForm fields into a new 'Advanced' section and adjusts field layout; UI-only changes with no functional/data changes.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/339](https://gitlab.com/ahau/ahau/-/merge_requests/339)

### !336 Community Dialog Refactor (MR, merged, 2021-02-03)

Merges NewCommunityDialog and EditCommunityDialog into a single shared dialog component (following the pattern used by NewRecordDialog + RecordForm) since the two had nearly duplicate code, removing a lot of unused code with no changes to the UI.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/336](https://gitlab.com/ahau/ahau/-/merge_requests/336)

### !333 Draft: move text fields into component (MR, closed, 2021-01-28)

Tidies up the RecordForm component by removing unused code and moving tooltips into a reusable component, with the plan to reuse the tidied component elsewhere over time; the author states the UI should look identical since only internal code changed. Closed as a draft, not merged.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/333](https://gitlab.com/ahau/ahau/-/merge_requests/333)

### !328 Whakapapa Table DOB and DOD (MR, merged, 2021-01-06)

Adds Date of Birth, Date of Death (when applicable), and Alt name(s) columns to the whakapapa table, and fixes a bug where alternate names were not showing on a person's profile when edited via the whakapapa table/tree.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/328](https://gitlab.com/ahau/ahau/-/merge_requests/328)

### !327 Table focus (MR, merged, 2021-01-05)

Implements a centre-and-focus function in the whakapapa table similar to the existing whakapapa tree, letting a user search for a person and have them scrolled into the middle of the screen.
- category: `feature`
- ⚠ gotcha: Scroll centering uses a hardcoded 400px offset; author is unsure if it will work well at other screen resolutions.
- [https://gitlab.com/ahau/ahau/-/merge_requests/327](https://gitlab.com/ahau/ahau/-/merge_requests/327)

### !326 Fix mobile build/distribution to Android and iOS (MR, merged, 2021-01-04)

Fixes the mobile build/distribution pipeline (via Cordova) to Android, addressing gitlab.com/ahau/whakapapa-ora issue #26.
- category: `infra`
- [https://gitlab.com/ahau/ahau/-/merge_requests/326](https://gitlab.com/ahau/ahau/-/merge_requests/326)

### !325 Upload file limit (MR, merged, 2020-12-15)

Moves file upload logic into a mixin to centralize file-size-limit error handling, and moves ConfirmationText into App.vue so it can be reused globally, wiring it into file upload (snackbar on failure) and ProfileShow.
- category: `refactor`
- ⚠ gotcha: TODO items left undone: broader error-handling messaging and success alerts on submission are not yet implemented.
- [https://gitlab.com/ahau/ahau/-/merge_requests/325](https://gitlab.com/ahau/ahau/-/merge_requests/325)

### !324 fix artefact bugs (MR, merged, 2020-12-15)

Fixes several artefact-related bugs: clicking the artefact slide group, audio auto-play errors, missing playback controls on artefact video/audio, a bug in the get-object-changes function that prevented saving multiple artefacts to a story, a missing audio icon on the archive page, and NewRecordDialog showing a null title when none is set.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/324](https://gitlab.com/ahau/ahau/-/merge_requests/324)

### !312 Whakapapa Table Scrollbar (MR, merged, 2020-12-03)

Adds a horizontal scrollbar to the whakapapa table via CSS overflow, makes WhakapapaView display the tree and table on the full page, and removes the left/right scroll buttons for the table.
- category: `feature`
- ⚠ gotcha: The new horizontal scrollbar renders much thicker than the vertical one; author is unsure how to fix this.
- [https://gitlab.com/ahau/ahau/-/merge_requests/312](https://gitlab.com/ahau/ahau/-/merge_requests/312)

### !310 Whakapapa Table Sort (MR, merged, 2020-12-02)

Adds sorting to the whakapapa record table by age, name, profession, and city/country (ascending and descending) via a new sort menu, defaults the table to flattened view when switching from tree to table, and fixes a bug causing macrons to sort incorrectly.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/310](https://gitlab.com/ahau/ahau/-/merge_requests/310)

### !308 Collections (MR, merged, 2020-11-30)

Adds Collections: default images/text for Chips and ProfileSearchBar dropdown items, and new routing (Archive > ArchiveHome > CollectionShow) for creating collections, linking stories to them, and viewing stories by collection; marked as work-in-progress ('to be continued').
- category: `feature`
- ⚠ gotcha: Creating records on this branch and then switching to another branch with older ssb modules may cause issues.
- [https://gitlab.com/ahau/ahau/-/merge_requests/308](https://gitlab.com/ahau/ahau/-/merge_requests/308)

### !305 Unit tests and getObjectChanges bug fix (MR, merged, 2020-11-26)

Adds unit tests for dateToString/humanDate, fixes an incorrect import of getObjectChanges in NewRecordDialog.vue that was causing archive records to update incorrectly, and fixes broken references to formatSubmissionDate in Collection.vue and StoryCard.vue.
- category: `bug`
- files mentioned: `Collection.vue`, `NewRecordDialog.vue`, `StoryCard.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/305](https://gitlab.com/ahau/ahau/-/merge_requests/305)

### !297 get ui unit tests passing, export initialised apolloProvider for easy consumption (MR, merged, 2020-11-17)

Gets the ui unit test suite running (`npm run test`), though some tests still fail; changes include pulling apolloClient out of person-helper (it was crashing test imports), having plugins/apollo-vue export an instantiated apolloProvider for easy reuse, letting getRelatives take an optional apollo argument for Vuex, removing duplicate getRelatives code, and deleting the unused profile-helper (superseded by person-helper and community-helper).
- category: `refactor`
- ⚠ gotcha: Some ui unit tests still fail after this change, and it has only been verified on Linux, not Windows.
- [https://gitlab.com/ahau/ahau/-/merge_requests/297](https://gitlab.com/ahau/ahau/-/merge_requests/297)

### !285 Improved navigation (MR, merged, 2020-09-30)

Removes profile and whakapapa links from ancestor profiles and adds temporary back buttons, to stop users getting stuck and having to jump back to the tribe/home profile to reset navigation.
- category: `feature`
- ⚠ gotcha: Back buttons are described as a temporary measure; author expects this to be much improved once a proper router system exists.
- [https://gitlab.com/ahau/ahau/-/merge_requests/285](https://gitlab.com/ahau/ahau/-/merge_requests/285)

### !277 seperated whakapapa into groups and gave them titles (MR, merged, 2020-09-19)

Removes whakapapa from the navbar when not viewing a community or personal profile (until whakapapa shared with connected profiles can be shown), and groups whakapapa by recps when viewing a personal profile.
- category: `feature`
- ⚠ gotcha: Depends on the not-yet-available ability to getGroupProfiles/TribeFaces from a cloaked groupId.
- [https://gitlab.com/ahau/ahau/-/merge_requests/277](https://gitlab.com/ahau/ahau/-/merge_requests/277)

### !275 update modules needed for getConnectedPeers (MR, merged, 2020-09-14)

Updates modules to expose the new getConnectedPeers GraphQL API (added to @ssb-graphql/profile), updates the communitiesList and profile card UI to show pataka and their online/offline status, moves pataka connection into a dialog, adds a success snackbar plus a vuex 'setSyncing' action that drives navbar sync progress bars, and fixes minor bugs in sideNav (missing request-to-join button) and navbar UI.
- category: `feature`
- ⚠ gotcha: The syncing progress bar is driven by a timeout rather than an actual completion signal.
- [https://gitlab.com/ahau/ahau/-/merge_requests/275](https://gitlab.com/ahau/ahau/-/merge_requests/275)

### #5 Bug - wrong access on archives (ISSUE, closed, 2020-09-01)

Creating a story/archive from a profile auto-adds mentions/contributors tied to the creator's private profile group; changing the archive's access to a different group afterward does not update those mentions/contributors, so when another person loads the story it breaks because the mentions still reference a profile in the wrong access group.
- category: `bug`
- ⚠ gotcha: changing an archive's access group after creation leaves stale mention/contributor references pointing at the original private group.
- [https://gitlab.com/ahau/ahau/-/work_items/5](https://gitlab.com/ahau/ahau/-/work_items/5)

### !253 patch editing a partner by disabling editing of relationships (MR, closed, 2020-08-31)

Patches a bug (gitlab.com/ahau/whakapapa-ora issue #4) where the relationship field wasn't set on partner profiles when editing them, by only allowing relationship editing while creating a new profile. Author considers this a poor fix and proposes a deeper solution: giving ProfileForm a `relationships` array (linkId, relationshipType, legallyAdopted, profileId, profile) with per-relationship form fields. Closed without the deeper fix being implemented.
- category: `bug`
- ⚠ gotcha: Workaround only allows editing relationships when creating a new profile, not on existing ones; author explicitly calls this inadequate and the MR was closed rather than merged.
- [https://gitlab.com/ahau/ahau/-/merge_requests/253](https://gitlab.com/ahau/ahau/-/merge_requests/253)

### #4 BUG - editing a second parents/partner profile in SideViewEditNodeDialog fails (ISSUE, closed, 2020-08-31)

Editing a second parent's or partner's profile via SideViewEditNodeDialog, after switching the whakapapa tree focus to that person, throws "TypeError: Cannot read property 'linkId' of undefined" on submit and the changes are not saved or reflected. Reporter suspects the relationshipLinks array in the vuex store only holds links for the original tree focus, not the new one after switching.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/work_items/4](https://gitlab.com/ahau/ahau/-/work_items/4)

### #3 BUG - can delete a profile and break other whakapapa records (ISSUE, closed, 2020-08-31)

Deleting/tombstoning a person's profile from one whakapapa (B) does not check whether that person is also an integral part of another whakapapa (A); A still loads afterward, but adding a parent to the tombstoned person then causes her and her descendants to silently disappear from A because the deleted record is ignored when relatives are loaded. Reporter expects the app to at least warn before allowing deletion of a record referenced elsewhere.
- category: `bug`
- ⚠ gotcha: no referential-integrity check before tombstoning a profile shared across multiple whakapapa records; can silently corrupt other trees.
- [https://gitlab.com/ahau/ahau/-/work_items/3](https://gitlab.com/ahau/ahau/-/work_items/3)

### !249 seperate caps for each NODE_ENV, and new "staging" env (MR, merged, 2020-08-28)

Separates connection capabilities per NODE_ENV and adds a new 'staging' environment so apps run in different modes won't connect to or replicate with each other; staging is launched via `NODE_ENV=staging` before the executable.
- category: `infra`
- ⚠ gotcha: Launching with the NODE_ENV variable is expected to differ on Mac and Windows from the documented Linux/AppImage example.
- [https://gitlab.com/ahau/ahau/-/merge_requests/249](https://gitlab.com/ahau/ahau/-/merge_requests/249)

### !238 Tribe records (MR, closed, 2020-08-10)

Adds the ability to create whakapapa and stories within a group (tribe) as well as in a personal group, requiring an updated ssb-graphql-profile in server/ and removing a `v-if="type === community"` guard in ProfileShow's sideNav; also fixes several found bugs: contributor gender not saved, missing view-access indicators on whakapapa cards/dialogs and full story view, access no longer deletable or removable via backspace, access only changes when a new value is selected, and access is now a required field (previously a record could be saved with access removed).
- category: `feature`
- ⚠ gotcha: Access on tribe records can be viewed once set but cannot be edited afterward.
- [https://gitlab.com/ahau/ahau/-/merge_requests/238](https://gitlab.com/ahau/ahau/-/merge_requests/238)

### !234 Fix CSV import bug (MR, merged, 2020-07-31)

Fixes a CSV import bug causing duplicate messages, duplicate profiles, failed decryption, and missing messages, by applying fixes across this repo plus SSB-DB, SSB-Tribes, and SSB-GraphQL/Whakapapa, and adding tests.
- category: `bug`
- ⚠ gotcha: Author flags that commit 1563558d describes minor unresolved problems that should be addressed before merging.
- [https://gitlab.com/ahau/ahau/-/merge_requests/234](https://gitlab.com/ahau/ahau/-/merge_requests/234)

### !231 Community frontend (MR, merged, 2020-07-31)

Adds community frontend functionality: creating, viewing, and deleting communities (deletion via tombstoning public/private profiles and filtering them out client-side in CommunitiesList), viewing all communities, and viewing kaitiaki.
- category: `feature`
- ⚠ gotcha: Adding yourself to a community is not yet implemented; author also questions whether deleted-community filtering should move server-side to the GraphQL layer.
- [https://gitlab.com/ahau/ahau/-/merge_requests/231](https://gitlab.com/ahau/ahau/-/merge_requests/231)

### !225 Can edit (MR, merged, 2020-07-19)

Adds an edit-permission check for Profile, Story, Artefact, and Whakapapa entities based on the current identity, hiding edit buttons/menu options (e.g. add parent/child in the tree context menu) when the user cannot edit.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/225](https://gitlab.com/ahau/ahau/-/merge_requests/225)

### !224 fixes to profileForm (MR, merged, 2020-07-19)

Fixes to ProfileForm: removes the 'no longer living, related by' field from NewNodeDialog/ProfileShow, defaults ProfileShow to show 'birth' relationship, and fixes missing avatar padding when no avatar is set.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/224](https://gitlab.com/ahau/ahau/-/merge_requests/224)

### !223 fixed altnames (MR, closed, 2020-07-19)

Fixes alt names handling in SideViewEditNodeDialog (aka ProfileForm) and its isEditing state. Closed rather than merged.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/223](https://gitlab.com/ahau/ahau/-/merge_requests/223)

### !217 add-community (style changes) (MR, merged, 2020-07-16)

Extracts just the style changes (App.vue and profile components) from the larger 'add-community' branch into their own branch, to make that larger branch easier to review and merge later; includes the git commands used to recreate the extraction.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/217](https://gitlab.com/ahau/ahau/-/merge_requests/217)

### !216 Filter stories (MR, merged, 2020-07-14)

Uses setProfileById (instead of route.params.id) to set currentProfile in ProfileShow and to set selectedProfile in SideViewDialog when switching between family members, adds a filter in archive.vue so only stories mentioning the current profile are shown on their page, and adds setStory in related-records chips to open a related story.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/216](https://gitlab.com/ahau/ahau/-/merge_requests/216)

### !213 Archiving bugs (MR, merged, 2020-07-11)

Fixes archiving-related bugs: related record styles, a toggle-focus bug in the stories search bar, and backspace incorrectly removing existing search items. Author attempted but failed to fix related date-input UX problems (auto-select first item, tab-to-next, delete-to-clear with v-autocomplete + date picker) and left the attempted code plus a follow-up card.
- category: `bug`
- ⚠ gotcha: Date-input UX issues with v-autocomplete and the date picker remain unresolved; attempted fix code was left in place and deferred to a separate task.
- [https://gitlab.com/ahau/ahau/-/merge_requests/213](https://gitlab.com/ahau/ahau/-/merge_requests/213)

### !211 Record ui fixes (MR, merged, 2020-07-09)

Fixes several record UI bugs: age showing as null, a misplaced line when a profile has no family members, hides access/creator/cultural narrative fields (not yet supported by the backend), redirects to viewStory after creating a story, adds 'no records found' text, and updates the add-record dialog title to include the person's preferred name.
- category: `bug`
- ⚠ gotcha: Access, creator, and cultural narrative fields are hidden because backend support for them doesn't exist yet.
- [https://gitlab.com/ahau/ahau/-/merge_requests/211](https://gitlab.com/ahau/ahau/-/merge_requests/211)

### !205 Graphql with artefacts ui (MR, merged, 2020-07-01)

Refactors artefact upload (fixing incorrect blobs and adding required uris, using GraphQL fileUpload), updates the server to new ssb-whakapapa and ssb-graphql/whakapapa versions, updates GraphQL calls for the new links, unifies story create/update into one function, adds saving of artefacts and links, and refactors helpers to use fragments to cut down repeated code.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/205](https://gitlab.com/ahau/ahau/-/merge_requests/205)

### !203 Diverse genders (MR, merged, 2020-06-23)

Adds a new gender-diverse avatar, updates the ProfileForm UI to accept 'other' and 'unknown' gender options, and updates avatar-helpers to return the diverse avatar for the 'other' gender.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/203](https://gitlab.com/ahau/ahau/-/merge_requests/203)

### !202 update ssb deps for private groups (MR, merged, 2020-06-23)

Upgrades ssb-db and dependent plugins (ssb-profile, ssb-query, ssb-friends) to support private groups, and sets up the GraphQL Context to auto-create public profile/personal tribe links, with the app initially publishing everything to the user's personal tribe.
- category: `chore`
- ⚠ gotcha: Several TODO items were left unresolved, including how best to link a profile to a feed (message vs. field vs. both) and further changes to where the app publishes data.
- [https://gitlab.com/ahau/ahau/-/merge_requests/202](https://gitlab.com/ahau/ahau/-/merge_requests/202)

### !199 Vuex profile fixes (MR, merged, 2020-06-22)

Applies a range of Vuex-related profile fixes spread across multiple commits; author notes uncertainty about whether splitting the work by commit was actually helpful, and the description doesn't itemize the individual changes.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/199](https://gitlab.com/ahau/ahau/-/merge_requests/199)

### !198 fixed whakapapaShow top margin height issue caused by fixing appbar (MR, merged, 2020-06-18)

Fixes whakapapaShow top-margin issues (for desktop/mobile, tree and table) that were introduced by fixing the appbar in place, moves the whakapapaShow zoom helpers for mobile, removes the whakapapaTable button from mobile, and updates whakapapaShow's scale on mount.
- category: `bug`
- ⚠ gotcha: The whakapapaTable button was removed from mobile because it behaves oddly there and would need more work to support properly.
- [https://gitlab.com/ahau/ahau/-/merge_requests/198](https://gitlab.com/ahau/ahau/-/merge_requests/198)

### !194 Artefact upload 2 (MR, merged, 2020-06-04)

Fixes artefact-upload bugs: updating an artefact in ArtefactCarousel at index 0, showing deletion correctly when the artefact is last in the array, and updates desktop artefact and input widths.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/194](https://gitlab.com/ahau/ahau/-/merge_requests/194)

### !193 Connect side view (MR, merged, 2020-05-22)

Adds a connected side view: clicking an avatar in a profile or the archive opens a profile-preview version of SideViewDialog, and clicking 'view profile' from there opens the person's full profile/archive.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/193](https://gitlab.com/ahau/ahau/-/merge_requests/193)

### !190 Update appbar (MR, merged, 2020-05-15)

Updates the appbar's archive/profile links for mobile and desktop, removes the active background style on selected router-link buttons, adds an archive module and activeComponent to Vuex, and switches profile-component tracking/display from profileShow to the new activeComponent in Vuex.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/190](https://gitlab.com/ahau/ahau/-/merge_requests/190)

### !189 Side nav (MR, merged, 2020-05-15)

Updates the side nav: buttons turn red when clicked, profile card titles removed, sidenav fixed on scroll for desktop, sidenav position transitions to accommodate the header photo on mobile and desktop, fixes the back-button avatar when no whakapapa avatar exists, moves header/avatar out of the profile component, and fixes assorted margin issues.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/189](https://gitlab.com/ahau/ahau/-/merge_requests/189)

### !187 Profile pr (MR, merged, 2020-05-14)

Adds the profile page: viewing and editing a person's details, updating their header photo, and a back button when navigating to a profile from a whakapapa; split out from mixed Archive/Story work so it could be merged sooner.
- category: `feature`
- ⚠ gotcha: Review checklist (responsive desktop/tablet/mobile UI, viewing own vs. others' profiles, go-back navigation) was still unchecked at time of MR.
- [https://gitlab.com/ahau/ahau/-/merge_requests/187](https://gitlab.com/ahau/ahau/-/merge_requests/187)

### !185 Replace background job with pipe and redirect (MR, merged, 2020-05-12)

Replaces `npm run foo & npm run bar` (which backgrounds the first process, leaving it running after Ctrl+C, causing repeated rebuilds, accumulating vue-cli-service processes, and breaking terminal-based editors) with stdout redirected to stderr piped into an empty next command, so signal handlers are shared and both processes exit together; also switches to the `--prefix` flag instead of `cd` for the new command, leaving other `cd` usages alone to keep the diff small.
- category: `infra`
- [https://gitlab.com/ahau/ahau/-/merge_requests/185](https://gitlab.com/ahau/ahau/-/merge_requests/185)

### !184 Remove duplicate dependencies (MR, merged, 2020-05-12)

Removes two dependencies that were duplicated in both `dependencies` and `devDependencies` (which triggered an npm warning and risked version mismatches), then runs `npm install` and `npm dedupe` to shrink the dependency graph.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/merge_requests/184](https://gitlab.com/ahau/ahau/-/merge_requests/184)

### !175 Go back (MR, merged, 2020-05-10)

Adds a go-back button that returns to the previous whakapapa when a user navigates to a profile from whakapapaShow.
- category: `feature`
- ⚠ gotcha: Author considered caching nestedWhakapapa/relationshipsLinks in the store to avoid rebuilding the whakapapa on back-navigation, but deferred it as it required more work around managing currentFocus and loadDescendants.
- [https://gitlab.com/ahau/ahau/-/merge_requests/175](https://gitlab.com/ahau/ahau/-/merge_requests/175)

### !173 EPIC: Vuex profile (MR, merged, 2020-05-06)

Epic branch delivering the profile and archive views: viewing your own and others' profiles, viewing family members, updating header photo, contact info, mobile-reactive layout, back button, kaitiaki component, connected search bar (people to profile, stories to dialog), profile updates, a refactored profileShow structure, a new record form, plus assorted desktop/mobile layout fixes for sideNav, collections, and archive story cards.
- category: `feature`
- ⚠ gotcha: The 'new collection form' item was left unchecked/unimplemented at the end of this epic.
- [https://gitlab.com/ahau/ahau/-/merge_requests/173](https://gitlab.com/ahau/ahau/-/merge_requests/173)

### !169 Refactor load descendants (MR, merged, 2020-04-21)

Refactors how descendants are loaded in the whakapapa tree; extensive smoke testing confirms person and partner select/view/update/delete/add-child/add-parent/search/collapse/focus actions work.
- category: `refactor`
- ⚠ gotcha: Two known issues remain: updating a partner's preferredName doesn't reflect in the tree, and siblings don't load correctly because lib/tree-helpers.js (line 100) overwrites any previously loaded siblings with an empty array.
- files mentioned: `lib/tree-helpers.js`
- [https://gitlab.com/ahau/ahau/-/merge_requests/169](https://gitlab.com/ahau/ahau/-/merge_requests/169)

### !168 Loading component (MR, closed, 2020-04-16)

Adds a loading component to App.vue, moves `store.loading` into the Vuex rootStore, and updates WhakapapaShowViewCard to link to whakapapaIndex. Closed rather than merged.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/168](https://gitlab.com/ahau/ahau/-/merge_requests/168)

### !165 Partners parents2 (MR, merged, 2020-04-14)

Fixes adding parents to partners so it now works, though without the collapsing/centering behavior that normal nodes get, and fixes changing focus so it no longer incorrectly shows children on collapsed nodes.
- category: `bug`
- ⚠ gotcha: Adding parents on partners works but lacks the collapsing/centering behavior present elsewhere; author notes it was hard to locate the right places to fix and hopes Vuex will make this easier going forward.
- [https://gitlab.com/ahau/ahau/-/merge_requests/165](https://gitlab.com/ahau/ahau/-/merge_requests/165)

### !160 Add deceased inputs (MR, merged, 2020-04-08)

Re-adds the deceased picker and diedAt date inputs to ProfileForm, NewNodeDialog, and SideViewEditDialog.
- category: `feature`
- ⚠ gotcha: Author flags ViewEditDialog as very large and notes there are 3 separate NewNodeDialog.vue files, both cited as needing cleanup.
- [https://gitlab.com/ahau/ahau/-/merge_requests/160](https://gitlab.com/ahau/ahau/-/merge_requests/160)

### !154 Node search (MR, merged, 2020-04-02)

Adds contextual search suggestions when adding a child or parent node (child vs. parent suggestions), updates the suggestions UI, and adds a separate 'Suggestions not in this whakapapa' section for people outside the current whakapapa.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/154](https://gitlab.com/ahau/ahau/-/merge_requests/154)

### !152 Dialogs update (MR, merged, 2020-03-31)

Updates the UI/styling of the popup dialogs used for entering data.
- category: `refactor`
- ⚠ gotcha: Not yet tested on mobile.
- [https://gitlab.com/ahau/ahau/-/merge_requests/152](https://gitlab.com/ahau/ahau/-/merge_requests/152)

### !151 Create from file (MR, merged, 2020-03-31)

Adds the ability to create a whakapapa by uploading a CSV file: a new radio button in NewViewDialog lets the user choose build-from-file, the file name is validated to end in .csv, and each row is parsed into a profile with parent/child links used to build the tree focused on the first row's parent.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/151](https://gitlab.com/ahau/ahau/-/merge_requests/151)

### !145 mobile: fix back button behavior in dialogs (MR, merged, 2020-03-23)

Fixes mobile dialogs where the hardware back button navigated to whakapapaList instead of closing the open dialog, by listening for Cordova's `backbutton` event in a new Vue.js plugin that calls a dialog's `cordovaBackButton` method if present, otherwise falls back to `router.back()`.
- category: `bug`
- ⚠ gotcha: Author notes other dialog corner cases may still be unfixed despite testing all changed dialogs.
- [https://gitlab.com/ahau/ahau/-/merge_requests/145](https://gitlab.com/ahau/ahau/-/merge_requests/145)

### !144 fix Dialog: delete button too close to confirmation buttons (MR, merged, 2020-03-23)

Repositions the delete button in WhakapapaEditDialog and EditNodeDialog so it is no longer dangerously close to the save/confirmation buttons, addressing a mobile UI polish subtask (before/after screenshots included).
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/144](https://gitlab.com/ahau/ahau/-/merge_requests/144)

### !142 fix WhakapapaViewCard title and description overflowing on mobile (MR, merged, 2020-03-23)

Fixes WhakapapaViewCard title and description text overflowing on mobile in both WhakapapaIndex and WhakapapaShow, verified against long and short description cases on mobile and desktop.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/142](https://gitlab.com/ahau/ahau/-/merge_requests/142)

### !138 Whakapapa table (MR, merged, 2020-03-22)

Adds a new whakapapa table feature so kaitiaki can view whakapapa data as a tribal registry table, accessible via a "registry" button on whakapapa-show, with toggles to show/hide relationships (indented tree vs flat data) and show/hide deceased ancestors, plus new location, contact, and profession fields added to the table and dialogs.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/138](https://gitlab.com/ahau/ahau/-/merge_requests/138)

### !133 New datepicker (MR, merged, 2020-03-07)

Improves the date picker by having the user select the year first, adds OK/Cancel buttons that default to today's day (and month) when only a year or year+month is picked, allows selecting years back to year 0, and improves the year scroll styling.
- category: `feature`
- ⚠ gotcha: Typing a date directly is not yet supported (blocked on handling the read-only v-text-field property), and month/day may not display in the dob field when unselected.
- [https://gitlab.com/ahau/ahau/-/merge_requests/133](https://gitlab.com/ahau/ahau/-/merge_requests/133)

### !132 Side view dialog (MR, merged, 2020-03-06)

Replaces the popup view dialog with a side-menu (sideMenu) on desktop so users can read a person's details without leaving the graph, while mobile keeps the same component styled as before; also adds a consistent appbar across mobile dialogs and adjusts dialog action button spacing.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/132](https://gitlab.com/ahau/ahau/-/merge_requests/132)

### !130 Helper text (MR, merged, 2020-03-04)

Adds new UX copy and UI polish: new login text, create-profile flow switched to use NewNodeDialog, info dialogs with image carousels added to whakapapaList and whakapapaShow, AvatarEditDialog resized to fit text without scrolling, and the avatar picker's image props/order adjusted (square image, moved first on mobile).
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/130](https://gitlab.com/ahau/ahau/-/merge_requests/130)

### !129 WIP: Change Whakapapa focus to selected partner (MR, closed, 2020-02-28)

Adds a `changeFocus` function to switch the whakapapa tree's focus to a selected partner; keeping a node's screen position stable across focus changes was implemented largely through trial and error and remains imperfect, and dot-rendering for partners-with-parents was moved into the Tree component to avoid a race condition.
- category: `feature`
- ⚠ gotcha: Position-preserving logic when changing focus is fragile/imperfect, built through trial and error rather than a principled approach.
- [https://gitlab.com/ahau/ahau/-/merge_requests/129](https://gitlab.com/ahau/ahau/-/merge_requests/129)

### !127 Dialog refactor (MR, merged, 2020-02-27)

First part of the WhakapapaShow refactor: reorganizes the dialog directory structure, extracts profile and whakapapa form fields into new reusable `ProfileForm` and `WhakapapaForm` components, moves profile-related helpers out of `constants.js` into `profile-helpers.js`, and adds slots to the Dialog component (close button, title, content, action buttons) for consistent reuse.
- category: `refactor`
- files mentioned: `constants.js`, `profile-helpers.js`
- [https://gitlab.com/ahau/ahau/-/merge_requests/127](https://gitlab.com/ahau/ahau/-/merge_requests/127)

### !125 Fix nodejs-mobile race condition (MR, merged, 2020-02-26)

Fixes a nodejs-mobile race condition: adds a circular spinner on the Login view since the GraphQL server can take ~6 seconds to start on mobile, and replaces the old `hasStarted` flag with a `nodejsClient.start()` API taking callbacks (including `onReady`) because the server was previously starting before the App component mounted, so the `hasStarted` signal was missed.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/125](https://gitlab.com/ahau/ahau/-/merge_requests/125)

### !123 Mobile release 1.0.1 (MR, merged, 2020-02-24)

Fixes mobile build scripts and bumps the mobile app version to 1.0.1; the prior version was 0.5.0, but an earlier build (1.0.0) had already been published to Google Play, and since Google Play requires strictly increasing version numbers, 1.0.1 was chosen instead of reverting to the 0.5.0 line.
- category: `infra`
- ⚠ gotcha: Mobile version numbering diverges from the 0.x history because Google Play already has a published 1.0.0 build.
- [https://gitlab.com/ahau/ahau/-/merge_requests/123](https://gitlab.com/ahau/ahau/-/merge_requests/123)

### !120 Refactor scripts and gitignore (MR, merged, 2020-02-20)

Updates `.gitignore` to use strong (rooted) paths instead of weak ones that could accidentally ignore unrelated nested directories (e.g. a path like `mobile/plugins` would wrongly match `ui/components/mobile/plugins`), removes obsolete `installers`/`bundle` entries, switches build scripts from `npm i` to `npm install` for clarity, and as a follow-up to MR #113 ensures the nodejs-project `package-lock.json` stays permanently ignored.
- category: `chore`
- ⚠ gotcha: Previously .gitignore used weak (non-rooted) paths that could unintentionally match unrelated nested directories.
- files mentioned: `package-lock.json`
- [https://gitlab.com/ahau/ahau/-/merge_requests/120](https://gitlab.com/ahau/ahau/-/merge_requests/120)

### !113 fix mobile nodejs-project installations (MR, merged, 2020-02-19)

Removes persistence of `package-lock.json` for the mobile nodejs-project build because its `file:../../../server` local dependency doesn't work well with lockfiles; as a consequence, versions in that package's `package.json` must now be pinned manually to avoid automatic updates breaking the build.
- category: `infra`
- ⚠ gotcha: Without a package-lock.json, dependency versions in the nodejs-project package.json must be pinned to avoid breaking automatic updates.
- [https://gitlab.com/ahau/ahau/-/merge_requests/113](https://gitlab.com/ahau/ahau/-/merge_requests/113)

### !104 fix spacing in the appbar around the logo, on mobile (MR, merged, 2020-02-14)

Fixes incorrect spacing around the logo and back button in the mobile appbar by removing an unnecessary `<div class="d-flex align-center">` wrapper and replacing a `<div v-else>` with `template` for purely logical grouping (since divs affect layout/styling).
- category: `bug`
- ⚠ gotcha: A separate known regression where the appbar covers body content is still unfixed and not reliably reproducible.
- [https://gitlab.com/ahau/ahau/-/merge_requests/104](https://gitlab.com/ahau/ahau/-/merge_requests/104)

### !101 Responsive dialogs (MR, merged, 2020-02-13)

Adds a Storybook configuration based on Vuetify breakpoints and a new `appBar` prop on the Dialog component (shows an appbar on mobile, hideable via the prop), then applies responsive UI and Storybook stories to AvatarEditDialog, DeleteNodeDialog, NewNodeDialog, NewViewDialog, ViewEditNodeDialog, and WhakapapaViewDialog.
- category: `feature`
- [https://gitlab.com/ahau/ahau/-/merge_requests/101](https://gitlab.com/ahau/ahau/-/merge_requests/101)

### !99 Search profile by name (MR, merged, 2020-02-11)

Adds live profile search in NewNodeDialog: after typing 3+ characters it queries the db for people whose preferred or legal name matches, showing preferredName/legalName/bornAt in a suggestions list; selecting a result loads it read-only except for relationshipType, and pairs with a companion ssb-graphql-profile MR that excludes profiles already in the tree or already related as children/parents and adds a cancel button to clear the selection.
- category: `feature`
- ⚠ gotcha: Depends on a separate ssb-graphql-profile MR; suggesting profiles through existing relations and suggesting parents of siblings are not yet implemented.
- [https://gitlab.com/ahau/ahau/-/merge_requests/99](https://gitlab.com/ahau/ahau/-/merge_requests/99)

### !98 Edit whakapapa (MR, merged, 2020-02-09)

Adds a new WhakapapaEdit dialog letting a person edit whakapapa title, description, and image, or delete the whakapapa, submitting via `updateWhakapapa()` which calls `saveWhakapapaView()` and then re-queries the whakapapa by `route.params.id`; also extracts the v-banner out of WhakapapaShow into its own component and reuses components for the mobile layout.
- category: `feature`
- ⚠ gotcha: Requires running npm install again due to updated dependencies; the WhakapapaEdit UI is intentionally sparse/empty with extra white space for now.
- [https://gitlab.com/ahau/ahau/-/merge_requests/98](https://gitlab.com/ahau/ahau/-/merge_requests/98)

### !92 Isolate electron (MR, merged, 2020-02-06)

First branch in a series merging the desktop and mobile apps: restructures the repo into separate `desktop`, `mobile`, `ui`, and `server` packages, isolating the GraphQL server, Electron setup, and Cordova setup each into their own package, moving the Vue app into `ui`, updating the README, and merging in responsive components from the mobile repo.
- category: `infra`
- ⚠ gotcha: Must be merged after MRs #95, #94, and #93 in that specific order.
- files mentioned: `README.md`
- [https://gitlab.com/ahau/ahau/-/merge_requests/92](https://gitlab.com/ahau/ahau/-/merge_requests/92)

### !88 Order Of Birth (MR, merged, 2020-01-31)

Adds an `orderOfBirth` field to ViewEditNodeDialog and NewNodeDialog, with companion changes required in the ssb-profile and ssb-graphql-profile repos (need to be npm-linked or merged first); persons without an orderOfBirth value are sorted to the top of the order.
- category: `feature`
- ⚠ gotcha: Persons with no orderOfBirth are placed at the top of the order; requires linking or merging companion ssb-profile and ssb-graphql-profile MRs first.
- [https://gitlab.com/ahau/ahau/-/merge_requests/88](https://gitlab.com/ahau/ahau/-/merge_requests/88)

### #2 NPM script not working on Windows 10 (ISSUE, closed, 2020-01-30)

The start:dev npm script sets an environment variable using syntax that doesn't work on Windows 10's shell, breaking local dev setup for Windows users; suggests adding the cross-env devDependency so npm scripts can set env vars in a cross-platform way.
- category: `chore`
- [https://gitlab.com/ahau/ahau/-/work_items/2](https://gitlab.com/ahau/ahau/-/work_items/2)

### !85 Alt names in view/edit dialog (MR, merged, 2020-01-29)

Adds the ability to add, remove, and view alternate names in the edit dialog; existing alt names are read-only and can currently only be deleted, not edited, and changes are applied on submit or reverted on cancel.
- category: `feature`
- ⚠ gotcha: Existing alt names cannot be edited, only deleted; there is also a bug where the avatar image container overlaps an alt name's delete icon, making it unclickable.
- [https://gitlab.com/ahau/ahau/-/merge_requests/85](https://gitlab.com/ahau/ahau/-/merge_requests/85)

### !81 Deceased icon (MR, merged, 2020-01-26)

Adds a visual deceased indicator: Node.vue and Avatar.vue now check a person's `diedAt` date and render a green vs grey background accordingly, with SVGs changed to a transparent background and `diedAt` threaded through ViewEditNodeDialog into Avatar.
- category: `feature`
- ⚠ gotcha: AvatarGroup does not correctly pass diedAt into Avatar, so the deceased color does not show correctly in the view-dialog; author is okay merging as-is with a follow-up card if not quickly fixable.
- [https://gitlab.com/ahau/ahau/-/merge_requests/81](https://gitlab.com/ahau/ahau/-/merge_requests/81)

### !73 dialog refactor (MR, merged, 2020-01-23)

Consolidates all `*Dialog.vue` components into `src/components/dialog/`, removes a duplicate/incomplete `src/components/profile-form/Dialog.vue` (which was missing features like the image picker), and installs the new AvatarEditDialog into NewNodeDialog.
- category: `refactor`
- files mentioned: `src/components/profile-form/Dialog.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/73](https://gitlab.com/ahau/ahau/-/merge_requests/73)

### !71 allow deletion of ancestor (MR, merged, 2020-01-22)

Allows deleting the top ancestor of a graph when it has exactly one direct descendant (that descendant becomes the new focus) or exactly one other partner (who becomes the new focus); deletion is disallowed when the top ancestor has multiple children since the resulting focus would be ambiguous.
- category: `feature`
- ⚠ gotcha: Allowing deletion when there's one other partner and reassigning focus to that partner could cause problems in some cases, per the author.
- [https://gitlab.com/ahau/ahau/-/merge_requests/71](https://gitlab.com/ahau/ahau/-/merge_requests/71)

### !64 graphql refactor (different person type) (MR, merged, 2020-01-15)

Proposes a GraphQL schema restructuring so `whoami.profile` returns `parents` directly, raising an open question about where to place `relationshipType`/`legallyAdopted` and suggesting a `WhakapapaNode`/`WhakapapaLink` edge type similar to prior work by a former contributor (piet).
- category: `decision`
- ⚠ gotcha: Unresolved: where relationshipType and legallyAdopted fields should live in the restructured schema.
- [https://gitlab.com/ahau/ahau/-/merge_requests/64](https://gitlab.com/ahau/ahau/-/merge_requests/64)

### !63 Date picker updated (MR, merged, 2020-01-14)

Fixes an add-parents bug where `updateFocus` wasn't toggling new parents/children properly, adds end-to-end `bornAt` support (create, save, edit, view a person's date of birth, with matching graphql and a companion ssb-profile `date-picker-update` branch), and notes newly added partners weren't showing up except on the focus node.
- category: `feature`
- ⚠ gotcha: Existing databases with null bornAt values caused problems and required wiping the local db to test the change.
- [https://gitlab.com/ahau/ahau/-/merge_requests/63](https://gitlab.com/ahau/ahau/-/merge_requests/63)

### !62 add a processing queue to whakapapa loadDescendants (MR, merged, 2020-01-11)

Adds a processing queue to whakapapa's `loadDescendants` so edits to `this.profiles` (which drive the graph rendering) happen synchronously instead of overwriting one another, fixing a race condition seen while working on upcoming GraphQL optimisations; split out into its own PR to merge into master faster than the larger graphql refactor it came from.
- category: `bug`
- [https://gitlab.com/ahau/ahau/-/merge_requests/62](https://gitlab.com/ahau/ahau/-/merge_requests/62)

### !60 Node edit profile (MR, merged, 2020-01-09)

Adds a Node edit profile dialog (opened via View Person in the context menu) that shows and edits a person's details, deletes the person, and lets the user add a parent or child; introduces shared RULES and PERMITTED constants for consistent form validation and editable fields across the app, and adds an AvatarGroup component to reduce duplication in ViewEditNodeDialog.
- category: `feature`
- ⚠ gotcha: The bornAt field may show up blank since it isn't yet incorporated everywhere in the app.
- [https://gitlab.com/ahau/ahau/-/merge_requests/60](https://gitlab.com/ahau/ahau/-/merge_requests/60)

### !54 WIP: Node view profile (MR, closed, 2019-12-19)

Adds a WIP dialog (via context menu > View Person) that displays a node's parents, siblings, and children and allows adding a child or parent directly from it; title, dob, and living fields are currently placeholders rather than real data.
- category: `feature`
- ⚠ gotcha: Title, dob, and living values are hardcoded placeholders; adding a child/parent updates the tree but not the dialog itself yet.
- [https://gitlab.com/ahau/ahau/-/merge_requests/54](https://gitlab.com/ahau/ahau/-/merge_requests/54)

### !49 Storybook + component refactor (MR, merged, 2019-12-12)

Introduces Storybook for component creation and testing, and refactors major components to move Apollo query logic out of components and up into `/views`, updating views that use ProfileShow to follow the pattern (move the apollo query into the view, supply an `editProfile` function where relevant); author raises open questions about whether Apollo-outside-component and passing routing as a function are good patterns.
- category: `refactor`
- [https://gitlab.com/ahau/ahau/-/merge_requests/49](https://gitlab.com/ahau/ahau/-/merge_requests/49)

### !48 Node separation (MR, merged, 2019-12-11)

Watches for width changes and updates tree node separation accordingly, though the same separation currently applies uniformly to all nodes rather than per-node; author flags it as a work in progress, not fully reactive, and suggests waiting until node contents (context menu buttons, labels) are finalized before refining further.
- category: `feature`
- ⚠ gotcha: Node separation applies the same value to every node (no per-node separation yet) and is not fully reactive.
- [https://gitlab.com/ahau/ahau/-/merge_requests/48](https://gitlab.com/ahau/ahau/-/merge_requests/48)

### !40 Public profiles discovery + styling (MR, merged, 2019-12-04)

Hides private (just-for-me) profiles from the Discovery page, makes the whakapapa view heading float to take up less space, removes container padding so zoomed content isn't cut off before the page edge, and adds description cards with a placeholder future edit action to WhakapapaIndex.
- category: `feature`
- ⚠ gotcha: Removing the container padding introduced a new minor visual bug: zoomed content is now cut off slightly after the edge instead of before it.
- [https://gitlab.com/ahau/ahau/-/merge_requests/40](https://gitlab.com/ahau/ahau/-/merge_requests/40)

### !38 change partner loading + make partners clickable (MR, merged, 2019-12-04)

Changes the partner-loading algorithm to reduce unnecessary profile-loading calls, adds right-click support to open the context menu on partner nodes, and fixes partners auto-appearing when a parent is added; author describes it as a messy PR that should have been split into multiple commits/branches.
- category: `feature`
- ⚠ gotcha: Right-click-to-open-context-menu on partners is an interim solution the author isn't happy with and expects to need rework if an icon-based context-menu trigger is added.
- [https://gitlab.com/ahau/ahau/-/merge_requests/38](https://gitlab.com/ahau/ahau/-/merge_requests/38)

### !33 Node parents (MR, merged, 2019-12-02)

Generates a parents array by looking at children's parents in `loadDescendants`, adds a map function that computes the x position for drawing partner nodes, and changes node separation to depend on the width of the `#nodeGroup` `<g>` element (tracked in Tree.vue).
- category: `feature`
- ⚠ gotcha: Partner data hasn't been added yet, and the context menu still opens on right-click of a partner, which needs to be changed.
- [https://gitlab.com/ahau/ahau/-/merge_requests/33](https://gitlab.com/ahau/ahau/-/merge_requests/33)

### !32 Fetch views (MR, merged, 2019-12-02)

Adds a GraphQL resolver for `views` and switches WhakapapaIndex to use it, fixes the recps used when creating a new view (needed to be a feedId not a profileId, untested), and renames some graphql/ssb methods.
- category: `feature`
- ⚠ gotcha: recps feedId fix is untested; routing to the correct place after creating a view, WhakapapaShow reading viewId from route params, and private view creation are all not yet done or verified.
- [https://gitlab.com/ahau/ahau/-/merge_requests/32](https://gitlab.com/ahau/ahau/-/merge_requests/32)

### !27 expand whakapapa routes (MR, merged, 2019-11-26)

Adds `/whakapapa` (WhakapapaIndex) and `/whakapapa/:id` (WhakapapaShow, the existing tree view) routes and updates the Appbar to link to `/whakapapa`, which currently loads dummy "Irving Family" data; clicking through to `/whakapapa/:id` does not yet do anything with the id.
- category: `feature`
- ⚠ gotcha: The /whakapapa/:id route does not yet use the id parameter; the Appbar currently links to placeholder dummy data.
- [https://gitlab.com/ahau/ahau/-/merge_requests/27](https://gitlab.com/ahau/ahau/-/merge_requests/27)

### !23 Add child (MR, merged, 2019-11-21)

Adds three new dialogs: NewNodeDialog (validated form for creating a node/person, TODO: add image picker), EditNodeDialog, and ViewNodeDialog; nodes get a right-click context menu with Edit Person, Add Child, and Add Parent (Add Parent currently calls an empty function), and dialogs close via Escape or Cancel; a crash when adding a child to a newly added node was fixed by adding `v-if` to NewNodeDialog.
- category: `feature`
- ⚠ gotcha: Add Parent in the context menu is currently a no-op, and the image picker has not yet been added to the NewNodeDialog form.
- files mentioned: `EditNodeDialog.vue`, `NewNodeDialog.vue`, `Tree.vue`, `ViewNodeDialog.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/23](https://gitlab.com/ahau/ahau/-/merge_requests/23)

### !21 D3 trim (MR, merged, 2019-11-19)

Cleanup before merging to master: removes an unused context-menu module, fixes linting, replaces large committed PNGs with smaller (50-60% size) SVG equivalents stored under `@/assets` so they remain editable and scale better, uses git history rewriting to erase the commit that originally added the PNGs, and squashes about 40 granular commits into fewer commits via interactive rebase.
- category: `chore`
- ⚠ gotcha: History was rewritten (PNG-commit removal plus interactive rebase squash) — described by the author as "dangerous" and not to be attempted casually.
- [https://gitlab.com/ahau/ahau/-/merge_requests/21](https://gitlab.com/ahau/ahau/-/merge_requests/21)

### !20 WIP: Improve image cropping (MR, closed, 2019-11-15)

Proposes replacing the current image picker with vuejs-clipper for cropping avatar/header photos via a modal, which would require the header size to follow a fixed aspect ratio; author is unsure about the resulting UI/UX and asks reviewers for opinions.
- category: `feature`
- ⚠ gotcha: Header image size would need to follow a fixed ratio if adopted; MR was closed rather than merged.
- [https://gitlab.com/ahau/ahau/-/merge_requests/20](https://gitlab.com/ahau/ahau/-/merge_requests/20)

### !17 Offline-first material design icons (MR, merged, 2019-11-15)

Aims to make the app offline-first by removing CDN-hosted `<link>` tags for the Roboto Google Font and the Material Design Icons stylesheet from `public/index.html` so the app can load without internet access; work was flagged as incomplete, noting the Roboto font still needs to be imported locally.
- category: `infra`
- ⚠ gotcha: Marked incomplete at time of writing; Roboto font still needs a local import to replace the removed CDN link.
- files mentioned: `public/index.html`
- [https://gitlab.com/ahau/ahau/-/merge_requests/17](https://gitlab.com/ahau/ahau/-/merge_requests/17)

### !16 WIP: Alt Names (MR, closed, 2019-11-15)

WIP refactor of `src/components/ProfileForm.vue`: change the alt-names list's unique key to use index, restructure the altNames state into `{new, added, removed}`, stop unnecessarily passing `key` to `updateAltChanges`, and rework the UI so any alt-name entry can be edited at any time by diffing old vs. new state arrays.
- category: `refactor`
- ⚠ gotcha: Left as a WIP/closed MR; the altNames state restructuring and edit-any-entry behavior were not completed.
- files mentioned: `src/components/ProfileForm.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/16](https://gitlab.com/ahau/ahau/-/merge_requests/16)

### !13 WIP: D3 tree (MR, closed, 2019-11-08)

Adds an initial D3 tree view: a new `/tree` route, `Tree.vue` page, Appbar nav link, and `Tree/Link/Node` components; clicking a node currently just alerts the person's name and right-clicking opens a context menu whose options have no functionality yet.
- category: `feature`
- ⚠ gotcha: Context menu options are non-functional placeholders and the tree does not yet reactively reposition when the window is resized.
- files mentioned: `src/components/Appbar.vue`, `src/components/Tree/Link.vue`, `src/components/Tree/Node.vue`, `src/components/Tree/Tree.vue`, `src/views/Tree.vue`
- [https://gitlab.com/ahau/ahau/-/merge_requests/13](https://gitlab.com/ahau/ahau/-/merge_requests/13)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2026-07-15 | !983 | fix: add full month name translations across en_NZ, nl_NL, es_ES, pt_BR, mi_NZ locales | merged | FootNuggets22 |
| 2026-07-14 | !982 | docs: correct Node/npm version requirements in desktop README | merged | FootNuggets22 |
| 2024-09-20 | !976 | New Wallet Activity Feature | closed | Tairea |
| 2024-09-11 | !975 | Matou publisher | closed | mixmix |
| 2024-04-16 | !971 | Bug reporting | merged | Tairea |
| 2024-03-18 | !970 | Fixes - ssb-atala-prism | merged | mixmix |
| 2024-03-13 | !969 | New Crowdin updates | merged | mixmix |
| 2024-03-12 | !968 | styling on registration review | merged | chereseeriepa |
| 2024-02-29 | !965 | patches for mobile onboarding | merged | mixmix |
| 2024-02-26 | !964 | New Crowdin updates | merged | mixmix |
| 2024-02-19 | !963 | Atala prism mobile redux | merged | mixmix |
| 2024-02-18 | !962 | New Crowdin updates | merged | mixmix |
| 2024-02-16 | !961 | Use new dht bootstrap server | merged | powersource |
| 2024-02-12 | !959 | fix bug where there was no authors on a submission profile causing submissions to crash | merged | chereseeriepa |
| 2024-02-10 | !958 | New Crowdin updates | merged | mixmix |
| 2024-02-08 | !957 | fixed showing kaitiaki fields | merged | Tairea |
| 2024-01-31 | !954 | New Crowdin updates | merged | mixmix |
| 2024-01-23 | !951 | Custom field ordering | merged | chereseeriepa |
| 2023-12-21 | !950 | Draft: Custom Field Ordering (Drag and drop) | closed | chereseeriepa |
| 2023-12-21 | !949 | Fix custom field data model bugs | merged | chereseeriepa |
| 2023-12-10 | !944 | New Crowdin updates | merged | mixmix |
| 2023-12-06 | !943 | Auto issue vcs | merged | chereseeriepa |
| 2023-12-05 | !942 | toggle issue vcs setting | merged | chereseeriepa |
| 2023-12-04 | !941 | pin secret-stack@6 more thoroughly | merged | mixmix |
| 2023-12-01 | !940 | New Crowdin updates | merged | mixmix |
| 2023-12-01 | !939 | Translate registrations | merged | chereseeriepa |
| 2023-11-30 | !938 | Separation of work | merged | chereseeriepa |
| 2023-11-30 | !937 | V2.25.6 mobile | merged | mixmix |
| 2023-11-29 | !936 | fix bug where registrations gets stuck in a loading state when updating required fields | merged | chereseeriepa |
| 2023-11-29 | !935 | Draft: Atala prism ben | closed | chereseeriepa |
| 2023-11-27 | #35 | test task please ignore | closed | powersource |
| 2023-11-26 | !933 | New Crowdin updates | merged | mixmix |
| 2023-11-26 | !932 | fix bug with infinite loop | merged | chereseeriepa |
| 2023-11-16 | !929 | Draft: Atala prism mobile | closed | mixmix |
| 2023-11-15 | !928 | remove woff files from roboto-latin | merged | mixmix |
| 2023-11-15 | !927 | Esbuild again | merged | chereseeriepa |
| 2023-11-13 | !926 | fix eslint linting errors | merged | chereseeriepa |
| 2023-11-07 | !925 | Atala prism | closed | mixmix |
| 2023-10-30 | !924 | New Crowdin updates | merged | mixmix |
| 2023-10-30 | !923 | New Crowdin updates | merged | mixmix |
| 2023-10-29 | !921 | Bug tribe image | merged | chereseeriepa |
| 2023-10-29 | !920 | Archive submission notifications in the list | merged | chereseeriepa |
| 2023-10-13 | !919 | rename APPLE_ID_PASS to APPLE_APP_SPECIFIC_PASSWORD to be compatible with updated ssb-ahoy | merged | chereseeriepa |
| 2023-10-10 | !918 | bugfix: initial sync via ssb-friends hack | merged | mixmix |
| 2023-10-09 | !917 | update ssb-ahoy (electron) | merged | mixmix |
| 2023-10-03 | !916 | Lint fixes | merged | mixmix |
| 2023-10-03 | !915 | fix the duplicate startup fix | merged | mixmix |
| 2023-10-01 | !913 | change the tool used for notarizing from altool to notarytool | merged | chereseeriepa |
| 2023-09-27 | !912 | New Crowdin updates | merged | mixmix |
| 2023-09-27 | !911 | add vite-inspector tool | merged | mixmix |
| 2023-09-26 | !910 | tidy deps | merged | mixmix |
| 2023-09-26 | !909 | smaller assets | merged | mixmix |
| 2023-09-22 | !908 | Vite | merged | chereseeriepa |
| 2023-09-20 | !907 | New Crowdin updates | merged | mixmix |
| 2023-09-20 | !906 | stop multiple startups for windows | merged | mixmix |
| 2023-09-20 | !905 | Merge branch 'd3-latest' into 'upgrades!' | closed | mixmix |
| 2023-09-18 | !904 | Submission to ignore | merged | chereseeriepa |
| 2023-09-17 | !903 | change the text for submission notifications | merged | chereseeriepa |
| 2023-09-14 | !902 | add brief help text when reviewing a submission | merged | chereseeriepa |
| 2023-09-14 | !901 | add comment section when adding a person to a submit-only whakapapa | merged | chereseeriepa |
| 2023-09-11 | !900 | Ignored submissions | merged | chereseeriepa |
| 2023-09-07 | !899 | Lodash es | merged | mixmix |
| 2023-09-07 | !898 | D3 latest | merged | mixmix |
| 2023-09-07 | !897 | minor module upgrades (excluding vuetify) | merged | mixmix |
| 2023-08-31 | !896 | Submit Existing Partner and quick add children | merged | chereseeriepa |
| 2023-08-31 | !895 | New Crowdin updates | merged | mixmix |
| 2023-08-31 | !894 | New Crowdin updates | merged | mixmix |
| 2023-08-28 | !893 | Submit existing partner | merged | chereseeriepa |
| 2023-08-28 | !892 | Submit existing children | merged | chereseeriepa |
| 2023-08-27 | !891 | fix bug where duplicate links are being created | merged | chereseeriepa |
| 2023-08-25 | #29 | BUG - ahau not syncing with peers on pataka | closed | Tairea |
| 2023-08-23 | !890 | move profile field list into its own component | merged | chereseeriepa |
| 2023-08-22 | !888 | Delete person submission | merged | chereseeriepa |
| 2023-08-22 | !887 | fix bug with custom fields showing for an existing person in the NewPersonDialog | merged | chereseeriepa |
| 2023-08-21 | !886 | hide select all when reviewing a submission where there is only one field | merged | chereseeriepa |
| 2023-08-16 | !885 | fix bug where quick add children werent showing up when adding a parent,... | merged | chereseeriepa |
| 2023-08-16 | !884 | Quick add family members in a submit-only whakapapa | merged | chereseeriepa |
| 2023-08-16 | !883 | Add sibling submission | merged | chereseeriepa |
| 2023-08-15 | !882 | Add partner submission | merged | chereseeriepa |
| 2023-08-15 | !881 | Add parent submission | merged | chereseeriepa |
| 2023-07-28 | !880 | New Crowdin updates | merged | mixmix |
| 2023-07-28 | !879 | fix UI for reviewing submissions | merged | chereseeriepa |
| 2023-07-28 | !878 | fix UI for reviewing submissions | merged | chereseeriepa |
| 2023-07-27 | !877 | Field filtering again | merged | mixmix |
| 2023-07-24 | !876 | allow select all and unselect all on all fields, fix school and education... | merged | chereseeriepa |
| 2023-07-24 | !875 | Draft: Select All | closed | chereseeriepa |
| 2023-07-24 | !874 | fix bug with approvedBy and rejectedBy | merged | chereseeriepa |
| 2023-07-20 | !873 | Draft: Enable credentials | closed | mixmix |
| 2023-07-19 | !872 | fix bug and UI with altnames | merged | chereseeriepa |
| 2023-07-18 | !871 | Draft: Web form ui | closed | chereseeriepa |
| 2023-07-06 | !869 | update modules for source and joining questions for web registrations | merged | chereseeriepa |
| 2023-07-04 | !868 | Kaitiaki can review new profile submissions | merged | chereseeriepa |
| 2023-07-03 | !867 | allow convenient way to delete submissions from the notification panel by tombstoning them | merged | chereseeriepa |
| 2023-06-12 | !864 | updated addperson to end | merged | Tairea |
| 2023-05-30 | !862 | New Crowdin updates | merged | mixmix |
| 2023-05-30 | !861 | /docs/translation.md | merged | mixmix |
| 2023-05-29 | !860 | rename the electron-notarize package to @electron/notarize | merged | chereseeriepa |
| 2023-05-29 | !859 | En nz | merged | mixmix |
| 2023-05-29 | !858 | New Crowdin updates | merged | mixmix |
| 2023-05-29 | !857 | New Crowdin updates | merged | mixmix |
| 2023-05-29 | !856 | tidyup old docs | merged | mixmix |
| 2023-05-29 | !855 | L10n master | closed | mixmix |
| 2023-05-22 | !851 | Bad css | merged | mixmix |
| 2023-05-21 | !850 | change how submissions are approved | merged | chereseeriepa |
| 2023-05-18 | !849 | add more tests around csv export/import | merged | mixmix |
| 2023-05-15 | !848 | fix multi-value field display | merged | mixmix |
| 2023-05-04 | !846 | allow altNames and customFields on submissions, fix group on submissions | merged | chereseeriepa |
| 2023-05-02 | !845 | Mix mobile | merged | mixmix |
| 2023-04-30 | !844 | add altnames support to submissions | merged | chereseeriepa |
| 2023-04-27 | !843 | get approve/reject submissions working, update texts displayed based on submission status | merged | chereseeriepa |
| 2023-04-24 | !842 | add group, target and comment authors to submissions | merged | chereseeriepa |
| 2023-04-23 | !841 | Add submissions to the notifications panel | merged | chereseeriepa |
| 2023-04-20 | !840 | update ssb-ahau and ssb-submissions for submissions.list | merged | chereseeriepa |
| 2023-04-11 | !839 | Update graphql | merged | mixmix |
| 2023-04-07 | !838 | members can make a submission | merged | chereseeriepa |
| 2023-03-07 | !837 | add custom field csv import to whakapapa | merged | chereseeriepa |
| 2023-03-07 | !836 | make component with csv import code | merged | chereseeriepa |
| 2023-03-02 | !835 | fix table not showing adminProfile and custom fields upon initial loading | merged | chereseeriepa |
| 2023-03-01 | !834 | fix bug where whakapapa table is not loading | merged | chereseeriepa |
| 2023-03-01 | !833 | Fix person index profile create | merged | chereseeriepa |
| 2023-03-01 | !832 | Fix person index reload | merged | chereseeriepa |
| 2023-02-28 | !830 | fix person list profile loading and merging | merged | chereseeriepa |
| 2023-01-17 | !828 | Draft: Stable build | closed | twoBitSoda |
| 2022-12-07 | !827 | add dmg-license to desktop dependencies, update installer docs | merged | chereseeriepa |
| 2022-12-07 | !826 | update UI deps | closed | mixmix |
| 2022-12-01 | !824 | Draft: added ability to submit changes | merged | Mahakileach |
| 2022-11-23 | !822 | Draft: Update cicd | closed | engie15 |
| 2022-11-15 | !819 | fixed back button and hide collection button | merged | Tairea |
| 2022-11-15 | !818 | Add-person-list PR update 3 | merged | Tairea |
| 2022-11-15 | !817 | Add-person-list PR update 2 | merged | Tairea |
| 2022-11-15 | !816 | Add-person-list PR update | merged | Tairea |
| 2022-11-14 | !815 | add /desktop/package-lock.json to gitignore | closed | engie15 |
| 2022-10-28 | !813 | updated correct spacing, whakapapa recordCount, changed langauge to tribe | merged | Tairea |
| 2022-10-11 | !812 | simplify svg | merged | mixmix |
| 2022-10-10 | !811 | Mix tweaks | merged | mixmix |
| 2022-10-09 | !810 | Partner layout | merged | Tairea |
| 2022-10-06 | !809 | Partner layout | merged | Tairea |
| 2022-10-04 | !808 | update electron-builder config with new publisherName for windows | merged | mixmix |
| 2022-09-30 | !807 | fix add kaitiaki | merged | Tairea |
| 2022-09-30 | !805 | Revert "Merge branch 'csv-import-export-custom-fields' into 'master'" | merged | Tairea |
| 2022-09-07 | !801 | view only story records | merged | chereseeriepa |
| 2022-09-06 | !799 | Person Custom Field - Dates | merged | chereseeriepa |
| 2022-09-05 | !798 | Community Custom Fields - Dates | merged | chereseeriepa |
| 2022-08-31 | !797 | fix bug where opening side node dialog too fast was causing it to crash. This... | merged | chereseeriepa |
| 2022-08-31 | !796 | hide default fields that arent in the data model, when editing in side node dialog | merged | chereseeriepa |
| 2022-08-31 | !795 | improve alerts and dialog closing when deleting a whakapapa | merged | chereseeriepa |
| 2022-08-31 | !794 | fix bug where you couldnt delete a person, it was ignoring them instead | merged | chereseeriepa |
| 2022-08-31 | !793 | better alert messages when saving changes to profiles in the side node dialog | merged | chereseeriepa |
| 2022-08-31 | !792 | hide columns that arent in the default data model | merged | chereseeriepa |
| 2022-08-30 | !791 | dont display default fields that arent in the data model on side node dialog | merged | chereseeriepa |
| 2022-08-25 | !790 | fix bug where you couldnt edit array item custom fields | merged | chereseeriepa |
| 2022-08-24 | !789 | rename NewNodeDialog to NewPersonDialog, EditNodeDialog to EditPersonDialog | merged | chereseeriepa |
| 2022-08-24 | !788 | change whakapapa save btn to next, disable submission until valid form data | merged | chereseeriepa |
| 2022-08-24 | !787 | write tests around getInitialCustomFieldChanges and getCustomFieldChanges | merged | chereseeriepa |
| 2022-08-24 | !786 | dont allow custom fields when logging in for the first time | merged | chereseeriepa |
| 2022-08-24 | !785 | allow saving custom fields when adding a new person | merged | chereseeriepa |
| 2022-08-23 | !784 | add helper to get custom field changes on create | merged | chereseeriepa |
| 2022-08-23 | !783 | only allow required fields when registering for a tribe | merged | chereseeriepa |
| 2022-08-23 | !782 | fix bug where you couldnt see custom fields when creating a new profile | merged | chereseeriepa |
| 2022-08-18 | !780 | add form validation to default fields | merged | chereseeriepa |
| 2022-08-17 | !779 | View Custom Fields - Table | merged | chereseeriepa |
| 2022-08-16 | !778 | View Custom Fields - Person Index | merged | chereseeriepa |
| 2022-08-16 | !777 | View Custom Fields - SideNodeDialog | merged | chereseeriepa |
| 2022-08-10 | !776 | Edit Custom Fields - SideNodeDialog | merged | chereseeriepa |
| 2022-08-10 | !775 | Custom Fields [3] - Reviewing Registrations | merged | chereseeriepa |
| 2022-08-08 | !774 | Custom Fields [2] - Personal Page View/Edit | merged | chereseeriepa |
| 2022-07-20 | !771 | Custom Fields [1] - Registrations | merged | chereseeriepa |
| 2022-07-20 | !770 | hide all fields that arent defined on the community | closed | chereseeriepa |
| 2022-07-14 | !768 | Create custom fields | merged | chereseeriepa |
| 2022-07-14 | !767 | Custom data field ui | closed | chereseeriepa |
| 2022-07-14 | !766 | readd array type, update ssb-ahau with bug fix | merged | chereseeriepa |
| 2022-07-13 | !765 | Registration Custom Fields | closed | chereseeriepa |
| 2022-07-13 | !764 | Community Custom Fields | merged | chereseeriepa |
| 2022-07-13 | !763 | Custom default fields | merged | chereseeriepa |
| 2022-07-13 | !762 | fix creating custom fields on a community | merged | chereseeriepa |
| 2022-07-10 | !760 | Perf | merged | mixmix |
| 2022-06-29 | !759 | upgrade custom field deps, plug maintenance changes | closed | chereseeriepa |
| 2022-06-06 | !758 | Custom data field ui | closed | chereseeriepa |
| 2022-05-25 | !755 | fix hidden headers number, dont allow no headers | merged | chereseeriepa |
| 2022-05-25 | !754 | fix bugs where you couldnt update items in the persons list | merged | chereseeriepa |
| 2022-05-24 | !753 | update styling for persons list | merged | chereseeriepa |
| 2022-05-24 | !752 | UI for whakapapa index in mobile | merged | chereseeriepa |
| 2022-05-24 | !751 | Person List UI | merged | chereseeriepa |
| 2022-05-20 | !749 | Highlight path to node | merged | chereseeriepa |
| 2022-05-20 | !748 | Collapse path to node | merged | chereseeriepa |
| 2022-05-19 | !747 | Move searchNodeId to vuex | merged | chereseeriepa |
| 2022-05-19 | !746 | Path between nodes | merged | chereseeriepa |
| 2022-05-17 | !743 | Update Node Search | merged | chereseeriepa |
| 2022-05-13 | !740 | New Crowdin updates | merged | mixmix |
| 2022-05-13 | !739 | add pataka list to the profile page | merged | chereseeriepa |
| 2022-05-13 | !738 | change the text and icon on the edit profile button | merged | chereseeriepa |
| 2022-05-12 | !737 | Toggle community features | merged | chereseeriepa |
| 2022-05-12 | !736 | Draft: Toggle community features | closed | chereseeriepa |
| 2022-05-11 | !734 | move access options to vuex - whakapapa | merged | chereseeriepa |
| 2022-05-06 | !733 | New Crowdin updates | merged | mixmix |
| 2022-05-04 | !732 | fix button to be the correct size and color when toggled | merged | chereseeriepa |
| 2022-05-04 | !731 | fix bug where you couldnt edit education and school | merged | chereseeriepa |
| 2022-05-03 | !730 | show delete dialog to confirm a delete in person list | merged | chereseeriepa |
| 2022-05-03 | !729 | New Crowdin updates | merged | mixmix |
| 2022-05-03 | !728 | fix translations on delete node dialog, tidy code | merged | chereseeriepa |
| 2022-05-03 | !727 | change single quotes to double | merged | chereseeriepa |
| 2022-05-02 | !726 | New Crowdin updates | merged | mixmix |
| 2022-05-01 | !725 | add missing translations to review registrations | merged | chereseeriepa |
| 2022-05-01 | !724 | New Crowdin updates | merged | mixmix |
| 2022-05-01 | !723 | add a placeholder for joining questions | merged | chereseeriepa |
| 2022-05-01 | !722 | fix ui for registration joining questions | merged | chereseeriepa |
| 2022-04-26 | !721 | make list-people route/view | merged | mixmix |
| 2022-04-07 | !719 | Change port | merged | chereseeriepa |
| 2022-04-07 | !718 | fix bug where translations were broken in ReviewRegistrationDialog | merged | chereseeriepa |
| 2022-04-06 | !717 | fix bug where it wasnt creating links on csv bulk import | merged | chereseeriepa |
| 2022-04-06 | !716 | fix linting errors and warnings | merged | chereseeriepa |
| 2022-04-04 | !714 | fix base href code for publicPath | merged | chereseeriepa |
| 2022-03-28 | !713 | eslint (mainly indents, replacing var) | merged | mixmix |
| 2022-03-22 | !711 | change the Y offset between partner links | merged | chereseeriepa |
| 2022-03-21 | !710 | Change relationshipType on quick add | merged | chereseeriepa |
| 2022-03-18 | !708 | fix bug where whanau isnt displaying in the side dialog | merged | chereseeriepa |
| 2022-03-18 | !707 | misc line drawing fixes | merged | mixmix |
| 2022-03-17 | !706 | update old code to use new vuex getters for getting whanau ids | merged | chereseeriepa |
| 2022-03-17 | !705 | remove relationshipType from close suggestions who arent already family | merged | chereseeriepa |
| 2022-03-17 | !704 | fix bug where it wasnt suggesting partners children as a close child | merged | chereseeriepa |
| 2022-03-17 | !703 | revert a change on saveWhakapapaView | merged | chereseeriepa |
| 2022-03-17 | !702 | fix partner deletion | merged | chereseeriepa |
| 2022-03-16 | !701 | Reload Issue | closed | chereseeriepa |
| 2022-03-16 | !700 | fix typos | merged | chereseeriepa |
| 2022-03-15 | !699 | Draft: Notifications | closed | mixmix |
| 2022-03-15 | !698 | upgrade many deps | merged | mixmix |
| 2022-03-14 | !697 | clean up unused registration code | merged | chereseeriepa |
| 2022-03-13 | !696 | Move suggestions | merged | chereseeriepa |
| 2022-03-13 | !695 | move find by name query to vuex | merged | chereseeriepa |
| 2022-03-13 | !694 | fix bug where name search fails because of regex and brackets | merged | chereseeriepa |
| 2022-03-10 | !692 | compute siblings from the whakapapa links | merged | mixmix |
| 2022-03-10 | !691 | Draft: only editting admin profiles | closed | mixmix |
| 2022-03-08 | !690 | suggestions tidyup | merged | mixmix |
| 2022-03-07 | !689 | Bug: Updating profile in SideNodeDialog | merged | chereseeriepa |
| 2022-03-06 | !687 | Fix partners | merged | mixmix |
| 2022-03-02 | !686 | display unknown links as birth links | merged | chereseeriepa |
| 2022-03-01 | !685 | Squashed commit of the following: | merged | mixmix |
| 2022-03-01 | !684 | Undrawn descendants | merged | chereseeriepa |
| 2022-02-28 | !683 | fixes from review | merged | mixmix |
| 2022-02-28 | !681 | extend search to include partners! | merged | mixmix |
| 2022-02-28 | !680 | get quick-add working again | merged | mixmix |
| 2022-02-24 | !678 | fix table data loading | merged | mixmix |
| 2022-02-24 | !677 | Highlight children | merged | mixmix |
| 2022-02-13 | !674 | Mix fixes | merged | mixmix |
| 2022-02-10 | !673 | WIP: Table Fix | merged | chereseeriepa |
| 2022-02-09 | !672 | WIP: Load descendants loop | merged | chereseeriepa |
| 2022-02-08 | !671 | update nestedWhakapapa to load extended family | merged | chereseeriepa |
| 2022-01-17 | !670 | change how nestedWhakapapa is calculated, move loadDescendants to vuex | merged | chereseeriepa |
| 2022-01-16 | !669 | remove parent node map and change places to use vuex getters | merged | chereseeriepa |
| 2022-01-11 | !667 | move d3 tree layout code to vuex | merged | chereseeriepa |
| 2022-01-11 | !666 | reload node when editing a profile | merged | chereseeriepa |
| 2022-01-10 | !665 | Durr | merged | mixmix |
| 2021-12-14 | !664 | change side dialog to take a profileId instead of a profile | merged | chereseeriepa |
| 2021-12-14 | !663 | move the context menu to vuex | merged | chereseeriepa |
| 2021-12-14 | !662 | move getProfile from profile mixins to vuex | merged | chereseeriepa |
| 2021-12-13 | !661 | move profile mixin methods to vuex | merged | chereseeriepa |
| 2021-12-12 | !660 | fixed broken saveLink | merged | Tairea |
| 2021-12-09 | !659 | fix importing CSV into kaitiki only + displaying kaitiaki only data | merged | mixmix |
| 2021-12-08 | !658 | stop loadDescendants when closing a whakapapa | merged | chereseeriepa |
| 2021-12-08 | !657 | make csv bulk profile creation code more testable | merged | chereseeriepa |
| 2021-12-08 | !656 | expand publisherName to include two different Ahau | merged | mixmix |
| 2021-12-07 | !655 | stop infinite recursion on tree | merged | chereseeriepa |
| 2021-12-06 | !654 | Csv image import export | merged | chereseeriepa |
| 2021-12-06 | !653 | allow adminProfile fields when importing a csv | merged | chereseeriepa |
| 2021-12-05 | !652 | allow csv import/export to support partners | merged | chereseeriepa |
| 2021-12-05 | !651 | remove monkey patching a nodes parent onto selectedProfile, fix bug with add sibling | merged | chereseeriepa |
| 2021-12-03 | !650 | fix bug where creating a new tribe wasnt routing properly | merged | chereseeriepa |
| 2021-12-03 | !649 | maintenance: Vuex community namespace | merged | chereseeriepa |
| 2021-12-02 | !648 | New Crowdin updates | merged | mixmix |
| 2021-12-01 | !647 | maintenance 6: change namespacing for vuex whakapapa helpers | merged | chereseeriepa |
| 2021-12-01 | !646 | maintenance 5: change namespacing for vuex analytics helpers | merged | chereseeriepa |
| 2021-12-01 | !645 | maintenance 4: change namespacing for vuex settings helpers | merged | chereseeriepa |
| 2021-12-01 | !644 | maintenance 3: change namespacing for vuex alerts helpers | merged | chereseeriepa |
| 2021-12-01 | !643 | maintenance 2: change namespacing for vuex tribe helpers | closed | chereseeriepa |
| 2021-12-01 | !642 | maintenance 1: change namespacing for vuex person helpers | merged | chereseeriepa |
| 2021-11-29 | !641 | Kaitiaki whakapapa access | merged | chereseeriepa |
| 2021-11-29 | !640 | Kaitiaki Whakapapa Tweaks | merged | chereseeriepa |
| 2021-11-25 | !639 | fix loading spinner, more relaxed polling | merged | mixmix |
| 2021-11-25 | !638 | WIP set access while creating a new view | closed | chereseeriepa |
| 2021-11-25 | !637 | add CI! | merged | mixmix |
| 2021-11-25 | !636 | allow editing of relationships | merged | mixmix |
| 2021-11-24 | !635 | New Crowdin updates | merged | mixmix |
| 2021-11-23 | !634 | updated partner y spacing and whakapapaindex | merged | Tairea |
| 2021-11-16 | !632 | editing relationships | closed | chereseeriepa |
| 2021-11-11 | !631 | hide less important links when their parent is collapsed | merged | chereseeriepa |
| 2021-11-11 | !630 | update important relationships to handle different types | merged | chereseeriepa |
| 2021-11-11 | !629 | change UI so whakapapaViews only loaded for current tribe | merged | mixmix |
| 2021-11-11 | !628 | Admin profiles everywher | merged | mixmix |
| 2021-11-10 | !627 | set so the app bar is displayed underneath the appbar | merged | chereseeriepa |
| 2021-11-10 | !626 | WIP: move appBar above loading spinner | closed | chereseeriepa |
| 2021-11-10 | !625 | improve whakapapa loading times | merged | chereseeriepa |
| 2021-11-09 | !624 | fix bug where navigating to the archive of a person was broken | merged | chereseeriepa |
| 2021-11-09 | !623 | fix bug where when a whakapapa was closed it tried saving the record count... | merged | chereseeriepa |
| 2021-11-09 | !622 | fix bug where it was classing partner children as duplicates | merged | chereseeriepa |
| 2021-11-08 | !621 | Infinite whangai | merged | mixmix |
| 2021-11-08 | !620 | update whakapapa deps, replace view.kaitiaki with view.tiaki | merged | chereseeriepa |
| 2021-11-07 | !619 | shifter whangai line so it goes up close to parent | merged | mixmix |
| 2021-11-05 | !618 | New Crowdin updates | merged | mixmix |
| 2021-11-04 | !617 | Delete dupes | merged | chereseeriepa |
| 2021-11-01 | !616 | WIP: Handle dupes filtering | closed | chereseeriepa |
| 2021-11-01 | !615 | WIP: Handle dups | merged | chereseeriepa |
| 2021-10-21 | !613 | Parent alignment | merged | Tairea |
| 2021-10-20 | !612 | fix failing tests on csv | merged | chereseeriepa |
| 2021-10-14 | !609 | DRAFT No avatars | closed | Tairea |
| 2021-10-14 | !608 | update code add members as kaitiaki | merged | chereseeriepa |
| 2021-10-13 | !607 | update deps, add back code to show admin profile information | merged | chereseeriepa |
| 2021-10-13 | !606 | New Crowdin updates | merged | mixmix |
| 2021-10-12 | !605 | Draft: Upgrades deps | closed | mixmix |
| 2021-10-12 | !604 | Kos fixes | merged | mixmix |
| 2021-10-12 | !603 | improve loading spinner - seperate loading + indexing state | merged | mixmix |
| 2021-10-12 | !602 | WIP: Fixes for ahau-graphql | closed | chereseeriepa |
| 2021-10-06 | !601 | Ahau graphql | closed | mixmix |
| 2021-09-26 | !599 | removing loading for db.status on the whakapapa | merged | chereseeriepa |
| 2021-09-20 | !597 | WIP: Subgroups members | closed | chereseeriepa |
| 2021-09-18 | !596 | delete a subgroup | merged | chereseeriepa |
| 2021-09-18 | !595 | update a subgroup | merged | chereseeriepa |
| 2021-09-17 | !594 | move the getTribes query to vuex | merged | chereseeriepa |
| 2021-09-06 | !592 | move child suggestion function to vuex, add tests for it | merged | chereseeriepa |
| 2021-09-03 | !591 | Record count | merged | Tairea |
| 2021-09-01 | !590 | fix bug where links were created incorrectly when quick adding parents | merged | chereseeriepa |
| 2021-09-01 | !589 | ON-HOLD: Edit partner links | closed | chereseeriepa |
| 2021-08-31 | !587 | Edit whakapapa links | merged | chereseeriepa |
| 2021-08-26 | !586 | adding contributors when editing a profile | merged | Tairea |
| 2021-08-23 | !585 | fixed x-scrollbar to bottom of table | merged | Tairea |
| 2021-08-23 | !584 | Fix image | merged | Tairea |
| 2021-08-23 | !583 | Data model | merged | Tairea |
| 2021-08-22 | !581 | Subgroups Create + View | merged | chereseeriepa |
| 2021-08-22 | !580 | Windows commands | merged | BlakeAkapita |
| 2021-08-22 | !578 | Filter out stories already in a collection | merged | BlakeAkapita |
| 2021-08-22 | !577 | Search bar for stories | merged | BlakeAkapita |
| 2021-08-05 | !569 | remove input, add slider for age filters | merged | chereseeriepa |
| 2021-08-05 | !568 | Vuex table filter | merged | BlakeAkapita |
| 2021-07-29 | !563 | node separation NOTE: not working | merged | chereseeriepa |
| 2021-07-29 | !562 | show other parents of children who dont have a second parent whos a partner | merged | chereseeriepa |
| 2021-07-28 | !561 | show loading when rebuilding | merged | chereseeriepa |
| 2021-07-28 | !560 | Pataka list skeleton | merged | chereseeriepa |
| 2021-07-28 | !559 | seperate code for pataka and community | merged | chereseeriepa |
| 2021-07-27 | !558 | add skeletons to community list / discovery page | merged | chereseeriepa |
| 2021-07-27 | !557 | split community lists into component | merged | chereseeriepa |
| 2021-07-27 | !556 | add skeleton to whakapapa index | merged | chereseeriepa |
| 2021-07-27 | !555 | update nonPartners code to use existing data | merged | chereseeriepa |
| 2021-07-26 | !554 | update the skeleton loader display on profile.vue | merged | chereseeriepa |
| 2021-07-22 | !553 | fix bug where edit profile btn was hidden on mobile view | merged | chereseeriepa |
| 2021-07-21 | !552 | pin community dialog tabs to the top bar, fix cut off in mobile view | merged | chereseeriepa |
| 2021-07-21 | !550 | fix bug saving a collection to a story = typo | merged | chereseeriepa |
| 2021-07-21 | !549 | move pataka code + id to own file | merged | chereseeriepa |
| 2021-07-21 | !547 | shift more autoPrune logic into getters | closed | mixmix |
| 2021-07-19 | !544 | updated backbutton and small fix dialog | merged | Tairea |
| 2021-07-19 | !543 | Storage Limiting | merged | chereseeriepa |
| 2021-07-07 | !537 | use env-paths for new app home dir | merged | mixmix |
| 2021-06-24 | !530 | Analytics/version | merged | mixmix |
| 2021-06-24 | !528 | Delete ahau additions | merged | chereseeriepa |
| 2021-06-23 | !526 | Translations for Dialog Handler | merged | BlakeAkapita |
| 2021-06-23 | !525 | Added translations for NewNodeDialog | merged | BlakeAkapita |
| 2021-06-22 | !524 | New Crowdin updates | merged | mixmix |
| 2021-06-19 | !520 | fix delete collection | merged | chereseeriepa |
| 2021-06-17 | !516 | Community kaitiaki | merged | chereseeriepa |
| 2021-06-10 | !513 | New Crowdin updates | merged | mixmix |
| 2021-06-08 | !512 | show alerts when mutating collections | merged | chereseeriepa |
| 2021-06-04 | !508 | update ssb-ahau, reinstall modules | merged | chereseeriepa |
| 2021-06-03 | !506 | New Crowdin updates | merged | mixmix |
| 2021-05-29 | !502 | move methods to vuex | merged | chereseeriepa |
| 2021-05-29 | !501 | Key backup ui bug | merged | chereseeriepa |
| 2021-05-28 | !500 | fix reload in development bug | merged | mixmix |
| 2021-05-27 | !499 | New Crowdin updates | merged | mixmix |
| 2021-05-19 | !495 | Bug upload | merged | chereseeriepa |
| 2021-05-17 | !489 | Profile avatar bug | merged | chereseeriepa |
| 2021-05-17 | !488 | New Crowdin updates | merged | mixmix |
| 2021-05-14 | !487 | remove /pataka, split up README, tidy up root scripts | merged | mixmix |
| 2021-05-13 | !486 | fix bug where all whakapapa werent showing, update changelog | merged | chereseeriepa |
| 2021-05-10 | !483 | install mixpanel for analytics | merged | mixmix |
| 2021-05-05 | !482 | update changelog with changes for v1.3.0 | merged | chereseeriepa |
| 2021-05-05 | !481 | Ahau updater | merged | mixmix |
| 2021-05-05 | !479 | Update ahau-env | merged | chereseeriepa |
| 2021-05-03 | !476 | Access Button Translations | merged | BlakeAkapita |
| 2021-05-03 | !475 | WIP: Node path highlighting bug | closed | BlakeAkapita |
| 2021-04-29 | !474 | Collection mixin to vuex | merged | chereseeriepa |
| 2021-04-29 | !473 | Added translations for date-helpers | merged | BlakeAkapita |
| 2021-04-27 | !472 | add whakapapa to mixin, fix bug | merged | chereseeriepa |
| 2021-04-26 | !471 | New Crowdin updates | merged | mixmix |
| 2021-04-26 | !470 | add desktop/CHANGELOG | merged | mixmix |
| 2021-04-25 | !468 | refactor archive route | merged | chereseeriepa |
| 2021-04-25 | !467 | fix broken post code translation on community form | merged | chereseeriepa |
| 2021-04-25 | !466 | fix file download name not showing, add proper filename and extension | merged | chereseeriepa |
| 2021-04-25 | !465 | fix member avatar showing wrong gender | merged | chereseeriepa |
| 2021-04-25 | !464 | Timeline card image | merged | chereseeriepa |
| 2021-04-23 | !462 | fixed so that maori translations are pulling through | merged | rachael.peri |
| 2021-04-23 | !461 | Artefact show bug | merged | BlakeAkapita |
| 2021-04-23 | !459 | Notification Bug | merged | BlakeAkapita |
| 2021-04-22 | !458 | I18n navbar | merged | rachael.peri |
| 2021-04-22 | !457 | I18n appbar | merged | rachael.peri |
| 2021-04-22 | !456 | magic-tree-fix | merged | mixmix |
| 2021-04-22 | !455 | added profile authors to sideNodeDialog | merged | Tairea |
| 2021-04-21 | !454 | Adding sibling has no parent by default | merged | BlakeAkapita |
| 2021-04-21 | !453 | fix bug where partner wasnt reloading properly | merged | chereseeriepa |
| 2021-04-21 | !452 | Partners bugs | merged | BlakeAkapita |
| 2021-04-21 | !451 | fix bug where add sibling showing when there are no parents | merged | chereseeriepa |
| 2021-04-21 | !450 | minor fixes | merged | chereseeriepa |
| 2021-04-21 | !449 | fix bug with t is not a function | merged | chereseeriepa |
| 2021-04-20 | !448 | Translation fixes | merged | chereseeriepa |
| 2021-04-19 | !447 | New Crowdin updates | merged | mixmix |
| 2021-04-16 | !446 | Image fixes | merged | Tairea |
| 2021-04-16 | !445 | I18n view tribes | merged | rachael.peri |
| 2021-04-15 | !444 | Fix profile form | merged | Tairea |
| 2021-04-15 | !443 | RecordForm Translations | merged | BlakeAkapita |
| 2021-04-15 | !442 | WIP: Added add-story-menu.json | closed | BlakeAkapita |
| 2021-04-15 | !441 | Added translations for new whakapapa dialog | merged | BlakeAkapita |
| 2021-04-15 | !440 | Added translations for archive helper | merged | BlakeAkapita |
| 2021-04-15 | !439 | I18n instructions whakapapa | merged | rachael.peri |
| 2021-04-15 | !438 | Fixed Sort Bug in Whakapapa Table | merged | BlakeAkapita |
| 2021-04-15 | !436 | I18n view person archive | merged | rachael.peri |
| 2021-04-15 | !434 | translations for view-tribal-registry.json | merged | BlakeAkapita |
| 2021-04-14 | !433 | I18n add collection form | merged | rachael.peri |
| 2021-04-14 | !432 | New Crowdin updates | merged | mixmix |
| 2021-04-14 | !431 | translations plugged into view-tribes.json | merged | rachael.peri |
| 2021-04-14 | !430 | add locale-picker | merged | mixmix |
| 2021-04-14 | !429 | fix fragment matching | merged | chereseeriepa |
| 2021-04-14 | !428 | New Crowdin updates | closed | mixmix |
| 2021-04-14 | !427 | Draft: Find by name duplication | closed | chereseeriepa |
| 2021-04-13 | !426 | extract ArtefactCarousel from StoryCard | merged | mixmix |
| 2021-04-13 | !425 | Wadsworth | merged | mixmix |
| 2021-04-13 | !424 | translations connected for add-pataka-form.json | merged | rachael.peri |
| 2021-04-13 | !423 | translations for add-community-form.json | merged | rachael.peri |
| 2021-04-12 | !421 | Embedding translations for view-person.json | merged | rachael.peri |
| 2021-04-12 | !420 | add ports for hyperblobs from ahau-env | closed | chereseeriepa |
| 2021-04-11 | !419 | Add partners children | merged | Tairea |
| 2021-04-10 | !418 | Search fixs | merged | Tairea |
| 2021-04-08 | !416 | Record links | merged | Tairea |
| 2021-04-08 | !415 | New Crowdin updates | closed | mixmix |
| 2021-04-08 | !414 | New Crowdin updates | merged | mixmix |
| 2021-04-07 | !413 | fix images being zoomed in on the render media div | merged | chereseeriepa |
| 2021-04-06 | !412 | New Crowdin updates | merged | mixmix |
| 2021-04-06 | !411 | Video Poster | merged | chereseeriepa |
| 2021-04-06 | !410 | fix side node bugs | merged | Tairea |
| 2021-04-06 | !409 | add dieadAt date to sideViewDialog | merged | Tairea |
| 2021-04-06 | !408 | Profile searchbar fix | merged | Tairea |
| 2021-04-06 | !407 | Export csv | merged | Tairea |
| 2021-04-01 | !404 | New Crowdin updates | merged | mixmix |
| 2021-03-31 | !403 | New Crowdin updates | closed | mixmix |
| 2021-03-31 | !402 | I18n initial | merged | rachael.peri |
| 2021-03-30 | !401 | Date Picker Interval: DoB and DoB are the same | merged | BlakeAkapita |
| 2021-03-30 | !400 | Fixed Table Buttons on Mobile | merged | BlakeAkapita |
| 2021-03-29 | !399 | Carousel Changes | merged | chereseeriepa |
| 2021-03-28 | !396 | Mobile dialog fixes | merged | Tairea |
| 2021-03-25 | !395 | initial i18n translation setup | merged | mixmix |
| 2021-03-24 | !394 | Clear Search in Whakapapa Tree/Table | merged | BlakeAkapita |
| 2021-03-24 | !393 | fix mobile show artefact | merged | romuloalves |
| 2021-03-23 | !392 | Profile ui fixes | merged | Tairea |
| 2021-03-23 | !391 | fixed minor scrolling issues | merged | Tairea |
| 2021-03-22 | !390 | Update CSV Importing | merged | BlakeAkapita |
| 2021-03-22 | !389 | New profile fields not saving in dialogs | merged | BlakeAkapita |
| 2021-03-19 | !385 | Profile Form Fixes | merged | chereseeriepa |
| 2021-03-19 | !384 | fix back button to new story and collection | closed | romuloalves |
| 2021-03-18 | !383 | WIP: Add Alt name/Education/School Refactor | closed | BlakeAkapita |
| 2021-03-17 | !382 | Context Menu Refactor | merged | chereseeriepa |
| 2021-03-15 | !380 | Mobile artefacts | merged | Tairea |
| 2021-03-14 | !379 | Update Whakapapa Table info | merged | BlakeAkapita |
| 2021-03-14 | !378 | New Crowdin updates | closed | mixmix |
| 2021-03-09 | !377 | Draft: New Crowdin updates | closed | mixmix |
| 2021-03-09 | !376 | Remove location | merged | Tairea |
| 2021-03-08 | !374 | HYPER BLOBS + port scramble! | merged | mixmix |
| 2021-03-08 | !373 | Update dialogs | merged | chereseeriepa |
| 2021-03-08 | !371 | WIP: Add partner | closed | chereseeriepa |
| 2021-03-08 | !370 | Mobile backbutton fixes | merged | Tairea |
| 2021-03-06 | !367 | DRAFT: Whakapapa Show Refactor | closed | chereseeriepa |
| 2021-03-05 | !366 | Table Filter Menu - Grid Improvements | merged | chereseeriepa |
| 2021-03-04 | !365 | Draft: Persistent filter | closed | chereseeriepa |
| 2021-03-04 | !364 | Profile name inputs | merged | BlakeAkapita |
| 2021-03-04 | !363 | New Node Search Bug Fix | closed | chereseeriepa |
| 2021-03-04 | !362 | Maintenance | merged | chereseeriepa |
| 2021-03-03 | !361 | Draft: i18n | closed | mixmix |
| 2021-03-03 | !360 | Fixed bug causing error message when calculating display names | merged | BlakeAkapita |
| 2021-03-02 | !358 | Fix avatar display names | merged | chereseeriepa |
| 2021-03-02 | !357 | Edit partner (root node) bug | merged | chereseeriepa |
| 2021-03-02 | !356 | Partners fix | merged | chereseeriepa |
| 2021-02-28 | !355 | Dialog Handler Tidy Up | closed | chereseeriepa |
| 2021-02-24 | !354 | Show Declined Applications | merged | chereseeriepa |
| 2021-02-24 | !353 | Back button | merged | Tairea |
| 2021-02-24 | !352 | Fixes to wording | merged | iantairea |
| 2021-02-24 | !351 | WIP: More Snackbars | closed | chereseeriepa |
| 2021-02-24 | !350 | update npm commands | merged | chereseeriepa |
| 2021-02-22 | !349 | WIP: speed up changes TODO: add version of ssb-graphql-story to ssb-ahau | closed | chereseeriepa |
| 2021-02-21 | !348 | Swapped preferred name and full name in sort dialog | merged | BlakeAkapita |
| 2021-02-21 | !347 | Fixed bug with legal/full name sort | merged | BlakeAkapita |
| 2021-02-12 | !344 | Application - Custom Forms | merged | chereseeriepa |
| 2021-02-12 | !343 | fresh install of dependencies | merged | chereseeriepa |
| 2021-02-10 | !341 | Blank table headers | merged | BlakeAkapita |
| 2021-02-09 | !340 | WhakapapaShowViewCard and Whakapapa Table Padding | merged | BlakeAkapita |
| 2021-02-04 | !338 | HACK: Pataka bug hack | merged | chereseeriepa |
| 2021-02-03 | !337 | Community Custom Forms | merged | chereseeriepa |
| 2021-02-02 | !335 | install new tangle speed-up, update modules | merged | mixmix |
| 2021-01-29 | !334 | added tool tips for whakapaparecorddialog.vue | merged | rachael.peri |
| 2021-01-24 | !332 | Location Field on Artefacts | merged | chereseeriepa |
| 2021-01-24 | !331 | View collection | merged | chereseeriepa |
| 2021-01-21 | !330 | can edit a community details TODO: edit collection stories from dialog | merged | chereseeriepa |
| 2021-01-11 | !329 | Draft: Table filter feature | closed | BlakeAkapita |
| 2020-12-31 | #26 | Fix Cordova build | closed | romuloalves |
| 2020-12-15 | !323 | Artefact bugs | closed | chereseeriepa |
| 2020-12-14 | !322 | Auto Populate Bug | merged | chereseeriepa |
| 2020-12-14 | !321 | WIP: Fix suggestions when adding a person | closed | chereseeriepa |
| 2020-12-09 | !320 | Fixes | merged | chereseeriepa |
| 2020-12-09 | !319 | Archive bug fixes | merged | chereseeriepa |
| 2020-12-09 | !318 | Approve registrations | merged | Tairea |
| 2020-12-09 | !317 | Auto mentions bug | merged | Tairea |
| 2020-12-08 | !316 | update csv import to allow all authors + set recps to currentTribe | merged | chereseeriepa |
| 2020-12-08 | !315 | Auto mentions bug | merged | chereseeriepa |
| 2020-12-07 | !314 | fix linting bugs to get pataka running | merged | mixmix |
| 2020-12-05 | !313 | Draft: upside down tree | closed | chereseeriepa |
| 2020-12-02 | !311 | More tooltips | merged | Tairea |
| 2020-12-02 | !309 | Bug fixes | merged | chereseeriepa |
| 2020-11-30 | !307 | Story authors | merged | chereseeriepa |
| 2020-11-29 | !306 | update ssb-ahau | closed | chereseeriepa |
| 2020-11-25 | !304 | Unit tests | merged | BlakeAkapita |
| 2020-11-25 | !303 | Draft: UI Unit Tests | closed | BlakeAkapita |
| 2020-11-25 | !302 | change avatar blobs to be scaled to max 800px | merged | mixmix |
| 2020-11-23 | !301 | minor ui tweaks | merged | Tairea |
| 2020-11-19 | !300 | Modified StoryCard so that after a story is edited the fullStory dialog is shown | merged | BlakeAkapita |
| 2020-11-18 | !299 | move all mobile computed properties to mixin | closed | chereseeriepa |
| 2020-11-17 | !298 | Updated README.md to give instructions to troubleshoot vue-cli-service not being recognised | merged | BlakeAkapita |
| 2020-11-13 | !296 | router refactor | merged | chereseeriepa |
| 2020-11-12 | !295 | Draft: Router refactor | closed | chereseeriepa |
| 2020-11-12 | !294 | update-modules | merged | Tairea |
| 2020-11-11 | !293 | Update get stories | merged | chereseeriepa |
| 2020-11-11 | !292 | small pataka fix done with mix | merged | Tairea |
| 2020-11-05 | !291 | Profile Authors | merged | chereseeriepa |
| 2020-10-27 | !290 | updated icons | merged | Tairea |
| 2020-10-22 | !289 | Ux fixes | merged | Tairea |
| 2020-10-20 | #24 | New Pataka connection not showing | closed | Tairea |
| 2020-10-05 | !288 | Story errors | merged | Tairea |
| 2020-10-05 | !287 | Draft: Connections | closed | Tairea |
| 2020-10-04 | !286 | fixed BigAddButton errors | merged | Tairea |
| 2020-09-30 | !284 | Connections | merged | Tairea |
| 2020-09-30 | !283 | moves router from router.js to a folder structure | merged | chereseeriepa |
| 2020-09-29 | !282 | update icons + icon script | merged | mixmix |
| 2020-09-23 | !281 | fix artefact upload with hack | merged | chereseeriepa |
| 2020-09-22 | !280 | updated tribes query, changed goProfile to use tribe profile | merged | chereseeriepa |
| 2020-09-21 | !279 | updated button and tribe default avatar | merged | Tairea |
| 2020-09-21 | !278 | Date picker fixes | merged | chereseeriepa |
| 2020-09-16 | !276 | WIP: Date picker issue | closed | chereseeriepa |
| 2020-09-12 | !274 | Resolve "Connect to pataka button click throwing error when empty" | merged | chereseeriepa |
| 2020-09-12 | #20 | Connect to pataka button click throwing error when empty | closed | chereseeriepa |
| 2020-09-10 | !273 | Resolve "Cant delete whakapapa record" | merged | chereseeriepa |
| 2020-09-10 | !272 | fix problem with mimeType failing avatarImage.set, temporary hackgit | merged | chereseeriepa |
| 2020-09-10 | !271 | updated profile font | merged | Tairea |
| 2020-09-10 | !270 | Update your private profiles | merged | chereseeriepa |
| 2020-09-08 | #19 | Cant add photos to profiles | closed | chereseeriepa |
| 2020-09-08 | #18 | Cant delete whakapapa record | closed | chereseeriepa |
| 2020-09-07 | !269 | Move folders to module | merged | chereseeriepa |
| 2020-09-07 | #16 | test if we are still sending duplicate community registration requests | closed | Tairea |
| 2020-09-07 | #14 | Unclear what relation that relationship Type is referring to | closed | Tairea |
| 2020-09-06 | !268 | Fixed login | merged | Tairea |
| 2020-09-06 | !267 | Fixed login | merged | Tairea |
| 2020-09-06 | !266 | Resolve "Fix Community default image in nav-back button and add text (back to {{profile}})" | merged | Tairea |
| 2020-09-06 | !265 | Resolve "Sidenav profile icon should change and be blue" | merged | Tairea |
| 2020-09-06 | !264 | Draft: Resolve "I am not currently able to edit a record" | closed | Tairea |
| 2020-09-05 | !263 | show-members | merged | Tairea |
| 2020-09-05 | !262 | edit records fix | merged | Tairea |
| 2020-09-05 | !261 | Mobile notification panel | merged | Tairea |
| 2020-09-03 | !260 | fix offline config | merged | mixmix |
| 2020-09-02 | #13 | I am not currently able to edit a record | closed | Tairea |
| 2020-09-02 | #12 | EditRecords is not showing all of the record mentions | closed | Tairea |
| 2020-09-02 | #11 | Sidenav profile icon should change and be blue | closed | Tairea |
| 2020-09-02 | #10 | Fix Community default image in nav-back button and add text (back to {{profile}}) | closed | Tairea |
| 2020-09-02 | !259 | updated avatar | merged | Tairea |
| 2020-09-02 | !258 | fix permission so can add child/ parent to tree | merged | mixmix |
| 2020-09-02 | !257 | Fix bug on access change | merged | chereseeriepa |
| 2020-09-01 | !256 | extract env add nice helpers, fix pataka production start | merged | mixmix |
| 2020-09-01 | #7 | Landing page after login is empty | closed | mixmix |
| 2020-09-01 | #6 | Bug - cannot add children to profiles owned by others | closed | mixmix |
| 2020-08-31 | !255 | add version number to UI | merged | mixmix |
| 2020-08-31 | !254 | WIP: Add new authors listener | closed | chereseeriepa |
| 2020-08-31 | !252 | bug/can_edit | merged | mixmix |
| 2020-08-29 | !251 | Fix errors | merged | Tairea |
| 2020-08-28 | !250 | Upgrade sodium | merged | mixmix |
| 2020-08-28 | !248 | Fix reg errors | merged | Tairea |
| 2020-08-27 | !247 | Reg ui fixes | merged | Tairea |
| 2020-08-27 | !246 | less replication | merged | mixmix |
| 2020-08-26 | !245 | Pataka graphql ready before launch! | closed | mixmix |
| 2020-08-26 | !244 | Registration notifications | merged | luandro |
| 2020-08-24 | !243 | Access on records | merged | chereseeriepa |
| 2020-08-20 | !242 | Initial startup bug | merged | mixmix |
| 2020-08-20 | !241 | Dialog layout update | merged | chereseeriepa |
| 2020-08-19 | !240 | Lan conn | merged | mixmix |
| 2020-08-17 | !239 | fix bug in electron-builder.config.js | merged | chereseeriepa |
| 2020-08-07 | !237 | get pataka invites in working state | merged | mixmix |
| 2020-08-03 | !235 | Csv improvements | merged | chereseeriepa |
| 2020-07-31 | !233 | add kaitiaki to Profile, updated AvatarGroup | merged | chereseeriepa |
| 2020-07-31 | !232 | changed to use pull-steam | closed | chereseeriepa |
| 2020-07-31 | !230 | Fix recps fields | merged | chereseeriepa |
| 2020-07-31 | !229 | change to support new blobId from ssb-graphql-main blob | merged | chereseeriepa |
| 2020-07-28 | !228 | Recordform helpers | merged | Tairea |
| 2020-07-26 | !227 | updated whakapapa helpers and ssb-whakapapa dep | merged | chereseeriepa |
| 2020-07-24 | !226 | small change to add recps to story | merged | Tairea |
| 2020-07-18 | !222 | Draft: Reg notifications | closed | Tairea |
| 2020-07-18 | !221 | Timeline 2 | merged | iantairea |
| 2020-07-18 | !220 | Community whakapapa | merged | iantairea |
| 2020-07-18 | !219 | Update public facing profile | merged | chereseeriepa |
| 2020-07-17 | !218 | just creating communities | merged | mixmix |
| 2020-07-13 | !215 | Artefact type file | merged | chereseeriepa |
| 2020-07-13 | !214 | can add, view and delete story creators | merged | chereseeriepa |
| 2020-07-09 | !212 | Fixes vuex profile | merged | chereseeriepa |
| 2020-07-09 | !210 | Add community | merged | Tairea |
| 2020-07-06 | !209 | Story dates | merged | Tairea |
| 2020-07-02 | !208 | Profile mention links | merged | chereseeriepa |
| 2020-07-02 | !207 | fixed scrolling issue to take you back to your previous scroll position when leaving archive | merged | Tairea |
| 2020-07-02 | !206 | Encrypted file upload | merged | chereseeriepa |
| 2020-06-30 | !204 | Add community invites | merged | luandro |
| 2020-06-23 | !201 | Archiving graphql | merged | chereseeriepa |
| 2020-06-22 | !200 | WIP: Pataka | closed | luandro |
| 2020-06-16 | !197 | add story + artefact to server | merged | chereseeriepa |
| 2020-06-15 | !196 | Graphql date update | merged | chereseeriepa |
| 2020-06-15 | !195 | WIP: Private groups/upgrades | closed | mixmix |
| 2020-05-22 | !192 | Artefact upload | merged | chereseeriepa |
| 2020-05-20 | !191 | Vuex profile 4 | merged | chereseeriepa |
| 2020-05-14 | !186 | Vuex profile 3 - StoryCard on Archive Page | merged | chereseeriepa |
| 2020-05-11 | !183 | Profile contact redo | merged | chereseeriepa |
| 2020-05-11 | !182 | fixed edit button and made responsive for mobile | merged | Tairea |
| 2020-05-11 | !181 | fixed avatrGroups | merged | Tairea |
| 2020-05-11 | !180 | Header photo | merged | Tairea |
| 2020-05-10 | !179 | added kaitiaki | merged | Tairea |
| 2020-05-10 | !178 | Vuex profile 2 - Collection scroll | merged | chereseeriepa |
| 2020-05-10 | !177 | Vuex profile 1 | merged | chereseeriepa |
| 2020-05-10 | !176 | Profile contact | closed | Tairea |
| 2020-05-06 | !174 | Family view | merged | Tairea |
| 2020-05-05 | !172 | WIP: Csv chunks | closed | mixmix |
| 2020-05-05 | !171 | CSV parsing refactor | merged | mixmix |
| 2020-04-28 | !170 | Refactor assitance | merged | Tairea |
| 2020-04-14 | !166 | Rename labels | merged | Tairea |
| 2020-04-14 | !164 | deceased and birthOrder now acceptable with csv upload | merged | Tairea |
| 2020-04-13 | !163 | Kayes suggestions | merged | Tairea |
| 2020-04-12 | !162 | updated mobile packages to latest | merged | luandro |
| 2020-04-09 | !161 | added relationshipType fields back in, fix bug that removed relationships | merged | chereseeriepa |
| 2020-04-08 | !159 | Add siblings | merged | chereseeriepa |
| 2020-04-07 | !158 | Whakapapa index view changes | merged | chereseeriepa |
| 2020-04-06 | !157 | Add new fields | merged | Tairea |
| 2020-04-02 | !155 | changes to whakapapa index | merged | iantairea |
| 2020-04-02 | !153 | added searchId color | merged | Tairea |
| 2020-03-29 | !150 | Change focus | merged | luandro |
| 2020-03-29 | !149 | fix: whakapapaView.ignoredProfiles returning null | closed | luandro |
| 2020-03-26 | !148 | Refactored ignore profiles | merged | soapdog |
| 2020-03-26 | !147 | zoom controls | merged | Tairea |
| 2020-03-23 | !146 | Whakapapa search bar | merged | chereseeriepa |
| 2020-03-23 | !143 | fix WhakapapaView header hiding content beneath it | closed | staltz |
| 2020-03-23 | !141 | refactor WhakapapaShow to remove duplicate field | merged | staltz |
| 2020-03-23 | !140 | Click to center | merged | iantairea |
| 2020-03-22 | !139 | Minor bug fixes | merged | Tairea |
| 2020-03-20 | !137 | WIP: Profile page update | closed | iantairea |
| 2020-03-20 | !136 | WIP: Archive page | closed | iantairea |
| 2020-03-10 | !135 | Bottom sheet menu instead of context menu on mobile | closed | luandro |
| 2020-03-08 | !134 | Windows installer changes | merged | Tairea |
| 2020-03-05 | !131 | WIP: Change focus and center | closed | Tairea |
| 2020-02-27 | !128 | Fix HTTP cleartext usage on Android 9+ | merged | staltz |
| 2020-02-26 | !126 | Ignored Profiles | closed | soapdog |
| 2020-02-25 | !124 | Fix stuck splashscreen | merged | staltz |
| 2020-02-20 | !122 | load descendants of selectedProfile | merged | chereseeriepa |
| 2020-02-20 | !121 | mobile: fix account creation going back to login | merged | staltz |
| 2020-02-20 | !119 | mobile: fix misalignment of PersonEdit avatar | merged | staltz |
| 2020-02-19 | !118 | Fix date hack | merged | chereseeriepa |
| 2020-02-19 | !117 | mobile: simplify release instructions | merged | staltz |
| 2020-02-19 | !116 | mobile: add script and instructions how to release Android app | merged | staltz |
| 2020-02-19 | !115 | WIP: Change focus of descendants | closed | luandro |
| 2020-02-19 | !114 | mobile: set app version from package.json | merged | staltz |
| 2020-02-18 | !112 | Fix mobile regression from search name | merged | luandro |
| 2020-02-18 | !111 | Fix mobile regression from search merge | closed | luandro |
| 2020-02-18 | !110 | Revert "Merge branch 'search-profile-by-name' into 'master'" | merged | luandro |
| 2020-02-18 | !109 | Update date displays | merged | chereseeriepa |
| 2020-02-17 | !108 | Better README | merged | luandro |
| 2020-02-17 | !107 | update nodejs-mobile-cordova to 0.3.5 | merged | staltz |
| 2020-02-14 | !106 | replace Framework7 splashscreen with Niho | merged | staltz |
| 2020-02-14 | !105 | hide mobile splashscreen as soon as possible | merged | staltz |
| 2020-02-14 | !103 | [[ desktop ]] bug: windows support. | merged | soapdog |
| 2020-02-13 | !102 | Mobile tweaks | merged | staltz |
| 2020-02-13 | !100 | Edit relationship type | merged | chereseeriepa |
| 2020-02-09 | !97 | WIP: isolating graphql and ssb servers | closed | luandro |
| 2020-02-08 | !96 | Merge responsive components | merged | luandro |
| 2020-02-07 | !94 | Merge UI | merged | luandro |
| 2020-02-06 | !93 | Merge cordova | merged | luandro |
| 2020-02-06 | !91 | Nonbiological link | closed | Tairea |
| 2020-02-06 | !90 | WIP: Edit relationship type | closed | Tairea |
| 2020-02-04 | !89 | [[ Windows ]] fix NPM scripts to be cross-platform | closed | soapdog |
| 2020-01-30 | !87 | Responsive avatar redo | merged | chereseeriepa |
| 2020-01-29 | !86 | Age fix | merged | chereseeriepa |
| 2020-01-28 | !84 | Responsive avatar | closed | chereseeriepa |
| 2020-01-27 | !83 | Click family | merged | mixmix |
| 2020-01-26 | !82 | Styling Suggestion (for Ben) | merged | mixmix |
| 2020-01-26 | !80 | Styling changes | merged | Tairea |
| 2020-01-25 | !79 | Graphql federation | merged | luandro |
| 2020-01-25 | !78 | Whakapapa title link and karakia | merged | Tairea |
| 2020-01-24 | !77 | Feeback btn | merged | Tairea |
| 2020-01-24 | !76 | View edit dialog mods | merged | mixmix |
| 2020-01-23 | !75 | Storybook: add action listeners | closed | mixmix |
| 2020-01-23 | !74 | WIP: Prune installers | merged | mixmix |
| 2020-01-23 | !72 | Initial profile | merged | mixmix |
| 2020-01-21 | !70 | turn off ssb-lan legacy mode | merged | staltz |
| 2020-01-20 | !69 | New node form mods | merged | chereseeriepa |
| 2020-01-19 | !68 | fixes for the edit pages | merged | luandro |
| 2020-01-17 | !67 | update ssb-lan to 0.2.0, more private without legacy | merged | staltz |
| 2020-01-16 | !66 | Whakapapa image from branch | merged | iantairea |
| 2020-01-15 | !65 | Default avatars updated | merged | chereseeriepa |
| 2020-01-10 | !61 | graphql-refactor (TWEAKS) | merged | mixmix |
| 2020-01-08 | !59 | WIP: New whakapapa changes | closed | mixmix |
| 2020-01-08 | !58 | WIP: New whakapapa changes | closed | iantairea |
| 2020-01-08 | !57 | Disable things | merged | Tairea |
| 2020-01-07 | !56 | WIP: Whakapapa release | closed | mixmix |
| 2019-12-21 | !55 | WIP: Refactor graphql whakakaviews | merged | luandro |
| 2019-12-18 | !53 | Graphql refactor | merged | luandro |
| 2019-12-18 | !52 | Whakapapa edit/delete ui | closed | iantairea |
| 2019-12-12 | !51 | explore different node seperation tweaks | merged | mixmix |
| 2019-12-12 | !50 | Replace photo picker | merged | luandro |
| 2019-12-08 | !47 | Partner labels | merged | chereseeriepa |
| 2019-12-08 | !46 | added custom backgrounds | merged | iantairea |
| 2019-12-06 | !45 | mess with no-right-click | merged | mixmix |
| 2019-12-06 | !44 | Installers | merged | mixmix |
| 2019-12-05 | !42 | Node delete | merged | mixmix |
| 2019-12-05 | !41 | Node delete dialog | merged | mixmix |
| 2019-12-04 | !39 | No right click | merged | luandro |
| 2019-12-03 | !37 | private whakapapa | merged | mixmix |
| 2019-12-02 | !36 | Whakapapa views new profile | merged | mixmix |
| 2019-12-02 | !35 | Whakapapa views | merged | mixmix |
| 2019-12-02 | !34 | Update focus | merged | mixmix |
| 2019-12-02 | !31 | make node collapse show ... (ellipsis) | merged | mixmix |
| 2019-11-29 | !30 | Node collapse | merged | chereseeriepa |
| 2019-11-28 | !29 | Fix profile buttons | merged | mixmix |
| 2019-11-28 | !28 | Tree manipulation | merged | chereseeriepa |
| 2019-11-25 | !26 | Node names | merged | chereseeriepa |
| 2019-11-22 | !25 | Add child tweaks | merged | mixmix |
| 2019-11-21 | !24 | WIP: get full Whakapapa for a person | closed | luandro |
| 2019-11-19 | !22 | ssb-whakapapa | merged | luandro |
| 2019-11-15 | !19 | WIP: Dependency cleanup | closed | luandro |
| 2019-11-15 | !18 | Styling fixes | merged | luandro |
| 2019-11-13 | !15 | less noisy logs! | merged | mixmix |
| 2019-11-13 | !14 | WIP: Style fixes; Better image picker; alt names; offline-first icons | closed | luandro |
| 2019-10-28 | #1 | README.md: what does this project do after all? | closed | uniporn |
| 2019-10-27 | !12 | Upgrade er | merged | mixmix |
| 2019-10-27 | !11 | Login screen | merged | mixmix |
| 2019-10-25 | !10 | File upload | merged | luandro |
| 2019-10-25 | !9 | Add community | merged | mixmix |
| 2019-10-25 | !8 | Icons | merged | mixmix |
| 2019-10-24 | !7 | Replication | merged | mixmix |
| 2019-10-22 | !6 | ssb-profile-2 (mix's messy modifications of ssb-profile) | merged | mixmix |
| 2019-10-22 | !5 | Ssb profile | merged | luandro |
| 2019-10-22 | !4 | Secret stack ahoy | merged | mixmix |
| 2019-10-21 | !3 | ui: added Communities page | merged | mixmix |
| 2019-10-21 | !2 | add caps.shs + appName: ssb-ahau | merged | mixmix |
| 2019-10-14 | !1 | Build setup | merged | mixmix |
