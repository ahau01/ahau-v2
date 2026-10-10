import type { RecordId, WriteResult } from '../semantics.js'
import type { Collection, CollectionInput } from '../types/index.js'

/**
 * Collections: curated groupings of stories.
 *
 * Includes `getCollection`, which lived in the story helpers in the source
 * repository while its three siblings lived in the collection module. The
 * triage recorded that split as inconsistent; this is where it is corrected.
 */
export interface CollectionOperations {
  /** Source: `getCollection`. */
  getCollection(id: RecordId): Promise<Collection | null>

  /** Source: `getAllCollections`. */
  listCollections(): Promise<readonly Collection[]>

  /** Source: `saveCollection`. */
  saveCollection(id: RecordId | null, collection: CollectionInput): Promise<WriteResult>

  /** Source: `deleteCollection`, another save carrying a tombstone. */
  retractCollection(id: RecordId, reason: string | null): Promise<WriteResult>

  /**
   * Add a story to a collection, or remove it.
   * Source: `saveCollectionStoryLink`. An edge between two application
   * records; unlike a whakapapa link it asserts curation, not kinship.
   */
  setCollectionStoryLink(
    collection: RecordId,
    story: RecordId,
    included: boolean
  ): Promise<WriteResult>
}

