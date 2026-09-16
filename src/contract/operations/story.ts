import type { Supported } from '../capabilities.js'
import type { RecordId, TraversalRequest, WriteResult } from '../semantics.js'
import type { MediaRef, Story, Visibility } from '../types/index.js'

/** Stories: records of events, with their media and the people they mention. */
export interface StoryOperations {
  /** Source: `getStory`. */
  getStory(id: RecordId): Promise<Story | null>

  /** Source: `getAllStories`. */
  listStories(): Promise<readonly Story[]>

  /**
   * Find the stories mentioning a person.
   * Source: `getAllStoriesByMentions`. A walk, like the whakapapa traversals,
   * and the one operation where the capability ordering inverts: tag filtering
   * is native to nostr relays, while Holochain needs links maintained on write.
   */
  listStoriesMentioning(
    request: TraversalRequest
  ): Promise<Supported<readonly Story[]>>

  /** Source: `saveStory`. */
  saveStory(story: StoryInput): Promise<WriteResult>

  /** Source: `deleteStory`, another save carrying a tombstone. */
  retractStory(id: RecordId, reason: string | null): Promise<WriteResult>
}

export interface StoryInput {
  readonly id: RecordId | null
  readonly title: string | null
  readonly description: string | null
  readonly artefacts: readonly RecordId[]
  readonly mentions: readonly RecordId[]
  readonly visibility: Visibility
}

export interface ArtefactInput {
  readonly id: RecordId | null
  readonly media: MediaRef | null
  readonly description: string | null
  readonly visibility: Visibility
}
