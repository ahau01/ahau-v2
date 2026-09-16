import type { RecordId, WriteResult } from '../semantics.js'
import type { Visibility, WhakapapaLink } from '../types/index.js'

/** Links: the edges of the whakapapa graph. */
export interface LinkOperations {
  /**
   * Record a relationship between two people.
   * Source: `saveLink`. The fundamental write of the application.
   */
  saveLink(link: LinkInput): Promise<WriteResult>

  /**
   * Find an existing link between two people, to avoid creating a duplicate.
   * Source: `whakapapaLink`.
   */
  findLink(
    parent: RecordId,
    child: RecordId,
    isPartner: boolean
  ): Promise<WhakapapaLink | null>
}

export interface LinkInput {
  readonly id: RecordId | null
  readonly parent: RecordId
  readonly child: RecordId
  readonly relationshipType: string
  readonly isPartner: boolean
  /**
   * Carried explicitly: a relationship can be more sensitive than either
   * person on its end, so it does not inherit their visibility.
   */
  readonly visibility: Visibility
}
