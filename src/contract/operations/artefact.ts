import type { RecordId, WriteResult } from '../semantics.js'
import type { ArtefactInput } from '../types/index.js'

/**
 * Artefacts: images, recordings and documents held in the archive.
 *
 * The read path is absent by design. `getArtefact` and `getArtefacts` had no
 * call sites anywhere in the source frontend -- stories and collections carry
 * their artefacts inline -- and were dropped during triage. If v2 needs an
 * artefact browser it should be specified against that requirement rather than
 * resurrected from operations nothing called.
 */
export interface ArtefactOperations {
  /**
   * Source: `saveArtefact`. The operation most tied to media storage, which
   * differs completely across the candidates: SSB hyper-blobs, no Holochain
   * store designed for large media, external hosts under nostr.
   */
  saveArtefact(id: RecordId | null, artefact: ArtefactInput): Promise<WriteResult>

  /** Source: `DELETE_ARTEFACT`, renamed -- it was a function in SHOUT_CASE. */
  retractArtefact(id: RecordId, reason: string | null): Promise<WriteResult>
}
