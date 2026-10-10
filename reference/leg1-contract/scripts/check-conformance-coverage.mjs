#!/usr/bin/env node
//
// check-conformance-coverage.mjs
// Proves every contract operation has a conformance case, and that no case
// names an operation that does not exist.
//
// Reports behavioural and baseline coverage separately. A baseline case checks
// only that an operation is present; counting the two together would let
// presence stand in for behaviour and overstate what the suite proves.
//
// The set being counted is named in the output on purpose. Milestone 1's gate
// reported complete work while a sixth of its items were undecided, because it
// counted the easy set and never said which set that was.
//
// Usage (from the repo root, after compiling this folder separately — see
// reference/leg1-contract/README.md):
//   node reference/leg1-contract/scripts/check-conformance-coverage.mjs        # report
//   node reference/leg1-contract/scripts/check-conformance-coverage.mjs --ci   # exit 1 on any gap

import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

if (!existsSync(DIST)) {
  console.error('ERROR: dist/ is missing. Run `npm run build` first.')
  process.exit(1)
}

const { OPERATION_SOURCES } = await import(join(DIST, 'contract/operations/sources.js'))
const { allCases, behaviourallyCovered } = await import(join(DIST, 'conformance/suite.js'))

const operations = Object.keys(OPERATION_SOURCES)
const cased = new Set(allCases.map(c => c.operation))
const deep = behaviourallyCovered()

const failures = []
const uncased = operations.filter(op => !cased.has(op))
if (uncased.length) {
  failures.push(`operations with no conformance case:\n    ${uncased.join('\n    ')}`)
}
const invented = [...cased].filter(op => !operations.includes(op))
if (invented.length) {
  failures.push(`cases naming operations that do not exist:\n    ${invented.join('\n    ')}`)
}
const untraceable = allCases.filter(c => !c.purpose || c.purpose.length < 10)
if (untraceable.length) {
  failures.push(
    `cases with no recorded purpose:\n    ${untraceable.map(c => c.id).join('\n    ')}`
  )
}

console.log('Conformance coverage')
console.log(`  counting:            contract operations in OPERATION_SOURCES`)
console.log(`  operations:          ${operations.length}`)
console.log(`  cases:               ${allCases.length}`)
console.log(`  with any case:       ${cased.size} / ${operations.length}`)
console.log(`  covered behaviourally: ${deep.size}`)
console.log(`  baseline only:       ${operations.length - deep.size}`)

if (failures.length) {
  console.error('\nFAILED')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log('\nOK - every operation has a case, and every case names a real operation.')
