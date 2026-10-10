import type { PermissionWriteResult, RecordId, WriteResult } from '../semantics.js'
import type { GroupApplication, GroupId, IdentityId } from '../types/index.js'

/**
 * Applications to join a group.
 *
 * A second review workflow, parallel to submissions, with its own propose,
 * accept and decline verbs. Whether the contract should eventually express one
 * review mechanism or two is an open consolidation question; they are kept
 * apart here because they were apart in the source and merging them is a
 * design change rather than a translation.
 */
export interface ApplicationOperations {
  /** Source: `createGroupApplication`. */
  applyToGroup(group: GroupId, comment: string | null): Promise<WriteResult>

  /**
   * Admit an applicant.
   * Source: `acceptGroupApplication`. The write that confers membership, and
   * therefore the one most in need of backend enforcement -- consult
   * `membershipEnforcement` before presenting it as a guarantee.
   */
  acceptApplication(id: RecordId, comment: string | null): Promise<PermissionWriteResult>

  /** Source: `declineGroupApplication`. */
  declineApplication(id: RecordId, comment: string | null): Promise<WriteResult>

  /**
   * List applications still awaiting a decision.
   * Source: `listGroupApplications`, whose root field was `unseen` -- it
   * returned the unreviewed subset rather than everything, despite the name.
   */
  listPendingApplications(group: GroupId): Promise<readonly GroupApplication[]>

  /**
   * Issue a credential attesting that someone belongs to a group.
   * Source: `offerMembershipCredential`, which bound the credential to a feed
   * identity. The credential format is protocol-independent; the binding is
   * now to an identity rather than a feed.
   */
  offerMembershipCredential(group: GroupId, identity: IdentityId): Promise<WriteResult>
}
