# Contract source

A vendored snapshot of the Milestone 1 review from the `ahau` repository:

- `data-access-triage.json` — for each of the 77 accessors the old frontend
  used, a purpose, a decision (keep / merge / drop) and the reasoning behind it
- `data-access-inventory.json` — the raw catalogue of those accessors
- `data-access-leakage-triage.json` — decisions on 6 inline GraphQL queries in
  components that bypassed the accessors

It is vendored rather than read across repositories so this repo is
self-contained: the manifest derivation and the coverage gate both run from a
fresh clone with no sibling checkout.

**Frozen snapshot**
([ADR-0006](../docs/adr/0006-capability-driven-redesign-not-behaviour-replication.md)).
The `ahau` repo it came from is superseded, so this copy is now the record.
Don't refresh or hand-edit it.
