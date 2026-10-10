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

  /**
   * Accept an invitation to connect to a storehouse.
   *
   * Source: the inline acceptInvite mutation in NewPatakaDialog.vue. The
   * contract could block and unblock storehouses but nothing introduced one,
   * because this lives in a dialog rather than a helper module and so was
   * invisible to the accessor triage. Invitation is how trust is established
   * between a community and a storehouse, which makes it a sovereignty
   * operation rather than plumbing.
   */
  acceptInvite(inviteCode: string): Promise<WriteResult<PeerId>>

  /**
   * Which storehouses are connected right now.
   *
   * Source: the inline connectedPeers query in PatakaList.vue, polled every
   * ten seconds there. Distinct from listStorehouses, which reports what is
   * known rather than what is reachable. No candidate backend reports peer
   * connectivity the same way, and a request-response contract leaves
   * liveness to the caller.
   */
  listConnectedPeers(): Promise<readonly Storehouse[]>
}
