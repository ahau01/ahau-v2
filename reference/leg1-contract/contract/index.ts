/**
 * Āhau v2 data-access contract.
 *
 * The contract defines what any backend must provide, independent of protocol.
 * It is derived from the accessors kept during the Milestone 1 triage; see
 * `contract-source/` for the decision and stated reason behind every one.
 *
 * Frozen reference (ADR-0006): a record of what the SSB-era app's data layer
 * could do, used as a checklist. New Holochain code does not implement it.
 */

export * from './capabilities.js'
export * from './semantics.js'
export * from './types/index.js'
export * from './operations/index.js'

/** Contract revision. Bumped when a published shape changes. */
export const CONTRACT_VERSION = '0.0.0-draft' as const
