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
}
