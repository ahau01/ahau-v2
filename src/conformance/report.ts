/**
 * What a conformance run reports.
 *
 * Three outcomes, not two. A backend declining a capability it never claimed
 * is behaving correctly -- the contract exists precisely so that is expressible
 * -- and recording it as a failure would push adapters towards claiming
 * capabilities they cannot honour.
 *
 * Claiming one and then not honouring it is a different thing, and fails. That
 * asymmetry is what stops the capability system being decoration.
 */

import type { Capabilities, DataAccess } from '../contract/index.js'

export type CaseOutcome =
  | { readonly status: 'pass' }
  | { readonly status: 'fail'; readonly reason: string }
  | {
      readonly status: 'declined'
      readonly capability: keyof Capabilities
      readonly detail: string
    }

export const pass = (): CaseOutcome => ({ status: 'pass' })
export const fail = (reason: string): CaseOutcome => ({ status: 'fail', reason })
export const declined = (
  capability: keyof Capabilities,
  detail: string
): CaseOutcome => ({ status: 'declined', capability, detail })

export interface ConformanceCase {
  /** Stable identifier, e.g. "person.getPerson/hides-retracted". */
  readonly id: string
  /** The contract operation this exercises, as OPERATION_SOURCES keys it. */
  readonly operation: string
  /** The source accessor the requirement came from. */
  readonly source: string
  /**
   * The purpose recorded during triage.
   *
   * Cases are derived from this rather than from observed fixture behaviour.
   * The same author wrote the fixture and this suite, so a case written by
   * watching the fixture would prove only that the fixture agrees with itself.
   */
  readonly purpose: string
  /** True when running this case writes. Adapters should run these against a scratch instance. */
  readonly mutates: boolean
  run(backend: DataAccess): Promise<CaseOutcome>
}

export interface CaseResult {
  readonly case: Pick<ConformanceCase, 'id' | 'operation' | 'source' | 'mutates'>
  readonly outcome: CaseOutcome
}

export interface ConformanceReport {
  readonly total: number
  readonly passed: number
  readonly failed: number
  readonly declinedCount: number
  readonly skipped: number
  readonly results: readonly CaseResult[]
  /** True only when nothing failed. Declines do not make a run unsuccessful. */
  readonly conformant: boolean
}

export function summarise (results: readonly CaseResult[], skipped: number): ConformanceReport {
  const failed = results.filter(r => r.outcome.status === 'fail').length
  return {
    total: results.length,
    passed: results.filter(r => r.outcome.status === 'pass').length,
    failed,
    declinedCount: results.filter(r => r.outcome.status === 'declined').length,
    skipped,
    results,
    conformant: failed === 0
  }
}

export function formatReport (report: ConformanceReport): string {
  const lines = [
    'Conformance report',
    `  cases run:   ${report.total}`,
    `  passed:      ${report.passed}`,
    `  declined:    ${report.declinedCount}`,
    `  failed:      ${report.failed}`,
    `  not run:     ${report.skipped} (mutating cases, run with includeMutating)`
  ]
  const failures = report.results.filter(r => r.outcome.status === 'fail')
  if (failures.length) {
    lines.push('', 'Failures:')
    for (const r of failures) {
      const reason = r.outcome.status === 'fail' ? r.outcome.reason : ''
      lines.push(`  ${r.case.id}`, `    ${reason}`)
    }
  }
  const declines = report.results.filter(r => r.outcome.status === 'declined')
  if (declines.length) {
    lines.push('', 'Declined (not failures -- capabilities this backend does not claim):')
    for (const r of declines) {
      const cap = r.outcome.status === 'declined' ? r.outcome.capability : ''
      lines.push(`  ${r.case.id} -- ${cap}`)
    }
  }
  lines.push('', report.conformant ? 'CONFORMANT' : 'NOT CONFORMANT')
  return lines.join('\n')
}
