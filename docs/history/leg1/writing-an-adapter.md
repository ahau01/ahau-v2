# Writing an adapter

> **No longer applies.** There are no swappable adapters after
> [ADR-0006](adr/0006-capability-driven-redesign-not-behaviour-replication.md). Kept as record.

How to connect a backend to Āhau v2, and how to know whether you have.

An adapter implements one interface, `DataAccess`, and declares what it cannot
guarantee. The conformance suite then tells you whether your backend satisfies
the contract — and distinguishes *declining* a capability from *failing* one.

## 1. Implement `DataAccess`

```ts
import type { DataAccess } from 'ahau-v2/contract'

export function createMyAdapter (/* your connection */): DataAccess {
  return {
    capabilities: { /* see below */ },
    person: { /* ... */ },
    // ... 14 domains in total
  }
}
```

Annotate the return type. The compiler then tells you what is missing, which is
faster and more reliable than discovering it from a failing suite.

Each operation's doc comment names the source accessor it came from and what it
is for. Where an operation's shape looks odd, that comment usually explains
why — most of them encode a decision recorded in `contract-decisions.md`.

## 2. Declare capabilities honestly

```ts
capabilities: {
  retractionPropagates: false,
  atomicMultiWrite: false,
  maxTraversalDepth: 2,
  fieldLevelApproval: 'advisory',
  membershipEnforcement: 'advisory',
  nameSearch: false
}
```

**Under-claiming is always safe. Over-claiming fails the suite.**

The three-level `EnforcementLevel` matters most:

| Level | Meaning |
|---|---|
| `enforced` | The backend validates the rule and refuses writes that break it |
| `advisory` | The backend records the intent but cannot prevent violations |
| `unsupported` | The backend cannot express the rule at all |

`advisory` is not a lesser form of `enforced` — it is a different promise. On
tribal records it is the difference between a kaitiaki's decision being binding
and it being a note in the margin. Declaring `enforced` is a claim the suite
checks against your actual behaviour.

## 3. Return refusals, do not throw them

An operation your backend cannot serve returns a value:

```ts
import { unsupported } from 'ahau-v2/contract'

async findPeopleByName (name, group) {
  return unsupported('nameSearch', 'relays provide no server-side text search')
}
```

Callers branch on `supported`. Throwing is reserved for something having gone
genuinely wrong, and the suite treats a thrown error as a failure.

## 4. Run the suite

```ts
import { runConformance, formatReport } from 'ahau-v2/conformance'

const report = await runConformance(createMyAdapter(), { includeMutating: true })
console.log(formatReport(report))
```

**`includeMutating` writes real records.** It is off by default for that
reason. Point it at a scratch instance, never at a community's data.

Use `only` to narrow while fixing something:

```ts
await runConformance(adapter, { only: 'semantics/traversal' })
```

## 5. Read the result

| Outcome | Meaning | Action |
|---|---|---|
| `pass` | The promise holds | none |
| `declined` | A capability you did not claim | none — this is correct behaviour |
| `fail` | A promise you did claim is not kept | fix the adapter, or lower the claim |

`conformant` is true when nothing **failed**. Declines do not count against you.

A weak backend declining a great deal is conformant. A strong-sounding backend
that declares `enforced` and behaves advisorily is not, and that asymmetry is
deliberate: without it, capability declarations would be decoration.

## What the suite does and does not prove

Coverage is reported in two parts, and they are not interchangeable:

- **Behavioural** — the operation's promises are exercised. Currently the four
  cross-cutting semantics and the documented cascades.
- **Baseline** — the operation is present and callable. Existence only.

Most operations currently have baseline coverage alone. Passing the suite means
your adapter has no *known* defect, not that it is correct. Depth grows as real
screens and real backends put pressure on the contract.

Two further limits worth knowing:

- The suite was written alongside an in-memory fixture by the same author.
  Cases are derived from purposes recorded during triage rather than from
  observed fixture behaviour, specifically to limit that bias — but it cannot
  be eliminated by intention alone.
- Nothing here has met a real protocol yet. `contract-friction.md` records where
  the contract already resisted implementation, and the protocol claims in
  `contract-decisions.md` are the likeliest thing to need correction once a real
  adapter exists. If something in the contract is wrong, that is a finding worth
  reporting, not a fault in your adapter.
