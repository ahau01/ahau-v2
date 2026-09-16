import type { Supported } from '../capabilities.js'
import type { RecordId, TraversalRequest, WriteResult } from '../semantics.js'
import type { Story, StoryInput } from '../types/index.js'

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
  saveStory(id: RecordId | null, story: StoryInput): Promise<WriteResult>

  /** Source: `deleteStory`, another save carrying a tombstone. */
  retractStory(id: RecordId, reason: string | null): Promise<WriteResult>
}


