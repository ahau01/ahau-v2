# Plan: Āhau v2 — Data-Access Inventory

**Source PRD**: `docs/prds/ahau-v2-repo-foundation.prd.md`
**Selected Milestone**: 1 — Data-access inventory
**Complexity**: Medium

## Summary

Catalogue and triage every data-access operation the existing Āhau frontend
performs, producing a machine-readable inventory plus a human triage tracker.
The work happens in this repository (the source of truth), not in `ahau-v2`,
and outputs no application code — its consumer is Milestone 2, which turns the
triaged inventory into the typed contract.

Grounding: 18 dedicated helper modules hold 103 of the 110 `gql` templates
and export 77 accessor functions in a consistent shape; only 7 templates leak
into components, `main.js` and a mixin. The inventory's unit is therefore the
**exported accessor**, not the raw GraphQL document.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Scanner script | `scripts/check-hardcoded-translations.mjs:1` | Header comment block stating purpose + usage; flags `--summary`, `--ci`, `--format json`, `--help` |
| Script imports | `scripts/check-hardcoded-translations.mjs:26` | Node ESM, `createRequire` to reach `ui/node_modules`, `UI_SRC` resolved from `import.meta.url` |
| Generated doc header | `plans/translation-hardcoded-tracker.md:1` | `**Generated:** <date> by \`<command>\`` plus a totals line |
| Tracker usability | `plans/translation-hardcoded-tracker.md:5` | "How to use this tracker" numbered steps, a mapping table, then categorised `- [ ]` checklists |
| Accessor shape being catalogued | `ui/src/store/modules/person/apollo-helpers.js:11` | `const NAME = gql\`...\`` followed by `export const name = (args) => ({ query, variables, fetchPolicy })` |
| Fragment composition | `ui/src/lib/person-helpers.mjs:101` | Exported fragments interpolated into operations via `${FRAGMENT}` |
| Test style | `ui/src/lib/person-helpers.test.mjs:1` | `import test from 'tape'`, one `test(name, t => …)` per behaviour, `t.deepEqual` with a message |

## Files to Change

| File | Action | Why |
|---|---|---|
| `scripts/inventory-data-access.mjs` | CREATE | Scanner producing the inventory; mirrors the translations scanner |
| `scripts/inventory-data-access.sh` | CREATE | Thin wrapper for consistency with `scripts/check-hardcoded-translations.sh` |
| `plans/data-access-inventory.md` | CREATE | Generated triage tracker — the milestone's human-facing deliverable |
| `plans/data-access-inventory.json` | CREATE | Machine-readable inventory; the input Milestone 2 consumes |
| `docs/prds/ahau-v2-repo-foundation.prd.md` | UPDATE | Milestone 1 row → `in-progress`, `Plan` cell → this plan |

No files under `ui/src` are modified. This milestone is read-only with respect
to the application.

## Tasks

### Task 1: Scanner skeleton and file discovery
- **Action**: Create `scripts/inventory-data-access.mjs` that discovers every file under `ui/src` containing a `gql` template, and classifies each as a data-layer module (`**/apollo-helpers.*`, `lib/*-helpers.mjs`, `**/credential-helpers.js`) or a leakage site (anything else).
- **Mirror**: `scripts/check-hardcoded-translations.mjs:26` for `UI_SRC` resolution and directory walking; its header/usage block for the flag contract.
- **Validate**: `node scripts/inventory-data-access.mjs --summary` reports 24 files — 18 data-layer, 6 leakage — and 110 `gql` templates.

### Task 2: Extract accessors and operations
- **Action**: For each data-layer module, extract every `export`ed accessor, the `gql` template it references, the operation kind (`query`/`mutation`/`subscription`/`fragment`), its declared variables, and its root field. Parse GraphQL with the `graphql` package already present in `ui/node_modules`; resolve `${FRAGMENT}` interpolation by name rather than evaluating the template.
- **Mirror**: `ui/src/store/modules/person/apollo-helpers.js:11` for the const-plus-exported-accessor shape; `ui/src/lib/person-helpers.mjs:101` for fragment interpolation.
- **Validate**: `node scripts/inventory-data-access.mjs --format json` emits one record per accessor; extracted accessors reconcile against the 77 exports that return a `query`/`mutation` descriptor. The 140 raw named exports in those files also include fragments, permitted-field constants and pure helpers, so that is the wrong denominator.

