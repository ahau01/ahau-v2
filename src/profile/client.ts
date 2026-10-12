/**
 * The profile client. With dev-connection.ts, which gets it connected
 * outside a launcher, this module is the only code that talks to Holochain
 * about profiles. Screens use it, never a zome call directly.
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

/**
 * A person's own account of themselves, as they see it. Not the canonical
 * record of them. `personal` is stored privately on their own source chain;
 * everything else is public to the network.
 */
export interface Profile {
  /** First name / known as. */
  name: string
  /** 1 for the eldest. */
  birthOrder: number | null
  gender: Gender | null
  fullName: string | null
  /** Also known as. */
  altNames: string[]
  /** `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. */
  dateOfBirth: string | null
  placeOfBirth: string | null
  /** About. */
  description: string | null
  profession: string | null
  skills: string[]
  /** Places of education. */
  education: string[]
  personal: PersonalInformation
}

/**
 * The genders the app offers. A conductor test checks the profiles
 * integrity zome (its `Gender` enum) keeps each one, but not that the zome
 * has no others. `unknown` is an answer the person chose, unlike `null` (no
 * answer).
 */
export const GENDERS = ['male', 'female', 'other', 'unknown'] as const
export type Gender = typeof GENDERS[number]

/** Contact details kept on the person's own chain, never published. */
export interface PersonalInformation {
  email: string | null
  phone: string | null
  address: string | null
  postcode: string | null
  city: string | null
  country: string | null
}

/** What to save: a name, plus whichever other fields the person filled in. */
export type NewProfile = Partial<Omit<Profile, 'personal'>> & {
  name: string
  personal?: Partial<PersonalInformation>
}

/**
 * The zome's refusal of an order of birth below 1 (BIRTH_ORDER_INVALID in
 * the profiles integrity zome). The form checks the same rule before saving
 * and shows this same text; a conductor test keeps the two equal.
 */
export const BIRTH_ORDER_INVALID = 'Order of birth must be a whole number, from 1'

/**
 * The zome's refusal of a second profile for one agent key
 * (ALREADY_HAS_PROFILE in the profiles integrity zome). The pretend client
 * gives the same reason; a conductor test keeps the two equal.
 */
export const ALREADY_HAS_PROFILE = 'This agent already has a profile'

/** The coordinator refuses to change a profile that has not been created. */
export const NO_PROFILE_TO_UPDATE = 'This agent has nothing of that kind to change yet'

/**
 * The profile a NewProfile saves as: unfilled fields empty, as the zome
 * stores them. Conductor tests compare what the zome reads back with this,
 * so these defaults can't drift from the zome's `#[serde(default)]`.
 */
export function completeProfile (input: NewProfile): Profile {
  return {
    birthOrder: null,
    gender: null,
    fullName: null,
    altNames: [],
    dateOfBirth: null,
    placeOfBirth: null,
    description: null,
    profession: null,
    skills: [],
    education: [],
    ...input,
    personal: {
      email: null,
      phone: null,
      address: null,
      postcode: null,
      city: null,
      country: null,
      ...input.personal
    }
  }
}

export type CreateProfileResult =
  | { status: 'created', profile: Profile }
  | { status: 'failed', reason: string }

/** An updated profile uses the same result shape as the initial save. */
export type UpdateProfileResult = CreateProfileResult

export type Readiness =
  | { status: 'ready' }
  | { status: 'failed', reason: string }

export interface ProfileClient {
  /** Wait until Holochain is reachable, or report that it failed to start. */
  waitUntilReady (): Promise<Readiness>
  /** This agent's profile, or null if they haven't created one yet. */
  getMyProfile (): Promise<Profile | null>
  /** Save this agent's profile. Each agent key has one profile. */
  createMyProfile (profile: NewProfile): Promise<CreateProfileResult>
  /** Add a version of this agent's existing profile. */
  updateMyProfile (profile: NewProfile): Promise<UpdateProfileResult>
  /** Release the connection to Holochain. */
  close (): Promise<void>
}

/** The installed hApp, and the role and zome within it that hold profiles. */
export const APP_ID = 'ahau'
export const ROLE = 'ahau'
export const ZOME = 'profiles'
/** Every profiles zome function this client calls; grants list exactly these. */
export const PROFILE_FUNCTIONS = ['get_my_profile', 'create_my_profile', 'update_my_profile'] as const
type ProfileFunction = typeof PROFILE_FUNCTIONS[number]

/**
 * For a launcher, which may still be starting the conductor. Dev overrides
 * it with a much shorter wait (dev-connection.ts), as its conductor is
 * already up by the time the page connects.
 */
const DEFAULT_TIMEOUT_MS = 30_000
const RETRY_MS = 250

export function createProfileClient (options: ProfileClientOptions = {}): ProfileClient {
  // Kept once connected: the app token is single-use, so later calls reuse it.
  let connection: AppWebsocket | undefined

  async function callProfiles<T> (fnName: ProfileFunction, payload: unknown): Promise<T> {
    if (!connection) throw new Error('Not connected to Holochain: call waitUntilReady first')
    return await connection.callZome({ role_name: ROLE, zome_name: ZOME, fn_name: fnName, payload })
  }

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

    async getMyProfile () {
      return await callProfiles<Profile | null>('get_my_profile', null)
    },

    async createMyProfile (profile) {
      try {
        const saved = await callProfiles<Profile>('create_my_profile', profile)
        return { status: 'created', profile: saved }
      } catch (err) {
        return { status: 'failed', reason: plainReason(err) }
      }
    },

    async updateMyProfile (profile) {
      try {
        const saved = await callProfiles<Profile>('update_my_profile', profile)
        return { status: 'created', profile: saved }
      } catch (err) {
        return { status: 'failed', reason: plainReason(err) }
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

/** A validation rejection's own message, without Holochain's wrapping. */
function plainReason (err: unknown): string {
  const message = errorMessage(err)
  return /Validation failed while committing: (.*)$/s.exec(message)?.[1] ?? message
}

function errorMessage (err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
