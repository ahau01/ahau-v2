/**
 * Backend-neutral replacements for the SSB constructs the existing frontend
 * depends on.
 *
 * Each SSB construct found during the Milestone 1 triage has exactly one
 * replacement here, and the mapping is stated so a reader can trace what
 * happened to it:
 *
 *   feedId          -> IdentityId, and separately PeerId
 *   recps           -> Visibility
 *   authors/intervals -> Membership
 *   tombstone       -> RecordStatus
 *   originalAuthor  -> Provenance
 *
 * The first of those is a split rather than a rename, and it is the most
 * consequential change in this file. See IdentityId and PeerId below.
 */

/**
 * Who someone is.
 *
 * Replaces `feedId` in its identity sense. SSB used one value as both the
 * identity of a person and the address of a log to replicate, because in SSB a
 * feed is both. No other candidate backend conflates them: a Holochain agent
 * key is not a node address, and a nostr npub is not a relay URL. Carrying the
 * conflation forward would have imported an SSB assumption into every record.
 */
export type IdentityId = string & { readonly __brand: 'IdentityId' }

/**
 * Where records are stored and replicated from — a storehouse, in Āhau's terms
 * a pātaka.
 *
 * The other half of the `feedId` split. A peer is a place, not a person.
 */
export type PeerId = string & { readonly __brand: 'PeerId' }

/** A group: an iwi, hapū, whānau or other community. */
export type GroupId = string & { readonly __brand: 'GroupId' }

export const asIdentityId = (raw: string): IdentityId => raw as IdentityId
export const asPeerId = (raw: string): PeerId => raw as PeerId
export const asGroupId = (raw: string): GroupId => raw as GroupId

/**
 * Who may see a record.
 *
 * Replaces `recps`, which was a list of SSB recipients — an encryption detail
 * standing in for an access rule. Stating the rule instead lets a backend
 * enforce it however it can, and lets an adapter that cannot enforce it say so
 * through `membershipEnforcement` rather than silently publishing in the open.
 */
export type Visibility =
  /** Discoverable by anyone, including people outside the group. */
  | { readonly scope: 'public' }
  /** Visible to members of a group. The ordinary case for whakapapa records. */
  | { readonly scope: 'group'; readonly group: GroupId }
  /** Visible only to named people. */
  | { readonly scope: 'restricted'; readonly audience: readonly IdentityId[] }

/**
 * Belonging to a group, over a period.
 *
 * Replaces `authors` and `intervals`. Under SSB, group membership was read
 * from feed authorship — `getMembers` resolves to `listGroupAuthors` — so a
 * member who had never written anything was invisible as a member. Membership
 * and having-written-something are different ideas and are separated here.
 */
export interface Membership {
  readonly identity: IdentityId
  readonly group: GroupId
  readonly role: MemberRole
  /** ISO 8601 date; null when the start is unknown. */
  readonly since: string | null
  /** ISO 8601 date; null while membership is current. */
  readonly until: string | null
}

export type MemberRole =
  /** An ordinary member of the group. */
  | 'member'
  /** A guardian, with administrative rights over the group and its records. */
  | 'kaitiaki'

/**
 * Whether a record is current or has been retracted.
 *
 * Replaces `tombstone`. Named for what it is: retraction, not deletion. No
 * candidate backend erases anything, so a retracted record is one the backend
 * will stop returning, not one that has ceased to exist.
 * See docs/contract-decisions.md §1.
 */
export type RecordStatus =
  | { readonly state: 'active' }
  | {
      readonly state: 'retracted'
      /** ISO 8601 date; null when the backend does not record when. */
      readonly at: string | null
      readonly reason: string | null
    }

/**
 * Who created a record.
 *
 * Replaces `originalAuthor`. Kept because provenance genuinely matters for
 * whakapapa — knowing who recorded a relationship is part of the record — but
 * expressed against an identity rather than against a feed.
 */
export interface Provenance {
  readonly author: IdentityId
  /** ISO 8601 date; null when the backend does not record when. */
  readonly recordedAt: string | null
}

/** Fields carried by every stored record in the contract. */
export interface RecordMeta {
  readonly status: RecordStatus
  readonly visibility: Visibility
  readonly provenance: Provenance
}
