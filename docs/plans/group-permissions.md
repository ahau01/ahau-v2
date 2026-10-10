# Group Permissions (Kaitiaki Role Management)

This is a draft problem statement and evidence for group permissions, the
feature next up after landing and shell (see `README.md`'s Status). None of
the Problem, Evidence, Users, Hypothesis, Success Metrics, Scope, Open
Questions or Risks below are approved requirements — `openspec/specs/` is
the only live spec, and this content becomes requirements only once
`/openspec-propose` adopts it into a change. The evidence below describes
the old SSB-based app. It is kept as the reason this feature matters, not
as a design to copy.

## Problem
Groups ("tribes") in Āhau have a single binary role — kaitiaki (admin) vs.
member — and in the old app it was enforced only in the UI. There is no way
to remove a kaitiaki or member from a group. A finer-grained, per-content-type
permission model was designed and partly built, but never wired up, so the UI
shows permissions that don't exist. Kaitiaki cannot safely delegate or revoke
access without engineering intervention, and the UI misleads them about what's
possible.

## Evidence (old SSB app)
- The community **Permissions** dialog renders a per-content-type matrix
  (whakapapa / collections / stories × "Kaitiaki only" / "All members") that is
  disabled behind a "coming soon" tooltip. Its values are hardcoded and never
  read from or saved to real group settings.
- The sub-group add/remove-kaitiaki and member-list UI is commented out; its
  handlers only log `TODO`.
- Where kaitiaki can be edited, the change only updates an in-memory list and
  never touches actual group membership.
- No code path anywhere removes a kaitiaki or member from a group.
- The app's own copy says so: *"Kaitiaki are tribal administrators... Please
  note you cannot remove kaitiaki yet."*

## Users
- **Primary**: Kaitiaki (group admins) who need to manage membership and roles
  within their group without engineering intervention.
- **Secondary**: Members subject to those permissions (e.g. submit-only vs.
  edit access to whakapapa records, collections, stories).
- **Not for**: Verified-credentials / DID issuance flows — tracked separately.

## Hypothesis
We believe **kaitiaki/member removal plus at least one enforced
per-content-type permission** will **let kaitiaki safely delegate and revoke
group access without engineering intervention** for **kaitiaki/group admins**.

We'll know we're right when a kaitiaki can remove another kaitiaki or member
from the UI and the removed agent can no longer write to the group, and when at
least one permission from the matrix (e.g. who can create whakapapa records) is
enforced by the backend rather than only hidden in the UI.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Kaitiaki/member removal is enforced | Yes | Holochain test against a real conductor: after removal, the removed agent's writes to the group are rejected by validation |
| One per-content-type permission is enforced | Yes | Holochain test: with whakapapa record creation set to "Kaitiaki only", a member's create is rejected by validation — not just hidden in the UI |
| No unfinished permission UI ships unlabelled | Yes | Code review: anything not wired to real enforcement is labelled "not implemented" |
| No protocol workarounds | Yes | Nothing above requires patching Holochain or relying on undocumented conductor behaviour. If it does, the slice fails regardless of how close it feels |

## Scope
**MVP** — pending the product decisions in Open Questions:
1. Kaitiaki/member removal.
2. One enforced per-content-type permission, starting with whakapapa record
   creation.

**Out of scope**
- Verified credentials / DID issuance and acceptance.
- Permission concepts beyond the existing matrix (e.g. custom roles), unless a
  stakeholder explicitly asks for them.
- Two-devices-offline-then-sync validation — deferred to the second,
  committed validation pass (see Open Questions).

## Open Questions
- [ ] Is the target model the per-content-type matrix (whakapapa / collections /
  stories × kaitiaki-only / all-members), or a simpler kaitiaki-vs-member
  toggle?
- [ ] Can a kaitiaki remove themselves? Is there "last kaitiaki" protection so
  a group can't be orphaned?
- [ ] The original design intent (GitLab MRs !536, !540, !541, !934) hasn't been
  recovered. Get it, or make an explicit stakeholder decision before
  Milestone 2.
- [ ] What happens to a removed member's **already-synced** data? Removal stops
  future writes; it doesn't make their copy disappear. Decide what the group
  expects, and say so plainly in the UI (see CLAUDE.md, Access control).
- [ ] What if two kaitiaki remove each other while both are offline? This is a
  sync conflict: it must not be settled by last-write-wins without a
  deliberate decision (CLAUDE.md rule 1). Deferred to the second validation
  pass, but the data model shouldn't rule out a good answer.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| No safeguard against removing the last kaitiaki | Medium | High — orphans a group with no admin | Explicit requirement in Milestone 1's plan |
| Original design intent unavailable | Low-Medium | Medium — rebuilding the wrong model | Recover the MRs or get a stakeholder decision before Milestone 2 |
| Membership and role stored separately drift apart | Medium | Medium — inconsistent state if only one is updated | Model removal as one action, covered by a test |
| A permission enforced only in the UI gets counted as a pass | Medium | High — the sovereignty guarantee becomes social, not technical | Success metrics require rejection at validation, tested against a real conductor |

---
*Status: Draft problem statement, not an approved spec. Awaiting the
product decisions in Open Questions before `/openspec-propose` turns this
into a change.*
