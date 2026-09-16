import type { RecordId, WriteResult } from '../semantics.js'
import type { GroupId, GroupSettings } from '../types/index.js'

/** Group settings, identity backup, and local store management. */
export interface SettingsOperations {
  /** Source: `getSettings`. */
  getGroupSettings(group: GroupId): Promise<GroupSettings | null>

  /** Source: `getAllSettings`. */
  listGroupSettings(): Promise<readonly GroupSettings[]>

  /** Source: `saveSettings`. */
  saveGroupSettings(group: GroupId, settings: GroupSettingsInput): Promise<WriteResult>

  /**
   * Retract a group's settings.
   * Source: `deleteSettings`, which resolved to saveSettings with a tombstone
   * -- which is why that domain had two accessors pointing at one mutation.
   */
  retractGroupSettings(group: GroupId): Promise<WriteResult>

  /**
   * Export the caller's identity so they can recover it elsewhere.
   * Source: `getBackup`. The need is universal and the artefact is not: an SSB
   * feed keypair, a Holochain agent key and a nostr nsec have nothing in
   * common, so the material is opaque and its interpretation is the adapter's.
   */
  exportIdentity(): Promise<IdentityExport>

  /**
   * Delete the local store and reset the application.
   * Source: `deleteAhau`. Explicitly not a retraction: it removes a store, not
   * a record, and what peers or relays already hold is untouched by it.
   */
  resetLocalStore(): Promise<void>
}

export interface GroupSettingsInput {
  readonly id: RecordId | null
}

export interface IdentityExport {
  /** Opaque backup material. Format is the adapter's business. */
  readonly material: string
  /** How the adapter describes the format, for display only. */
  readonly format: string
}
