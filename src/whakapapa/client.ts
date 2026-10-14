/** The private whakapapa client. App code reaches Holochain only here. */

import { AppWebsocket, type ActionHash, type AppAuthenticationToken } from '@holochain/client'

export interface WhakapapaClientOptions {
  url?: URL
  appToken?: AppAuthenticationToken
  origin?: string
  timeoutMs?: number
}

export type PersonRef = 'Me' | { Relative: ActionHash }
export type Direction = 'Parent' | 'Child'

export interface Relationship {
  parent: PersonRef
  child: PersonRef
}

export interface NamedRelative {
  action: ActionHash
  name: string
}

export interface Whakapapa {
  relatives: NamedRelative[]
  relationships: Relationship[]
}

export interface AddRelativeInput {
  name: string
  direction: Direction
  of: PersonRef
}

export type WhakapapaFailure = { status: 'failed', reason: string }
export type AddRelativeResult = { status: 'added', whakapapa: Whakapapa } | WhakapapaFailure

export interface WhakapapaClient {
  waitUntilReady (): Promise<{ status: 'ready' } | WhakapapaFailure>
  getWhakapapa (): Promise<Whakapapa>
  addRelative (input: AddRelativeInput): Promise<AddRelativeResult>
  close (): Promise<void>
}

export const APP_ID = 'ahau'
export const ROLE = 'ahau'
export const ZOME = 'whakapapa'
/** Must match `WHAKAPAPA_NEEDS_PROFILE` in the integrity zome. */
export const WHAKAPAPA_NEEDS_PROFILE = 'Whakapapa needs a profile first'
export const WHAKAPAPA_FUNCTIONS = ['get_whakapapa', 'add_relative'] as const
type WhakapapaFunction = typeof WHAKAPAPA_FUNCTIONS[number]
const DEFAULT_TIMEOUT_MS = 30_000
const RETRY_MS = 250

export function createWhakapapaClient (options: WhakapapaClientOptions = {}): WhakapapaClient {
  let connection: AppWebsocket | undefined

  async function call<T> (fnName: WhakapapaFunction, payload: unknown): Promise<T> {
    if (!connection) throw new Error('Not connected to Holochain: call waitUntilReady first')
    return await connection.callZome({ role_name: ROLE, zome_name: ZOME, fn_name: fnName, payload })
  }

  return {
    async waitUntilReady () {
      if (connection) return { status: 'ready' }
      const deadline = Date.now() + (options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
      while (true) {
        try {
          const attempt = AppWebsocket.connect({
            ...(options.url && { url: options.url }),
            ...(options.appToken && { token: options.appToken }),
            ...(options.origin && { wsClientOptions: { origin: options.origin } })
          })
          const connected = await beforeDeadline(attempt, deadline)
          if (connected === TIMED_OUT) {
            attempt.then(late => late.client.close(), () => {})
            return { status: 'failed', reason: 'Holochain did not answer before the timeout' }
          }
          const info = await connected.appInfo()
          if (info?.status.type !== 'enabled') {
            await connected.client.close()
            return { status: 'failed', reason: `The app is installed but ${info?.status.type ?? 'missing'}` }
          }
          connection = connected
          return { status: 'ready' }
        } catch (error) {
          if (isInvalidToken(error)) {
            return { status: 'failed', reason: `Holochain rejected the app authentication token: ${errorMessage(error)}` }
          }
          if (Date.now() >= deadline) {
            return { status: 'failed', reason: `Holochain did not start: ${errorMessage(error)}` }
          }
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_MS))
      }
    },

    async getWhakapapa () {
      return await call<Whakapapa>('get_whakapapa', null)
    },

    async addRelative (input) {
      try {
        return { status: 'added', whakapapa: await call<Whakapapa>('add_relative', input) }
      } catch (error) {
        return { status: 'failed', reason: plainReason(error) }
      }
    },

    async close () {
      await connection?.client.close()
      connection = undefined
    }
  }
}

function plainReason (error: unknown): string {
  const message = errorMessage(error)
  return /Validation failed while committing: (.*)$/s.exec(message)?.[1] ?? message
}

function errorMessage (error: unknown): string {
  return error instanceof Error ? error.message : String(error)
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

function isInvalidToken (error: unknown): boolean {
  return error instanceof Error && error.name === 'InvalidTokenError'
}
