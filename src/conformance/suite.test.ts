import test from 'node:test'
import assert from 'node:assert/strict'

import { createFixtureBackend } from '../fixtures/backend.js'
import { degraded, fullyEnforced } from '../fixtures/profiles.js'
import { resetIds } from '../fixtures/store.js'
import { runConformance, allCases, behaviourallyCovered } from './suite.js'
import { OPERATION_SOURCES } from '../contract/index.js'

const backend = (capabilities = fullyEnforced) => {
  resetIds()
  return createFixtureBackend({ capabilities })
}

test('an enforcing backend is conformant', async () => {
  const report = await runConformance(backend(fullyEnforced), { includeMutating: true })
  assert.equal(report.failed, 0, JSON.stringify(report.results.filter(r => r.outcome.status === 'fail'), null, 2))
  assert.ok(report.conformant)
})

test('a weak backend is conformant too - declining is not failing', async () => {
  const report = await runConformance(backend(degraded), { includeMutating: true })
  assert.equal(report.failed, 0, JSON.stringify(report.results.filter(r => r.outcome.status === 'fail'), null, 2))
  assert.ok(report.declinedCount > 0, 'a weak backend should decline something')
  assert.ok(report.conformant, 'declines must not make a backend non-conformant')
})

test('a backend claiming more than it does is NOT conformant', async () => {
  // The honesty check. Behaviour of the degraded backend, but declaring the
  // capabilities of the strong one. Nothing else in the suite matters as much:
  // if this passed, capability declarations would be decoration.
  // The fixture derives behaviour from its capabilities, so it cannot lie by
  // construction. Override the declaration only, leaving the weak behaviour in
  // place -- which is exactly the shape of a real adapter that overclaims.
  resetIds()
  const weak = createFixtureBackend({ capabilities: degraded })
  const dishonest = {
    ...weak,
    capabilities: { ...degraded, atomicMultiWrite: true, maxTraversalDepth: null }
  }
  const report = await runConformance(dishonest, { includeMutating: true })
  assert.ok(report.failed > 0, 'a dishonest capability claim must fail')
  assert.ok(!report.conformant)

  const reasons = report.results
    .filter(r => r.outcome.status === 'fail')
    .map(r => (r.outcome.status === 'fail' ? r.outcome.reason : ''))
  assert.ok(
    reasons.some(r => r.includes('declares') || r.includes('does not declare')),
    'the failure should name the mismatch between declaration and behaviour'
  )
})

test('a backend missing an operation fails the baseline', async () => {
  const complete = backend()
  const broken = { ...complete, storehouse: {} } as unknown as typeof complete
  const report = await runConformance(broken, { only: 'storehouse.' })
  assert.ok(report.failed > 0, 'a missing operation is caught')
})

test('mutating cases are not run unless asked for', async () => {
  const report = await runConformance(backend())
  assert.ok(report.skipped > 0, 'writes are held back by default')
  assert.ok(
    report.results.every(r => !r.case.mutates),
    'nothing that writes ran'
  )
})

test('every contract operation has at least one case', () => {
  const covered = new Set(allCases.map(c => c.operation))
  const missing = Object.keys(OPERATION_SOURCES).filter(op => !covered.has(op))
  assert.deepEqual(missing, [])
})

test('behavioural coverage is reported separately from baseline coverage', () => {
  const deep = behaviourallyCovered()
  const total = Object.keys(OPERATION_SOURCES).length
  // Honest accounting: most operations are covered by a presence check only,
  // and the suite must not let that pass for behavioural coverage.
  assert.ok(deep.size > 0, 'some operations are covered behaviourally')
  assert.ok(deep.size < total, 'and it is not yet all of them')
})