### Task 3: Flag SSB-coupled constructs
- **Action**: Annotate each operation with the SSB-specific constructs it depends on — `feedId`, `recps`, `authors`/`intervals`, `tombstone`, `blob`/`uri` image handling, and CRUT-shaped revision fields. Flags are evidence for triage, not a verdict.
- **Mirror**: `scripts/check-hardcoded-translations.mjs` `FILTER_CONFIG` — a declared, reviewable constant table rather than logic buried in the walker.
- **Validate**: Every flagged construct traces to a named field in a real operation; spot-check `store/modules/settings/apollo-helpers.js` (9 templates, heavy `recps`/`authors` usage) by hand.

### Task 4: Generate the triage tracker
- **Action**: Emit `plans/data-access-inventory.md` grouped by domain (the existing module names: collection, credentials, loading, pataka, person, profile, settings, story, submissions, subtribe, tribe, whakapapa, plus lib-level artefact, community, link, tribes-application), with one checkbox row per accessor carrying columns for triage decision (keep / merge / drop), reason, and SSB flags.
- **Mirror**: `plans/translation-hardcoded-tracker.md:1` header and totals; `:5` for the how-to-use block, mapping table, and categorised checklists.
- **Validate**: Tracker row count equals the JSON record count; every one of the 110 templates appears exactly once.

### Task 5: Human triage pass
- **Action**: Work the tracker, recording for each accessor whether it is kept, merged into another, or dropped — with a stated reason. This is the milestone's actual deliverable; the scanner only makes it tractable.
- **Mirror**: `plans/translation-hardcoded-tracker.md` categorised-checklist workflow — decisions recorded in the document, checked off as completed.
- **Validate**: `node scripts/inventory-data-access.mjs --ci` exits non-zero while any accessor lacks a triage decision, and zero once all are decided.

## Validation

```bash
node scripts/inventory-data-access.mjs --summary
```

```bash
node scripts/inventory-data-access.mjs --ci
```

```bash
npx standard --verbose scripts/inventory-data-access.mjs
```

Note: root `scripts/` is outside the `lint:js` globs in `package.json`, so the
new script is linted manually above, matching the existing untracked status of
`scripts/check-hardcoded-translations.mjs`. Changing the lint config is out of
scope for this milestone.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Building a scanner is over-engineering for a one-off catalogue of 77 accessors | Medium | The JSON output is Milestone 2's direct input and `--ci` detects drift while the old repo keeps shipping. If Task 1–2 exceed a day, abandon the script and hand-catalogue — the tracker is the deliverable, not the tool. |
| Static extraction misses accessors built dynamically or composed at call sites | Medium | Reconcile counts per file against `grep`; any file where extracted accessors ≠ exported functions is reviewed by hand rather than trusted. |
| Triage encodes SSB assumptions by accepting operations at face value | High | Task 3's flags force each SSB construct to be seen during Task 5. An accessor kept with flags unaddressed is a deferred decision, recorded as such. |
| Inventory mistakes the Apollo-shaped accessor surface for the domain contract, so Milestone 2 inherits query-API shape | High | Record each accessor's *user-facing purpose* alongside its mechanics. This is the PRD's open question on domain-shaped vs transport-shaped; the inventory should supply evidence for it, not pre-empt it. |
| The 6 leakage sites behave differently from the 18 helper modules and get under-analysed | Low | They are only 7 templates; analyse all of them by hand rather than relying on the scanner. |

## Acceptance

- [ ] All tasks complete
- [ ] Validation passes
- [ ] Patterns mirrored, not reinvented
- [ ] All 110 `gql` templates and 77 exported accessors appear exactly once in the inventory
- [ ] Every accessor carries a triage decision with a stated reason
- [ ] Every kept accessor records its user-facing purpose, not only its query shape
- [ ] No files under `ui/src` modified

---
*Status: AWAITING CONFIRMATION — no code written yet.*
