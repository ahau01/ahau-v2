/**
 * Capability negotiation.
 *
 * The contract must not flatten to the intersection of what every backend can
 * do. Holochain enforces validation rules and capability grants in the
 * conductor; nostr has no native access control and treats deletion as a
 * request. A contract expressing only what both support would quietly discard
 * the permission model Āhau depends on.
 *
 * So backends declare what they cannot do, and callers ask before relying on
 * it. Scope is deliberately narrow: these are the five cases the Milestone 1
 * triage actually evidenced, plus retraction propagation from the deletion
 * decision. Nothing here is generalised beyond what a real accessor forced.
 */

/**
 * How seriously a backend takes a rule.
 *
 * The middle case is the one that matters and the one a boolean would lose.
 * On nostr you *can* publish an approval or a membership record — nothing
 * stops you — but equally nothing stops anyone else publishing a fraudulent
 * one, because no relay validates it. That is not the same as the capability
 * being missing, and it is not the same as it being enforced.
 *
 * For whakapapa the distinction is not academic. Advisory permissions on
 * tribal records mean the sovereignty guarantee is social rather than
 * technical, and an application must be able to tell a community which one it
 * is getting rather than presenting both as a locked padlock.
 */
export type EnforcementLevel =
  /** The backend validates the rule and refuses writes that break it. */
  | 'enforced'
  /** The backend records the intent but cannot prevent violations. */
  | 'advisory'
  /** The backend cannot express the rule at all. */
  | 'unsupported'

export interface Capabilities {
  /**
   * Whether a retraction reaches parties other than this node, or only stops
   * this backend returning the record. See docs/contract-decisions.md §1.
   */
  readonly retractionPropagates: boolean

  /**
   * Whether an operation that writes several records commits them together.
   * False means partial completion is observable — a group left half-updated
   * if a client stops between writes. See §3.
   */
  readonly atomicMultiWrite: boolean

  /**
   * Deepest graph walk the backend will serve; null means unbounded.
   * An adapter that cannot go deep declares its limit here rather than
   * truncating silently or hanging. See §4.
   */
  readonly maxTraversalDepth: number | null

  /**
   * Whether a reviewer accepting only some proposed fields is enforced.
   * The finest-grained permission in the application: a kaitiaki approving
   * part of a proposed change and refusing the rest.
   */
  readonly fieldLevelApproval: EnforcementLevel

  /**
   * Whether group membership and administrative rights are enforced.
   * Governs admitting applicants and granting administration.
   */
  readonly membershipEnforcement: EnforcementLevel

  /**
   * Whether the backend can search people by name.
   * Holochain needs an explicit index or anchor to serve this; nostr has no
   * server-side text search, so an adapter must either build an index or
   * decline.
   */
  readonly nameSearch: boolean
}

/**
 * Result of an operation a backend may decline at call time.
 *
 * Declining is a normal outcome, not an error, so it is returned rather than
 * thrown — a caller must be able to branch on it without writing a catch block
 * around ordinary control flow.
 */
export type Supported<T> =
  | { readonly supported: true; readonly value: T }
  | {
      readonly supported: false
      /** Which declared capability explains the refusal. */
      readonly capability: keyof Capabilities
      /** Adapter-supplied explanation, safe to show a developer. */
      readonly detail: string
    }

export const supported = <T>(value: T): Supported<T> => ({ supported: true, value })

export const unsupported = <T>(
  capability: keyof Capabilities,
  detail: string
): Supported<T> => ({ supported: false, capability, detail })

/**
 * True when a rule is technically guaranteed rather than merely recorded.
 *
 * Provided so calling code states its intent rather than comparing strings,
 * and so the advisory case is never silently treated as enforcement.
 */
export const isEnforced = (level: EnforcementLevel): boolean => level === 'enforced'
