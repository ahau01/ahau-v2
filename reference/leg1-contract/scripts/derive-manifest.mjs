#!/usr/bin/env node
//
// derive-manifest.mjs
// Derives the contract's operation manifest from the Milestone 1 triage.
//
// The manifest is generated, never hand-written. Transcribing 68 operations by
// hand is how a contract silently drifts from the requirements it claims to
// express, so the triage stays the single source of truth and this script is
// the only thing that reads it.
//
// Usage:
//   node scripts/derive-manifest.mjs           # write contract/manifest.json
//   node scripts/derive-manifest.mjs --check   # exit 1 if the written manifest is stale
//   node scripts/derive-manifest.mjs --print   # print a summary

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TRIAGE = join(ROOT, 'contract-source', 'data-access-triage.json')
const INVENTORY = join(ROOT, 'contract-source', 'data-access-inventory.json')
const OUT = join(ROOT, 'contract', 'manifest.json')

const triage = JSON.parse(readFileSync(TRIAGE, 'utf8'))
const inventory = JSON.parse(readFileSync(INVENTORY, 'utf8'))
const byName = new Map(inventory.accessors.map(a => [a.accessor, a]))

const kept = []
const merged = []
const dropped = []

for (const [name, decision] of Object.entries(triage)) {
  const d = decision.decision
  if (d === 'keep') kept.push(name)
  else if (d === 'drop') dropped.push(name)
  else if (d.startsWith('merge into ')) merged.push([name, d.slice('merge into '.length).trim()])
  else throw new Error(`unrecognised decision for ${name}: ${d}`)
}

// Every merge must resolve to an accessor that is itself kept, or the operation
// it folds into does not exist and the requirement is silently lost.
for (const [from, target] of merged) {
  if (!kept.includes(target)) {
    throw new Error(`${from} merges into ${target}, which is not kept`)
  }
}

const operations = kept.map(name => {
  const a = byName.get(name)
  if (!a) throw new Error(`kept accessor ${name} is absent from the inventory`)
  return {
    name,
    domain: a.domain,
    kind: a.operationKey === 'query' ? 'read' : 'write',
    purpose: triage[name].purpose,
    sourceAccessor: name,
    absorbs: merged.filter(([, t]) => t === name).map(([f]) => f),
    variables: a.variables,
    ssbFlags: a.ssbFlags,
    flagsViaFragments: a.flagsViaFragments,
    callSites: a.usageCount
  }
}).sort((x, y) => x.domain.localeCompare(y.domain) || x.name.localeCompare(y.name))

const manifest = {
  derivedFrom: 'contract-source/data-access-triage.json',
  generatedBy: 'scripts/derive-manifest.mjs',
  totals: {
    operations: operations.length,
    reads: operations.filter(o => o.kind === 'read').length,
    writes: operations.filter(o => o.kind === 'write').length,
    absorbed: merged.length,
    dropped: dropped.length,
    domains: new Set(operations.map(o => o.domain)).size
  },
  dropped: dropped.sort(),
  operations
}

const serialised = JSON.stringify(manifest, null, 2) + '\n'
const args = process.argv.slice(2)

if (args.includes('--check')) {
  if (!existsSync(OUT)) {
    console.error('ERROR: manifest has never been generated. Run without --check.')
    process.exit(1)
  }
  if (readFileSync(OUT, 'utf8') !== serialised) {
    console.error('ERROR: contract/manifest.json is stale. Regenerate it.')
    process.exit(1)
  }
  console.log(`manifest up to date (${manifest.totals.operations} operations)`)
} else if (args.includes('--print')) {
  console.log(JSON.stringify(manifest.totals, null, 2))
  console.log('dropped:', manifest.dropped.join(', '))
} else {
  writeFileSync(OUT, serialised)
  console.log(`wrote ${manifest.totals.operations} operations to contract/manifest.json`)
  console.log(`  ${manifest.totals.reads} reads, ${manifest.totals.writes} writes, ${manifest.totals.domains} domains`)
  console.log(`  ${manifest.totals.absorbed} absorbed by merge, ${manifest.totals.dropped} dropped`)
}
