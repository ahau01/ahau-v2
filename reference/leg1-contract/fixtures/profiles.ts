import type { Capabilities } from '../contract/capabilities.js'

/**
 * Capability profiles the fixture can run under.
 *
 * The fixture reads its profile rather than hard-coding capability answers, so
 * the same call path can be exercised against a backend that guarantees
 * everything and one that guarantees very little. Without this, capability
 * negotiation is untestable until a real adapter exists in Leg 2 -- which is
 * precisely where discovering the negotiation design is wrong would be most
 * expensive.
 */

/**
 * A backend that can enforce everything.
 *
 * An in-process store genuinely can, which is worth remembering when reading
 * results: passing under this profile shows the contract is implementable, not
 * that it is portable.
 */
export const fullyEnforced: Capabilities = {
  retractionPropagates: true,
  atomicMultiWrite: true,
  maxTraversalDepth: null,
  fieldLevelApproval: 'enforced',
  membershipEnforcement: 'enforced',
  nameSearch: true
}

/**
 * A backend that guarantees little.
 *
 * Shaped after the weaknesses recorded during triage rather than invented:
 * permissions that are recorded but unenforceable, no server-side text search,
 * shallow traversal, independent writes, and retraction that reaches nobody
 * else. Roughly what a relay-based backend would have to declare.
 */
export const degraded: Capabilities = {
  retractionPropagates: false,
  atomicMultiWrite: false,
  maxTraversalDepth: 2,
  fieldLevelApproval: 'advisory',
  membershipEnforcement: 'advisory',
  nameSearch: false
}
