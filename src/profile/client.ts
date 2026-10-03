/**
 * The profile client module: the only code that talks to Holochain about
 * profiles. Screens use this, never a zome call directly.
 *
 * Identity is the conductor's agent key. There is no login here: `appToken`
 * lets this process reach one installed hApp on the local conductor; it is
 * not a person's credential and not a session.
 */

import { AppWebsocket, type AppAuthenticationToken } from '@holochain/client'

export interface ProfileClientOptions {
  /** App interface URL. Omit inside a launcher, which provides it. */
  url?: URL
  /** Issued by the conductor for this app. Omit inside a launcher. */
  appToken?: AppAuthenticationToken
  /** Origin header to send; needed outside a browser. */
  origin?: string
  /** How long to keep trying before reporting failure. */
  timeoutMs?: number
}

export type Readiness =
  | { status: 'ready' }
  | { status: 'failed', reason: string }

export interface ProfileClient {
  /** Wait until Holochain is reachable, or report that it failed to start. */
  waitUntilReady (): Promise<Readiness>
}

const DEFAULT_TIMEOUT_MS = 30_000
const RETRY_MS = 250

export function createProfileClient (options: ProfileClientOptions = {}): ProfileClient {
  return {
    async waitUntilReady () {
      // The conductor may still be starting, so keep trying until the deadline.
      const deadline = Date.now() + (options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
      while (true) {
        try {
          await AppWebsocket.connect({
            ...(options.url && { url: options.url }),
            ...(options.appToken && { token: options.appToken }),
            ...(options.origin && { wsClientOptions: { origin: options.origin } })
          })
          return { status: 'ready' }
        } catch (err) {
          if (Date.now() >= deadline) {
            return { status: 'failed', reason: `Holochain did not start: ${errorMessage(err)}` }
          }
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_MS))
      }
    }
  }
}

function errorMessage (err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
