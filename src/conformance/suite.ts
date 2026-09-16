/**
 * The conformance suite.
 *
 * Takes any DataAccess and reports whether it satisfies the contract. Nothing
 * here imports the fixture: an adapter in another repository must be able to
 * run this against its own backend, which is the whole point.
 */

import type { DataAccess } from '../contract/index.js'
import { baselineCases } from './cases/baseline.js'
import { semanticsCases } from './cases/semantics.js'
import type { CaseResult, ConformanceCase, ConformanceReport } from './report.js'
import { fail, summarise } from './report.js'

export const allCases: readonly ConformanceCase[] = [
  ...baselineCases,
  ...semanticsCases
]

/** Operations exercised by something more than a presence check. */
export const behaviourallyCovered = (): ReadonlySet<string> =>
  new Set(semanticsCases.map(c => c.operation))

export interface RunOptions {
  /**
   * Run cases that write.
   *
   * Off by default. A conformance run mutates real records, so an adapter
   * author points this at a scratch instance deliberately rather than
   * discovering afterwards that it rewrote a community's whakapapa.
   */
  readonly includeMutating?: boolean
  /** Restrict to cases whose id starts with this, for narrowing a failure. */
  readonly only?: string
}

export async function runConformance (
  backend: DataAccess,
  options: RunOptions = {}
): Promise<ConformanceReport> {
  const selected = allCases.filter(c => !options.only || c.id.startsWith(options.only))
  const runnable = selected.filter(c => options.includeMutating === true || !c.mutates)
  const skipped = selected.length - runnable.length

  const results: CaseResult[] = []
  for (const testCase of runnable) {
    const descriptor = {
      id: testCase.id,
      operation: testCase.operation,
      source: testCase.source,
      mutates: testCase.mutates
    }
    try {
      results.push({ case: descriptor, outcome: await testCase.run(backend) })
    } catch (error) {
      // A thrown error is a failure: the contract returns refusals as values,
      // so throwing means something genuinely went wrong rather than being
      // declined.
      const reason = error instanceof Error ? error.message : String(error)
      results.push({ case: descriptor, outcome: fail(`threw: ${reason}`) })
    }
  }
  return summarise(results, skipped)
}
