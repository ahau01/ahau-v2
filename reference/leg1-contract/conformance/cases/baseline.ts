/**
 * A baseline case for every operation in the contract.
 *
 * Deliberately shallow, and labelled as such. A baseline case asserts the
 * operation is present on the backend and is callable -- it does not exercise
 * behaviour. Its purpose is to catch an adapter that simply omitted an
 * operation, which TypeScript prevents for a typed adapter but not for one
 * written in JavaScript or assembled at runtime.
 *
 * Baseline coverage must never be mistaken for behavioural coverage. The
 * report counts the two separately for that reason: an operation covered only
 * by a baseline case has been checked for existence and nothing more.
 */

import { OPERATION_SOURCES } from '../../contract/index.js'
import type { DataAccess } from '../../contract/index.js'
import type { ConformanceCase } from '../report.js'
import { fail, pass } from '../report.js'

const purposes: Readonly<Record<string, string>> = {}

export const baselineCases: readonly ConformanceCase[] = Object.entries(
  OPERATION_SOURCES
).map(([operation, sources]) => {
  const [domain, method] = operation.split('.') as [string, string]
  return {
    id: `${operation}/present`,
    operation,
    source: sources[0] ?? 'unknown',
    purpose:
      purposes[operation] ??
      'Baseline: the operation is present and callable. Existence only -- no behaviour is exercised.',
    mutates: false,
    async run (backend: DataAccess) {
      const group = (backend as unknown as Record<string, unknown>)[domain]
      if (group === undefined || group === null || typeof group !== 'object') {
        return fail(`the backend exposes no "${domain}" domain`)
      }
      const fn = (group as Record<string, unknown>)[method]
      if (typeof fn !== 'function') {
        return fail(`"${operation}" is missing or is not callable`)
      }
      return pass()
    }
  }
})
