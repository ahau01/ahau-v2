import type { Capabilities } from '../capabilities.js'
import type { ApplicationOperations } from './applications.js'
import type { ArtefactOperations } from './artefact.js'
import type { CollectionOperations } from './collection.js'
import type { CredentialOperations } from './credentials.js'
import type { GroupOperations } from './group.js'
import type { LinkOperations } from './link.js'
import type { PersonOperations } from './person.js'
import type { ProfileOperations } from './profile.js'
import type { ReadinessOperations } from './readiness.js'
import type { SettingsOperations } from './settings.js'
import type { StoryOperations } from './story.js'
import type { StorehouseOperations } from './storehouse.js'
import type { SubmissionOperations } from './submissions.js'
import type { WhakapapaOperations } from './whakapapa.js'

/**
 * The contract. A backend adapter implements this and nothing else.
 *
 * Capabilities are read, not called: an adapter declares up front what it
 * cannot guarantee, so an application can adapt before it asks rather than
 * discovering limits through failures.
 */
export interface DataAccess {
  readonly capabilities: Capabilities

  readonly person: PersonOperations
  readonly profile: ProfileOperations
  readonly whakapapa: WhakapapaOperations
  readonly link: LinkOperations
  readonly group: GroupOperations
  readonly settings: SettingsOperations
  readonly story: StoryOperations
  readonly collection: CollectionOperations
  readonly artefact: ArtefactOperations
  readonly submissions: SubmissionOperations
  readonly applications: ApplicationOperations
  readonly credentials: CredentialOperations
  readonly readiness: ReadinessOperations
  readonly storehouse: StorehouseOperations
}

export * from './applications.js'
export * from './artefact.js'
export * from './collection.js'
export * from './credentials.js'
export * from './group.js'
export * from './link.js'
export * from './person.js'
export * from './profile.js'
export * from './readiness.js'
export * from './settings.js'
export * from './sources.js'
export * from './story.js'
export * from './storehouse.js'
export * from './submissions.js'
export * from './whakapapa.js'
