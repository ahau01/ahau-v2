#!/usr/bin/env node
//
// check-contract-coverage.mjs
// Proves the contract covers the Milestone 1 triage, and nothing more.
//
// Checks four things, in both directions:
//   1. every accessor kept during triage is answered by an operation
//   2. every operation traces back to a kept accessor -- nothing invented
//   3. no dropped accessor reappears
//   4. every merge resolves to a target that is itself covered
//
// Operation names are read from the emitted .d.ts rather than from the source
// map alone, so an entry naming an operation that does not exist, or an
// operation with no recorded source, is caught rather than assumed correct.
//
// Usage (from the repo root, after compiling this folder separately — see
// reference/leg1-contract/README.md):
//   node reference/leg1-contract/scripts/check-contract-coverage.mjs        # report
//   node reference/leg1-contract/scripts/check-contract-coverage.mjs --ci   # exit 1 on any failure

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TRIAGE = join(ROOT, 'contract-source', 'data-access-triage.json')
const LEAKAGE = join(ROOT, 'contract-source', 'data-access-leakage-triage.json')
const DIST_OPS = join(ROOT, 'dist', 'contract', 'operations')

if (!existsSync(DIST_OPS)) {
  console.error('ERROR: dist/ is missing. Run `npm run build` first.')
  process.exit(1)
}

const { OPERATION_SOURCES } = await import(join(DIST_OPS, 'sources.js'))
const triage = JSON.parse(readFileSync(TRIAGE, 'utf8'))

const leakage = Object.entries(JSON.parse(readFileSync(LEAKAGE, 'utf8'))).filter(([k]) => k !== '_note')
const kept = [
  ...Object.entries(triage).filter(([, v]) => v.decision === 'keep').map(([k]) => k),
  ...leakage.filter(([, v]) => v.decision === 'keep').map(([k]) => k)
]
const dropped = [
  ...Object.entries(triage).filter(([, v]) => v.decision === 'drop').map(([k]) => k),
  ...leakage.filter(([, v]) => v.decision === 'drop').map(([k]) => k)
]
const merges = Object.entries(triage)
  .filter(([, v]) => v.decision.startsWith('merge into '))
  .map(([from, v]) => [from, v.decision.slice('merge into '.length).trim()])

// --- Operation names, read from the emitted declarations ---

/** Extract method names declared on each *Operations interface. */
function declaredOperations () {
  const found = new Map() // domain -> Set<method>
  for (const file of readdirSync(DIST_OPS)) {
    if (!file.endsWith('.d.ts') || file === 'index.d.ts' || file === 'sources.d.ts') continue
    const domain = file.replace(/\.d\.ts$/, '')
    const src = readFileSync(join(DIST_OPS, file), 'utf8')
    const block = src.match(/export interface \w*Operations \{([\s\S]*?)\n\}/)
    if (!block) continue
    const methods = [...block[1].matchAll(/^\s{4}(\w+)\(/gm)].map(m => m[1])
    if (methods.length) found.set(domain, new Set(methods))
  }
  return found
}

const declared = declaredOperations()
const declaredKeys = new Set(
  [...declared.entries()].flatMap(([domain, methods]) => [...methods].map(m => `${domain}.${m}`))
)
const mappedKeys = new Set(Object.keys(OPERATION_SOURCES))

// --- Checks ---

const failures = []
const note = (label, items) => {
  if (items.length) failures.push(`${label}:\n    ${items.join('\n    ')}`)
}

const covered = Object.values(OPERATION_SOURCES).flat()

note('kept accessors with no contract operation', kept.filter(k => !covered.includes(k)))
note('sources referenced that were not kept', covered.filter(c => !kept.includes(c)))
note('accessors answered by more than one operation', covered.filter((c, i) => covered.indexOf(c) !== i))
note('dropped accessors present in the contract', dropped.filter(d => covered.includes(d)))
note('merges whose target is not covered', merges.filter(([, t]) => !covered.includes(t)).map(([f, t]) => `${f} -> ${t}`))
note('operations declared but with no recorded source', [...declaredKeys].filter(k => !mappedKeys.has(k)))
note('sources recorded for operations that do not exist', [...mappedKeys].filter(k => !declaredKeys.has(k)))

// --- Report ---

const manyToOne = Object.entries(OPERATION_SOURCES).filter(([, v]) => v.length > 1)

console.log('Contract coverage')
console.log(`  operations declared:        ${declaredKeys.size}`)
console.log(`  operations with sources:    ${mappedKeys.size}`)
console.log(`  kept accessors covered:     ${covered.length} / ${kept.length}`)
console.log(`  dropped accessors excluded: ${dropped.length}`)
console.log(`  merges resolved to targets: ${merges.length}`)
if (manyToOne.length) {
  console.log('  collapsed:')
  for (const [op, src] of manyToOne) console.log(`    ${op} <- ${src.length} accessors`)
}

if (failures.length) {
  console.error('\nFAILED')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}

console.log('\nOK - contract matches the triage in both directions.')
if (!process.argv.includes('--ci')) process.exit(0)
