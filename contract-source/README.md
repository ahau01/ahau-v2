# Contract source

`data-access-triage.json` is a vendored snapshot of the Milestone 1 triage from
the `ahau` repository (`plans/data-access-triage.json`). It records, for each of
the 77 accessors the existing frontend uses, a purpose, a decision
(keep / merge / drop) and the reasoning behind it.

It is vendored rather than read across repositories so this repo is
self-contained: the manifest derivation and the coverage gate both run from a
fresh clone with no sibling checkout.

Refresh it with `npm run refresh:source` when the triage changes in `ahau`.
Do not hand-edit it here — `ahau` is the source of truth.
