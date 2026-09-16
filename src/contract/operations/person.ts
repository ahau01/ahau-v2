import type { Supported } from '../capabilities.js'
import type { RecordId, WriteResult } from '../semantics.js'
import type { CustomField, GroupId, Person, PersonInput, Viewer } from '../types/index.js'

/** People: the nodes of the whakapapa, and the viewer's own identity. */
export interface PersonOperations {
  /**
   * Who the caller is and which groups they belong to.
   * Source: `whoami`. Expressed as identity plus membership rather than as a
   * feed identity with recipient lists.
   */
  getViewer(): Promise<Viewer>

  /**
   * Read a person.
   * Source: `getPerson`, absorbing `getPersonMinimal` and `getPersonFull` --
   * those differed only by field projection, which no candidate backend
   * provides cheaply.
   */
  getPerson(id: RecordId): Promise<Person | null>

  /**
   * Read a person's tribe-defined custom fields.
   * Source: `getPersonCustomFields`. Kept separate from getPerson because
   * these carry their own visibility scope, not because they are a projection.
   */
  getPersonCustomFields(id: RecordId): Promise<readonly CustomField[]>

  /** Source: `savePerson`. */
  savePerson(id: RecordId | null, person: PersonInput): Promise<WriteResult>

  /**
   * Search people by name within a group.
   * Source: `findPersonByName`. Gated: Holochain needs an explicit index and
   * nostr has no server-side text search, so an adapter may decline.
   */
  findPeopleByName(
    name: string,
    group: GroupId | null
  ): Promise<Supported<readonly Person[]>>

  /**
   * Retract a person, and the whakapapa links referring to them.
   * Source: `deletePerson`, which resolves to tombstoneProfileAndLinks. Named
   * for what it does: the links go too, and nothing is erased.
   */
  retractPerson(id: RecordId, reason: string | null): Promise<WriteResult>

  /**
   * List the people in a group.
   * Source: `loadPersonList`. The admin variant is gone: that accessor chose
   * between two queries on a frontend argument, which is a permission decision
   * taken on the wrong side of the boundary. The backend returns what this
   * caller may see.
   */
  listPeople(group: GroupId): Promise<readonly Person[]>
}

