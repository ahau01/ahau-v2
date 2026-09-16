import type { WriteResult } from '../semantics.js'
import type { PeerId, Storehouse } from '../types/index.js'

/**
 * Pātaka: the storehouses that hold and replicate a group's records.
 *
 * Kept, unlike the SSB blob-pruning accessors, because a community running its
 * own storehouse is central to what Āhau means by data sovereignty. Addressed
 * by PeerId rather than by an identity: a storehouse is a place, not a person.
 * What replication means differs sharply per backend -- nostr's nearest
 * analogue is a relay you choose rather than block -- so an adapter may mean
 * something quite different by these.
 */
export interface StorehouseOperations {
  /** Source: `getPatakas`. */
  listStorehouses(): Promise<readonly Storehouse[]>

  /** Source: `blockPataka`. */
  blockStorehouse(id: PeerId): Promise<WriteResult>

  /** Source: `unblockPataka`. */
  unblockStorehouse(id: PeerId): Promise<WriteResult>
}
