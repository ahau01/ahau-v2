/**
 * Cross-cutting semantics for the Āhau v2 data-access contract.
 *
 * These four shapes govern many operations each, so they are settled before any
 * operation is written. The reasoning behind each is recorded in
 * docs/contract-decisions.md; this file is the shape, not the argument.
 */

import type { EnforcementLevel } from './capabilities.js'

/**
 * Opaque identifier for a stored record.
 *
 * Deliberately branded and deliberately opaque: an SSB message key, a Holochain
 * ActionHash and a nostr event id have nothing in common but the job they do.
 * Nothing outside an adapter may construct or parse one.
 */
export type RecordId = string & { readonly __brand: 'RecordId' }

/** Construct a RecordId. Adapters only -- never call this from application code. */
export const asRecordId = (raw: string): RecordId => raw as RecordId

/**
 * What a backend can say about a write it has accepted.
 *
 * Two states, not three. SSB writes a local log entry and Holochain commits to
 * the agent's source chain, both of which are readable back immediately, so
 * both report `committed`; onward propagation is the network's problem, not the
 * caller's. nostr is different in kind: an event is offered to several relays
 * which accept or refuse independently, so partial acceptance is a real outcome
 * the caller may need to act on.
 */
export type WriteAcknowledgement =
  | { readonly status: 'committed' }
  | {
      readonly status: 'partial'
      readonly accepted: number
      readonly attempted: number
      readonly failures: readonly WriteFailure[]
    }

export interface WriteFailure {
  /** Opaque label for the peer or relay that refused. Adapter-defined. */
  readonly target: string
  readonly reason: string
}

/**
 * The outcome of a write.
 *
 * Parameterised by the kind of identifier it returns. Most writes produce a
 * RecordId, but creating a group produces a GroupId -- and a result that could
 * only carry a RecordId left a caller unable to use what it had just created.
 */
export interface WriteResult<TId = RecordId> {
  readonly id: TId
  readonly acknowledgement: WriteAcknowledgement
}

/**
 * The outcome of a write that carries a permission rule.
 *
 * Granting administration, admitting a member and approving selected fields
 * all succeed on a backend that cannot enforce them -- the record is written,
 * the rule is simply not applied. A plain WriteResult cannot express that, so a
 * caller would have no way to tell a permission from a suggestion.
 *
 * The operation is not refused, so this is not Supported<T>. It succeeds, and
 * reports how strongly the rule behind it was applied.
 */
export interface PermissionWriteResult<TId = RecordId> extends WriteResult<TId> {
  readonly enforcement: EnforcementLevel
}

/**
 * The outcome of approving a proposal.
 *
 * Approval applies the proposed change; it does not merely resolve the
 * proposal. Saying so is the point of this type: without it, a backend that
 * discarded every approved change would be indistinguishable from one that
 * applied them.
 *
 * `applied` names the records the approval created or altered, and is empty
 * only when the proposal turned out to change nothing.
 */
export interface ApprovalResult {
  readonly submission: RecordId
  readonly acknowledgement: WriteAcknowledgement
  readonly applied: readonly RecordId[]
  /** How strongly any field restriction was applied. */
  readonly enforcement: EnforcementLevel
}

/**
 * Removal of a record.
 *
 * Named retraction rather than deletion because none of the candidate backends
 * erases anything. SSB appends a tombstone, Holochain writes a Delete action
 * while the original stays on the source chain, and nostr sends a deletion
 * request relays are free to ignore.
 *
 * The contract therefore promises exactly one thing: subsequent reads from this
 * backend will not return the record. It does not promise the data is gone, nor
 * that parties who already hold it will forget it. Whether the retraction
 * reaches other parties at all is declared by the `retractionPropagates`
 * capability.
 */
export type RetractionResult = WriteResult

/**
 * Outcome of an operation that writes more than one record.
 *
 * An Āhau group is a paired record: a discoverable public profile and a
 * members-only private one. Callers must never orchestrate that pairing -- it
 * is a single contract operation, and how many records it touches is the
 * adapter's business. This type exists only so a caller that cares can find out
 * whether the pair moved together.
 *
 * Holochain commits multiple entries in one zome call and reports `atomic`.
 * nostr publishes independent events and reports `independent`, where a crash
 * between them is observable.
 */
export type PairedWriteResult =
  | { readonly status: 'atomic'; readonly ids: readonly RecordId[] }
  | { readonly status: 'independent'; readonly parts: readonly PairedWritePart[] }

export interface PairedWritePart {
  /** Which half of the pair this describes, e.g. 'public' or 'private'. */
  readonly part: string
  readonly outcome:
    | { readonly ok: true; readonly id: RecordId }
    | { readonly ok: false; readonly reason: string }
}

/**
 * A request to walk the graph.
 *
 * Traversal stays a walk rather than becoming a filter. A filter-shaped
 * contract would move graph-walking into the frontend and change frontend code
 * per backend, which is precisely what this rebuild exists to avoid. A backend
 * that cannot traverse natively still exposes a walk; its adapter fetches and
 * walks internally.
 *
 * `depth` is null for the backend's own default. An adapter that cannot honour
 * the requested depth declares its limit through `maxTraversalDepth` rather
 * than silently truncating or hanging.
 */
export interface TraversalRequest {
  readonly from: RecordId
  readonly depth: number | null
}
