import type { PairedWriteResult, RecordId, WriteResult } from '../semantics.js'
import type { Group, GroupId, IdentityId, MediaRef, Membership, Visibility } from '../types/index.js'

/**
 * Groups: iwi, hapū, whānau.
 *
 * Covers what the source repository split across the tribe and community
 * modules. A group is a paired record -- a discoverable public face and a
 * members-only private one -- and operations that touch both are single
 * operations here, so callers never orchestrate two writes.
 */
export interface GroupOperations {
  /** Source: `getTribe`. */
  getGroup(id: GroupId): Promise<Group | null>

  /** Source: `getTribes`. */
  listGroups(): Promise<readonly Group[]>

  /**
   * Create a group.
   * Source: `initGroup`. The root of the permission model, and the operation
   * expected to be hardest to port: SSB establishes a keyring, Holochain needs
   * a DNA or membrane decision, nostr has no group primitive at all.
   */
  createGroup(input: GroupFaceInput): Promise<WriteResult>

  /**
   * Write one face of a group's profile.
   * Source: `saveCommunity`, absorbing `savePublicCommunity`. Those issued the
   * identical mutation and differed only by a client-side field allowlist and
   * a flag, so visibility becomes an explicit argument here -- and a backend
   * decides what may be written, rather than a prune() call in the frontend.
   */
  saveGroupProfile(
    group: GroupId,
    visibility: Visibility,
    input: GroupFaceInput
  ): Promise<WriteResult>

  /**
   * Update both faces of a group together.
   * Source: `updateTribe`. See docs/contract-decisions.md §3 for atomicity.
   */
  updateGroup(
    group: GroupId,
    publicFace: GroupFaceInput,
    privateFace: GroupFaceInput
  ): Promise<PairedWriteResult>

  /**
   * Retract a group, both faces.
   * Source: `deleteTribe`, which was a save carrying a tombstone.
   */
  retractGroup(group: GroupId, reason: string | null): Promise<PairedWriteResult>

  /**
   * Grant administrative rights over a group.
   * Source: `addAdminsToGroup`. Enforcement is declared, not assumed: nostr
   * cannot enforce this, only record it.
   */
  grantAdministration(
    group: GroupId,
    identities: readonly IdentityId[]
  ): Promise<WriteResult>

  /**
   * List the people belonging to a group.
   * Source: `getMembers`, which resolved to listGroupAuthors. Membership is
   * not authorship: a member who has never written anything still belongs.
   */
  listMembers(group: GroupId): Promise<readonly Membership[]>

  /** Source: `createSubGroup`. */
  createSubgroup(parent: GroupId, input: GroupFaceInput): Promise<WriteResult>

  /** Source: `getSubGroups`. */
  listSubgroups(parent: GroupId): Promise<readonly Group[]>

  /**
   * Remove someone's membership of a subgroup and its counterpart in the
   * parent group.
   * Source: `deleteSubGroup`, which despite its name deleted no subgroup -- it
   * tombstoned a profile in each of two groups.
   */
  removeSubgroupMembership(
    subgroup: GroupId,
    identity: IdentityId
  ): Promise<PairedWriteResult>
}

export interface GroupFaceInput {
  readonly id: RecordId | null
  readonly name: string | null
  readonly description: string | null
  readonly avatar: MediaRef | null
}
