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
  /** Release the connection to Holochain. */
  close (): Promise<void>
}

const DEFAULT_TIMEOUT_MS = 30_000
const RETRY_MS = 250

export function createProfileClient (options: ProfileClientOptions = {}): ProfileClient {
  // Kept once connected: the app token is single-use, so later calls reuse it.
  let connection: AppWebsocket | undefined

  return {
    async waitUntilReady () {
      if (connection) return { status: 'ready' }
      // The conductor may still be starting, so keep trying until the deadline.
      const deadline = Date.now() + (options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
      while (true) {
        try {
          const attempt = AppWebsocket.connect({
            ...(options.url && { url: options.url }),
            ...(options.appToken && { token: options.appToken }),
            ...(options.origin && { wsClientOptions: { origin: options.origin } })
          })
          // An attempt can hang (something on the port that never answers), so it gets only the time left.
          const result = await beforeDeadline(attempt, deadline)
          if (result === TIMED_OUT) {
            attempt.then(late => late.client.close(), () => {})
            return { status: 'failed', reason: 'Holochain did not answer before the timeout' }
          }
          // The conductor answers app_info for an installed app even when zome calls would fail.
          const app = await result.appInfo()
          if (app?.status.type !== 'enabled') {
            await result.client.close()
            return { status: 'failed', reason: `The app is installed but ${app?.status.type ?? 'missing'}` }
          }
          connection = result
          return { status: 'ready' }
        } catch (err) {
          // A rejected token won't be accepted on a retry; only an unreachable conductor might start.
          if (isInvalidToken(err)) {
            return { status: 'failed', reason: `Holochain rejected the app authentication token: ${errorMessage(err)}` }
          }
          if (Date.now() >= deadline) {
            return { status: 'failed', reason: `Holochain did not start: ${errorMessage(err)}` }
          }
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_MS))
      }
    },

    async close () {
      await connection?.client.close()
      connection = undefined
    }
  }
}

const TIMED_OUT = Symbol('timed out')

async function beforeDeadline<T> (promise: Promise<T>, deadline: number): Promise<T | typeof TIMED_OUT> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<typeof TIMED_OUT>(resolve => {
    timer = setTimeout(() => resolve(TIMED_OUT), Math.max(0, deadline - Date.now()))
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

function isInvalidToken (err: unknown): boolean {
  return err instanceof Error && err.name === 'InvalidTokenError'
}

function errorMessage (err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
