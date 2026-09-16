/**
 * Āhau v2 data-access contract.
 *
 * The contract defines what any backend must provide, independent of protocol.
 * It is derived from the 68 accessors kept during the Milestone 1 triage; see
 * `plans/data-access-triage.json` in the `ahau` repository for the decision and
 * stated reason behind every one of them.
 *
 * Nothing implements this yet. That is deliberate: the contract is written
 * before any adapter so it describes what the application needs rather than
 * what one protocol happens to offer.
 */

/** Placeholder until Task 3 settles the cross-cutting semantics. */
export const CONTRACT_VERSION = '0.0.0-draft' as const
