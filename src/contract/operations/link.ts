import type { RecordId, WriteResult } from '../semantics.js'
import type { LinkInput, WhakapapaLink } from '../types/index.js'

/** Links: the edges of the whakapapa graph. */
export interface LinkOperations {
  /**
   * Record a relationship between two people.
   * Source: `saveLink`. The fundamental write of the application.
   */
  saveLink(id: RecordId | null, link: LinkInput): Promise<WriteResult>

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

