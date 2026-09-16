/**
 * Domain records the contract's operations exchange.
 *
 * Deliberately not exhaustive. Field lists here cover what is structurally
 * significant — identity, relationships, visibility, the distinctions that
 * carry meaning — rather than every property the current GraphQL fragments
 * happen to select. Inventing two hundred fields from fragment selections
 * would be transcribing GraphQL-over-SSB under a new name, which is the risk
 * the plan names against this milestone. Fields land as operations and, later,
 * real screens demand them.
 */

import type { RecordId } from '../semantics.js'
import type { LinkInput, PersonInput, WhakapapaViewInput } from './inputs.js'
import type {
  GroupId,
  IdentityId,
  Membership,
  PeerId,
  RecordMeta
} from './primitives.js'

/**
 * A person in the whakapapa.
 *
 * Distinct from Profile, and deliberately so: a person is a node in the
 * genealogy, while a profile is how an identity presents within a particular
 * group. The same person can appear differently in different groups, and
 * collapsing the two would lose that — a distinction load-bearing enough that
 * `getPerson` and `getProfile` were kept separate during triage despite
 * overlapping heavily.
 */
export interface Person extends RecordMeta {
  readonly id: RecordId
  readonly preferredName: string | null
  readonly legalName: string | null
  readonly gender: string | null
  readonly birthOrder: number | null
  readonly aliveInterval: string | null
  readonly deceased: boolean
  readonly avatar: MediaRef | null
  /** Tribe-defined fields beyond the standard schema, with their own visibility. */
  readonly customFields: readonly CustomField[]
}

/** How an identity presents within a group. */
export interface Profile extends RecordMeta {
  readonly id: RecordId
  readonly identity: IdentityId
  readonly group: GroupId
  readonly preferredName: string | null
  readonly avatar: MediaRef | null
}

export interface CustomField {
  readonly key: string
  readonly value: string
}

/**
 * A reference to stored media.
 *
 * Opaque on purpose. SSB addresses blobs through hyper-blobs, Holochain has no
 * blob store designed for large media, and nostr pushes media to external
 * hosts entirely. An adapter resolves this however it must.
 */
export interface MediaRef {
  readonly ref: string
  readonly mimeType: string | null
}

/**
 * A group, held as a pair.
 *
 * An Āhau group is two records: a discoverable public profile and a
 * members-only private one. The pairing is modelled here rather than in the
 * operations so callers never orchestrate two writes.
 * See docs/contract-decisions.md §3.
 */
export interface Group {
  readonly id: GroupId
  readonly public: GroupFace
  readonly private: GroupFace
}

/** One face of a group — its public or its members-only presentation. */
export interface GroupFace extends RecordMeta {
  readonly id: RecordId
  readonly name: string | null
  readonly description: string | null
  readonly avatar: MediaRef | null
}

export interface Subgroup {
  readonly id: GroupId
  readonly parent: GroupId
  readonly face: GroupFace
}

export interface GroupSettings extends RecordMeta {
  readonly id: RecordId
  readonly group: GroupId
}

/**
 * A relationship between two people — the edge of the whakapapa graph.
 *
 * Carries its own visibility rather than inheriting either person's. A
 * relationship can be more sensitive than either individual on its end, which
 * `whakapapaLink` made explicit by selecting recipients directly rather than
 * through a fragment.
 */
export interface WhakapapaLink extends RecordMeta {
  readonly id: RecordId
  readonly parent: RecordId
  readonly child: RecordId
  readonly relationshipType: string
  readonly isPartner: boolean
}

/**
 * A saved lens over the whakapapa — not the graph itself.
 *
 * The graph is the links. A view records which person is the focus, who is
 * ignored, and which parent or partner counts as primary where someone has
 * several. This is application state and should port to any backend unchanged.
 */
export interface WhakapapaView extends RecordMeta {
  readonly id: RecordId
  readonly group: GroupId
  readonly name: string | null
  readonly description: string | null
  readonly focus: RecordId | null
  readonly ignoredProfiles: readonly RecordId[]
  readonly importantRelationships: readonly ImportantRelationship[]
  readonly recordCount: number | null
}

export interface ImportantRelationship {
  readonly profile: RecordId
  readonly primary: RelationshipRef | null
  readonly other: readonly RelationshipRef[]
}

export interface RelationshipRef {
  readonly profile: RecordId
  readonly relationshipType: string
}

export interface Story extends RecordMeta {
  readonly id: RecordId
  readonly title: string | null
  readonly description: string | null
  readonly artefacts: readonly RecordId[]
  /** People this story mentions; the basis of the reverse lookup. */
  readonly mentions: readonly RecordId[]
}

export interface Collection extends RecordMeta {
  readonly id: RecordId
  readonly name: string | null
  readonly stories: readonly RecordId[]
}

export interface Artefact extends RecordMeta {
  readonly id: RecordId
  readonly media: MediaRef | null
  readonly description: string | null
}

/** A proposed change awaiting review. */
export interface Submission extends RecordMeta {
  readonly id: RecordId
  readonly group: GroupId
  /**
   * What is being proposed.
   *
   * A submission originally recorded only what it targeted, never what it
   * proposed -- so approval had nothing to apply, and a backend that discarded
   * every approved change was indistinguishable from one that honoured them.
   * The payload lives here so approval is implementable at all.
   */
  readonly proposal: SubmissionProposal
  readonly comments: readonly SubmissionComment[]
  /** Proposals this one depends on, which must be applied in order. */
  readonly dependencies: readonly RecordId[]
}

/**
 * The content of a proposal, discriminated by what it changes.
 *
 * Mirrors the arguments of the propose operations, so proposing and approving
 * share one shape rather than describing the same change twice.
 */
export type SubmissionProposal =
  | { readonly kind: 'new-person'; readonly person: PersonInput }
  | { readonly kind: 'edit-person'; readonly target: RecordId; readonly person: PersonInput }
  | { readonly kind: 'new-link'; readonly link: LinkInput }
  | {
      readonly kind: 'edit-whakapapa-view'
      readonly target: RecordId
      readonly view: WhakapapaViewInput
    }
  | { readonly kind: 'retraction'; readonly target: RecordId; readonly reason: string | null }

/** Derived from the proposal union so the two can never drift apart. */
export type SubmissionTarget = SubmissionProposal['kind']

export interface SubmissionComment {
  readonly author: IdentityId
  readonly comment: string
}

/** A request to join a group. */
export interface GroupApplication extends RecordMeta {
  readonly id: RecordId
  readonly group: GroupId
  readonly applicant: IdentityId
  readonly reviewed: boolean
}

/** A verifiable credential — already a protocol-independent format. */
export interface Credential extends RecordMeta {
  readonly id: RecordId
  readonly subject: IdentityId
  readonly kind: string
}

/**
 * A storehouse holding and replicating a group's records — a pātaka.
 *
 * Addressed by PeerId rather than by an identity, because a storehouse is a
 * place, not a person. What replication means differs sharply per backend, so
 * an adapter may mean something quite different by this.
 */
export interface Storehouse {
  readonly id: PeerId
  readonly name: string | null
  readonly blocked: boolean
}

/** Who the caller is, and where they belong. */
export interface Viewer {
  readonly identity: IdentityId
  readonly memberships: readonly Membership[]
}
