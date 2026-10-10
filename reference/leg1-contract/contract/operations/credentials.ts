import type { WriteResult } from '../semantics.js'
import type { Credential } from '../types/index.js'

/**
 * Verifiable credentials.
 *
 * The cleanest corner of the contract: W3C verifiable credentials are already
 * a protocol-independent format, and this carried no SSB constructs at all.
 */
export interface CredentialOperations {
  /** Source: `getAllCredentials`. */
  listCredentials(): Promise<readonly Credential[]>

  /**
   * Present a held credential to a verifier.
   *
   * Source: the inline sendCredentialProof mutation in InputInviteDialog.vue.
   * The contract could list credentials and offer them but not present one,
   * which is the only thing a credential is finally for.
   */
  presentCredential(invitationUrl: string, credential: string): Promise<WriteResult>
}
