import type { Supported } from '../capabilities.js'
import type { RecordId, TraversalRequest, WriteResult } from '../semantics.js'
import type { GroupId, WhakapapaLink, WhakapapaView, WhakapapaViewInput } from '../types/index.js'

/** Whakapapa views: saved lenses over the graph. The graph itself is links. */
export interface WhakapapaOperations {
  /** Source: `getWhakapapaView`. */
  getWhakapapaView(id: RecordId): Promise<WhakapapaView | null>

  /** Source: `getWhakapapaViews`. */
  listWhakapapaViews(group: GroupId | null): Promise<readonly WhakapapaView[]>

  /** Source: `saveWhakapapaView`. */
  saveWhakapapaView(id: RecordId | null, view: WhakapapaViewInput): Promise<WriteResult>

  /**
   * Walk down from a person, returning the links beneath them.
   * Source: `getDescendantLinks`. A walk rather than a filter: an adapter that
   * cannot traverse natively walks internally, so graph logic never moves into
   * the frontend. See docs/contract-decisions.md §4.
   */
  getDescendants(request: TraversalRequest): Promise<Supported<readonly WhakapapaLink[]>>

  /**
   * Walk around a person, returning their immediate or extended family links.
   * Source: `getFamilyLinks`, whose `extended` flag becomes traversal depth.
   */
  getFamily(request: TraversalRequest): Promise<Supported<readonly WhakapapaLink[]>>
}

