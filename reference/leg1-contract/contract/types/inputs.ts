/**
 * What callers supply when writing.
 *
 * Inputs carry fields only. They no longer carry an identifier: a single
 * `*Input` type served both creation and update, so its `id` had to be
 * `RecordId | null`, which collided with the record types where `id` is
 * required. Write operations take the identifier as an argument instead --
 * null to create, an id to update -- which removes the ambiguity without
 * doubling the number of input types.
 *
 * Inputs live beside the record types rather than with the operations because
 * a proposal carries one: a submission records what is proposed, and that
 * payload is a domain shape, not an argument list.
 */

import type { RecordId } from '../semantics.js'
import type { CustomField, GroupId, MediaRef, Visibility } from './index.js'

export interface PersonInput {
  readonly preferredName: string | null
  readonly legalName: string | null
  readonly gender: string | null
  readonly birthOrder: number | null
  readonly customFields: readonly CustomField[]
}

export interface LinkInput {
  readonly parent: RecordId
  readonly child: RecordId
  readonly relationshipType: string
  readonly isPartner: boolean
  /**
   * Carried explicitly: a relationship can be more sensitive than either
   * person on its end, so it does not inherit their visibility.
   */
  readonly visibility: Visibility
}

export interface WhakapapaViewInput {
  readonly group: GroupId
  readonly name: string | null
  readonly description: string | null
  readonly focus: RecordId | null
  readonly ignoredProfiles: readonly RecordId[]
}

export interface GroupFaceInput {
  readonly name: string | null
  readonly description: string | null
  readonly avatar: MediaRef | null
}

export interface GroupSettingsInput {
  readonly group: GroupId
}

export interface StoryInput {
  readonly title: string | null
  readonly description: string | null
  readonly artefacts: readonly RecordId[]
  readonly mentions: readonly RecordId[]
  readonly visibility: Visibility
}

export interface CollectionInput {
  readonly name: string | null
  readonly visibility: Visibility
}

export interface ArtefactInput {
  readonly media: MediaRef | null
  readonly description: string | null
  readonly visibility: Visibility
}
