import type { RecordId } from '../semantics.js'
import type { Profile } from '../types/index.js'

/**
 * Profiles: how an identity presents within a group.
 *
 * Deliberately separate from PersonOperations. A person is a node in the
 * whakapapa; a profile is a presentation within a group, and the same person
 * may appear differently in different groups.
 */
export interface ProfileOperations {
  /** Source: `getProfile`. */
  getProfile(id: RecordId): Promise<Profile | null>
}
