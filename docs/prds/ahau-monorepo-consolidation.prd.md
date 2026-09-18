# Āhau Monorepo Consolidation

*Related: [ADR-0001](../../docs/adr/0001-consolidate-plugin-ecosystem-into-monorepo.md) — architectural decision record for this consolidation.*

## Problem
Current developers and future maintainers onboarding onto Āhau face scattered issues, context, and MRs spread across 61 separately versioned repos, with no clear oversight or handover following a founder split. Weeks of effort — AI-assisted dependency mapping, back-and-forth with an unresponsive founder — were needed just to understand what needs doing, before any actual maintenance or feature work could begin.

## Evidence
- Weeks spent clawing back access to npm accounts, dev accounts, and permissions across repos
- Slow discovery process caused by scattered and dead code spread across 61 repos
- Confidence in the path forward only surfaced after significant investment in a dependency-mapping exercise (`ahau-arch-map`)
- Activity data from `ahau-arch-map` shows 55% of all recorded MRs concentrated in `ahau/ahau` alone, and 31% of the 61 repos have zero recorded activity — confirming most of the ecosystem is dormant/orphaned overhead rather than active work

## Users
- **Primary**: Current developers and future maintainers being onboarded to Āhau, who need to understand and maintain the codebase without the original team's institutional knowledge
- **Not for**: End users of the Āhau/Pataka apps (no user-facing change intended); teams maintaining repos not vital to core functionality (e.g. marketing site)

## Hypothesis
We believe **consolidating Āhau, Pataka, and their dependent plugins into a monorepo** will **make the project easier for developers to learn and maintain** for **current devs and future maintainers**.
We'll know we're right when the structural migration itself is complete and both apps still build and mostly test green from the monorepo (see Success Metrics), alongside a marked improvement in dev-team confidence and speed over time — the confidence/speed measurement method itself is still TBD, and is a longer-horizon signal than this PRD's own scope can confirm.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Structural migration complete: apps + plugins build and test from the monorepo | Yes | Milestones 1-4 (see below) — achieved |
| Dev confidence/speed improvement | TBD — needs validation via {before/after dev survey, or velocity signals like time-to-onboard / PRs merged per week} | TBD |

## Scope
**MVP** — Āhau desktop/mobile, Pataka, and their non-external plugins packaged into a single monorepo, retaining current functionality and build ability. Genuine upstream/external dependencies stay external, not vendored in.

**Out of scope**
- New features — this is a structural migration only, not a feature release
- Repos not vital to core Āhau functionality (e.g. marketing site) — deferred indefinitely
- Independent per-package versioning/publishing — intentionally superseded by the monorepo model
- CI/CD, GitHub Actions, or any other build-pipeline integration — this work is proof-of-concept, not a production cutover; validation is local (`npm test` per package) only, with no assumption that build automation follows next

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Core plumbing migrated | Foundational SSB plumbing available from the monorepo; apps still build against it | complete | [plan](../plans/ahau-monorepo-consolidation.plan.md) |
| 2 | Domain plugins migrated | Domain-level SSB plugins available from the monorepo; package-naming conflicts resolved | complete | [plan](../plans/ahau-monorepo-consolidation-domain-plugins.plan.md) |
| 3 | GraphQL layer migrated | GraphQL types/resolvers/clients available from the monorepo | complete | [plan](../plans/ahau-monorepo-consolidation-graphql-layer.plan.md) |
| 4 | Apps consolidated | Āhau and Pataka run as sibling apps building against monorepo packages | complete | [plan](../plans/ahau-monorepo-consolidation-apps.plan.md) |

## Open Questions
- [x] Will moving off npm-published names to workspace/local resolution introduce breaking changes or naming conflicts? — Mostly no across 33 migrated packages (Milestones 1-3), with one real exception found in Milestone 3: sharing one hoisted `node_modules` across all packages let a newer transitive `lru-cache` version reach 9 GraphQL-layer packages whose test runner (the unmaintained `esm` package) can't parse it. Confirmed migration-caused, not pre-existing. A pinning fix was attempted and reverted after it broke 3 other packages; documented as an unresolved finding rather than re-risked. See Milestone 3's plan Execution Notes.
- [ ] How will dev confidence/speed improvement actually be measured — survey, velocity metrics, or qualitative retro?
- [x] Final keep/rename/drop decision per package, including resolving the known `ssb-atala-prism` naming collision between two source repos — Resolved by omission: `ssb-atala-prism` (real, migrated) vs. `broken-atala-demo` (zero activity, not a real dependency, never migrated). No rename needed since only one of the two is ever kept.
- [x] **Milestone 3 esm/lru-cache issue** — Fixed without touching the shared dependency tree: root-caused to a single ES-module import line in a shared test helper (`test/test-bot.js`) plus 7 packages' stale `ahau-graphql-client: ^1.0.3` pin. Converted to CommonJS and bumped the pin to `^2.0.0`, scoped entirely to the 9 affected packages' own files. Result: 5/9 fully clean, 1/9 at 221/222 with the remaining failure identified as a genuine pre-existing bug (invalid sort comparator), 2/9 substantially improved with an undiagnosed tail issue, 1/9 still blocked by the established sandbox network limitation. See `docs/plans/fix-graphql-esm-lru-cache.plan.md`.
- [ ] **New (Milestone 4)**: `apps/ahau/desktop` declares `ssb-ahau: ^16.4.1` against the migrated `17.0.0` package, so it falls back to a nested registry copy (`16.5.1`) for its single most important dependency — desktop has no test suite, so a version bump can't be verified safe the way Milestone 3's devDependency bumps were. Needs a deliberate decision: bump and verify via build/manual testing, leave as-is (registry fallback works, just doesn't benefit from the "one PR changes plugin and consumer" goal for this one critical edge), or something else.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Naming/path conflicts from moving off npm-published names to workspace/local resolution | Medium | High — could break builds silently | Phased migration with build verification at each phase; explicit internal-vs-external dependency checklist |
| Accidentally vendoring genuine upstream/external dependencies | Low-Medium | Medium — reintroduces the coupling problem being solved | Explicit external-deps allowlist maintained during migration |
| Loss of per-package MR/issue history reduces traceability | Low | Low | Already archived separately (`ahau-arch-map` raw migration data) |

---
*Status: Milestones 1-4 complete — structural migration achieved. Milestone 5 ("Āhau 3.0 shipped from monorepo") was removed as an out-of-scope stretch goal, not a deliverable of this PRD. Dev confidence/speed improvement remains an open, longer-horizon signal to track separately.*
