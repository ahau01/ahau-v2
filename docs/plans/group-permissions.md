# Group Permissions (Kaitiaki Role Management)

## Problem
Groups ("tribes") in Āhau only support a single binary role — kaitiaki (admin) vs. member — enforced ad hoc via a Vuex getter (`isKaitiaki`) scattered across a dozen components. Multiple past attempts at a finer-grained group-permissions model and proper kaitiaki-management UI were started and abandoned, leaving dead/stubbed UI and a real functional gap: there is no way anywhere in the codebase to remove a kaitiaki or member from a group. Kaitiaki (group admins) cannot safely delegate or revoke access without engineering intervention, and the UI actively misleads users about what's possible.

## Evidence
- `apps/ahau/ui/src/components/dialog/community/Permissions.vue` renders a disabled per-content-type permission matrix (whakapapa/collections/stories × "Kaitiaki only"/"All members") behind a "coming soon" tooltip. Its `data()` hardcodes default values that are never read from or written to real tribe/profile settings — no `$emit`, no Vuex action, nothing persisted. Appears to originate from GitLab MRs !536/!540 (2021).
- `SubGroup.vue`'s entire add/remove-kaitiaki and member-list UI (lines 18-64, 106-145) is commented out; the stub handlers (`deleteKaitiaki`, `addKaitiaki`, `addMember`, `deleteMember`) just `console.error('TODO: ...')`.
- `GroupsList.vue`'s kaitiaki add/remove only mutates a local in-memory `formData.authors` array — it never calls the `ssb-tribes` backend (`ssb.tribes.invite`/`ssb.tribes.exclude`) directly; persistence relies on a roundtrip through `ssb-profile`'s `authors` field, not actual group membership.
- A repo-wide search found **zero usages of `ssb.tribes.exclude`** — there is no code path anywhere that removes a kaitiaki or member from a group.
- `apps/ahau/ui/src/translations/en_NZ/groups.json` states outright: *"Kaitiaki are tribal administrators... Please note you cannot remove kaitiaki yet."*
- Related verified-credentials toggles (`issuesVerifiedCredentials`/`acceptsVerifiedCredentials`, GitLab MR !934) are wired into the tribe-settings UI but gated behind a beta-features switch and hardcoded to `false` in `TribeSettings.vue`, pending the separately unfinished `ssb-atala-prism` package (its own TODO.md lists unresolved kaitiaki-permission state-machine rules).
- `ssb-tribes`/`ssb-profile` package versions are split between newer (`packages/*`: `ssb-tribes ^4.0.0`, `ssb-profile ^7.0.x`) and older (`apps/ahau/desktop`, mobile, `apps/pataka`, `packages/ssb-pataka`: `ssb-tribes ^3.1.x`, `ssb-profile ^5.15.0/^6.0.1`) — new permission logic built on the group-membership API risks behaving inconsistently depending on which version resolves at runtime.
- Original design rationale is not currently available: GitLab MRs !536, !540, !541, !934 returned HTTP 403 (private instance, no local credentials) when investigated for this PRD.

## Users
- **Primary**: Kaitiaki (group/tribe admins) who need to manage membership and roles within their group without engineering intervention.
- **Secondary**: Members subject to those permissions (e.g. submit-only vs. edit access to whakapapa records, collections, stories).
- **Not for**: Verified-credentials/DID issuance flows — tracked separately, blocked on `ssb-atala-prism` completion, not part of this PRD's scope.

## Hypothesis
We believe **finishing kaitiaki/member removal and wiring at least one real, enforced per-content-type permission** will **let kaitiaki safely delegate and revoke group access without engineering intervention** for **kaitiaki/group admins**.
We'll know we're right when a kaitiaki can remove another kaitiaki or member from the UI with the change actually persisted via `ssb-tribes`, and when at least one permission from `Permissions.vue`'s matrix (e.g. who can create whakapapa records) is read from and enforced against a real, persisted setting rather than a hardcoded UI value.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Kaitiaki/member removal works end-to-end | Yes | Manual QA: remove a kaitiaki via UI, confirm `ssb.tribes.exclude` (or equivalent) fires and group membership updates for all members |
| At least one real per-content-type permission enforced | Yes | Manual QA + test: a non-kaitiaki member is blocked from a restricted action when that permission is set to "Kaitiaki only" |
| No stubbed permission UI ships without either being finished or explicitly labeled "not implemented" | Yes | Code review confirms no silent hardcoded/disabled UI remains unlabeled |

## Scope
**MVP** — TBD pending the product decision in Open Questions. Leading candidates, in likely priority order:
1. Kaitiaki/member removal (`SubGroup.vue` + backend `ssb.tribes.exclude` wiring) — the most concrete, already-acknowledged gap.
2. Wiring `Permissions.vue` to one real, persisted per-content-type permission (starting with whakapapa, since kaitiaki-only access is already partially supported there per `AccessButton.vue`'s TODOs).

**Out of scope**
- Verified-credentials/DID issuance and acceptance flows — blocked on the separately unfinished `ssb-atala-prism` package.
- Resolving `ssb-tribes`/`ssb-profile` version drift across apps/packages as a deliverable — tracked as a prerequisite risk; only in scope here if it directly blocks implementation.
- New permission concepts beyond the existing `Permissions.vue` matrix (e.g. custom roles) unless a stakeholder explicitly asks for them.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Kaitiaki/member removal | Kaitiaki can remove another kaitiaki or member from a group via the UI, persisted through `ssb-tribes` | pending | |
| 2 | One enforced per-content permission | At least one `Permissions.vue` matrix setting (e.g. whakapapa record creation) is read from and enforced against real, persisted tribe settings | pending | |

## Open Questions
- [ ] Is the target model the `Permissions.vue` per-content-type matrix (whakapapa/collections/stories × kaitiaki-only/all-members), or a simpler kaitiaki-vs-member toggle? Original MRs (!536/!540) may hold the answer but are currently inaccessible.
- [ ] What's the intended UX for removal — can a kaitiaki remove themselves? Is there a "last kaitiaki" protection so a group can't be orphaned?
- [ ] Can we get GitLab access (or MR exports) for !536, !540, !541, !934 to confirm original design intent before building?
- [ ] Should the `ssb-tribes`/`ssb-profile` version drift between apps and packages be resolved before this work starts, or is it safe to build against the newer `packages/*` versions only?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Building on drifted `ssb-tribes`/`ssb-profile` versions | Medium | High — inconsistent behavior across apps/mobile/pataka | Verify/resolve versions before backend work begins; test against whichever version each target app actually resolves |
| No safeguard against removing the last kaitiaki of a group | Medium | High — could orphan a group with no admin | Make this an explicit requirement in the implementation plan for Milestone 1 |
| Original MR design intent unavailable | Low-Medium | Medium — risk of rebuilding the wrong model | Get GitLab access or an explicit stakeholder decision before Milestone 2 |
| Removal logic touches `ssb-profile` `authors` field as well as `ssb-tribes` membership (per `GroupsList.vue`'s current partial implementation) | Medium | Medium — inconsistent state if only one is updated | Design removal as a single atomic operation covering both, verified with a test |

---
*Status: Draft — no milestone started. Awaiting product decision on scope (see Open Questions) before running `/plan` against Milestone 1.*
