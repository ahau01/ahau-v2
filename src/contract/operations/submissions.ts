import type { RecordId, WriteResult } from '../semantics.js'
import type { GroupId, Submission, SubmissionTarget } from '../types/index.js'
import type { PersonInput } from './person.js'
import type { LinkInput } from './link.js'
import type { WhakapapaViewInput } from './whakapapa.js'

/**
 * Submissions: proposals awaiting review.
 *
 * The propose and approve families are typed by what they carry, not merged,
 * because their payloads genuinely differ. The dispatch, however, moves: the
 * source frontend chose which approve mutation to call by inspecting the
 * submission's targetType -- a field the backend already holds -- so the
 * contract offers one approval entry point over a discriminated payload and
 * lets the backend route it.
 */
export interface SubmissionOperations {
  /**
   * List proposals awaiting review.
   * Source: `getSubmissions`, which took no arguments at all. A group filter
   * is added here: unfiltered fan-out is affordable against a server-held
   * index and expensive on Holochain or nostr.
   */
  listSubmissions(group: GroupId | null): Promise<readonly Submission[]>

  /** Source: `proposeNewGroupPerson`. */
  proposeNewPerson(group: GroupId, person: PersonInput, comment: string | null): Promise<WriteResult>

  /** Source: `proposeEditGroupPerson`. */
  proposeEditPerson(group: GroupId, target: RecordId, person: PersonInput, comment: string | null): Promise<WriteResult>

  /** Source: `proposeNewWhakapapaLink`. */
  proposeNewLink(group: GroupId, link: LinkInput, comment: string | null): Promise<WriteResult>

  /** Source: `proposeEditWhakapapaView`. */
  proposeEditWhakapapaView(group: GroupId, target: RecordId, view: WhakapapaViewInput, comment: string | null): Promise<WriteResult>

  /**
   * Propose removing a record.
   * Source: `proposeTombstone`. What approving it guarantees is governed by
   * the retraction decision -- see docs/contract-decisions.md §1.
   */
  proposeRetraction(group: GroupId, target: RecordId, comment: string | null): Promise<WriteResult>

  /**
   * Approve a proposal as submitted, without selecting fields.
   * Source: `approveSubmission`, which took a targetId rather than allowed
   * fields. Worth confirming against real use whether wholesale approval is
   * still wanted or is a superseded earlier form.
   */
  approveSubmission(id: RecordId, comment: string | null): Promise<WriteResult>

  /**
   * Approve a proposal, accepting only the fields the reviewer allows.
   *
   * Sources: `approveEditGroupPersonSubmission`,
   * `approveEditWhakapapaViewSubmission`, `approveNewGroupPersonSubmission`,
   * `approveNewWhakapapaLink` -- four accessors with identical signatures,
   * dispatched frontend-side on a field the backend already held.
   *
   * Field-level approval is the finest-grained permission in the application
   * and the least portable: enforced in a Holochain zome, unenforceable on
   * nostr. Callers must consult `fieldLevelApproval` before trusting it, since
   * an advisory backend records the restriction without applying it.
   */
  approveSubmissionFields(
    id: RecordId,
    target: SubmissionTarget,
    allowedFields: readonly string[],
    comment: string | null
  ): Promise<WriteResult>

  /**
   * Decline a proposal, on the record.
   * Source: `rejectSubmission`. Distinct from retraction: a declined proposal
   * stays visible with its reasoning, which matters when the proposer is a
   * community member owed an answer.
   */
  rejectSubmission(id: RecordId, comment: string | null): Promise<WriteResult>

  /**
   * Remove a proposal from view.
   * Source: `tombstoneSubmission`. Removal rather than refusal.
   */
  retractSubmission(id: RecordId, reason: string | null): Promise<WriteResult>

  /**
   * Record that one proposal depends on another.
   * Source: `createSubmissionsLink`. Links submissions to each other, not
   * people. Implies ordering between dependent proposals, which is a real
   * constraint on a backend with no ordering guarantees between events.
   */
  linkSubmissions(parent: RecordId, child: RecordId): Promise<WriteResult>
}
