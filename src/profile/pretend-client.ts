/**
 * A pretend profile client for running the app without Holochain. Same
 * interface as the real client; nothing here reaches a conductor.
 *
 * DEV ONLY. It keeps the one profile this pretend agent has in `storage`
 * (the browser's localStorage in the app) so "returning user" can be demoed
 * by reloading. The app uses it with `?pretend`; otherwise dev runs on the
 * local conductor (see dev-connection.ts).
 */

import { ALREADY_HAS_PROFILE, GENDERS, NO_PROFILE_TO_UPDATE, completeProfile, type Gender, type PersonalInformation, type Profile, type ProfileClient } from './client.js'

export interface PretendProfileClientOptions {
  /** Where the pretend agent's profile is kept between reloads. */
  storage: PretendStorage
  /** How long each "Holochain" call takes, so the launch and saving states are visible. */
  latencyMs?: number
  /** Act out a failure, to demo how the app handles it. */
  fail?: 'start' | 'save'
}

/** Only what the pretend client needs from a Web Storage object. */
interface PretendStorage {
  getItem (key: string): string | null
  setItem (key: string, value: string): void
}

const KEY = 'ahau:pretend-profile'

export function createPretendProfileClient (options: PretendProfileClientOptions): ProfileClient {
  const { storage } = options
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  return {
    async waitUntilReady () {
      await delay(options.latencyMs ?? 0)
      if (options.fail === 'start') return { status: 'failed', reason: 'Pretend Holochain was told not to start' }
      return { status: 'ready' }
    },

    async getMyProfile () {
      return readSaved(storage.getItem(KEY))
    },

    async createMyProfile (profile) {
      await delay(options.latencyMs ?? 0)
      if (options.fail === 'save') return { status: 'failed', reason: 'Pretend Holochain was told not to save' }
      // Like the zome: one profile per agent key.
      if (readSaved(storage.getItem(KEY)) !== null) return { status: 'failed', reason: ALREADY_HAS_PROFILE }
      const saved = completeProfile(profile)
      storage.setItem(KEY, JSON.stringify(saved))
      return { status: 'created', profile: saved }
    },

    async updateMyProfile (profile) {
      await delay(options.latencyMs ?? 0)
      if (options.fail === 'save') return { status: 'failed', reason: 'Pretend Holochain was told not to save' }
      // Like the zome, changing a profile cannot create its first version.
      if (readSaved(storage.getItem(KEY)) === null) return { status: 'failed', reason: NO_PROFILE_TO_UPDATE }
      const saved = completeProfile(profile)
      storage.setItem(KEY, JSON.stringify(saved))
      return { status: 'created', profile: saved }
    },

    async close () {}
  }
}

/**
 * A stale or hand-edited saved value counts as no profile, not a crash. A
 * field of the wrong type reads as empty, so what's returned really is a
 * Profile; missing fields are filled out, so a profile saved before a field
 * existed still reads.
 */
function readSaved (saved: string | null): Profile | null {
  if (saved === null) return null
  let value: unknown
  try {
    value = JSON.parse(saved)
  } catch {
    return null
  }
  if (!isRecord(value) || typeof value.name !== 'string') return null
  return completeProfile({
    name: value.name,
    ...fieldsThat(value, ['fullName', 'dateOfBirth', 'placeOfBirth', 'description', 'profession'], isText),
    ...fieldsThat(value, ['altNames', 'skills', 'education'], isTextList),
    ...fieldsThat(value, ['birthOrder'], isBirthOrder),
    ...fieldsThat(value, ['gender'], isGender),
    personal: fieldsThat(isRecord(value.personal) ? value.personal : {}, PERSONAL_FIELDS, isText)
  })
}

const PERSONAL_FIELDS: ReadonlyArray<keyof PersonalInformation> = ['email', 'phone', 'address', 'postcode', 'city', 'country']

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string'
const isTextList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isText)
const isBirthOrder = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 1
const isGender = (v: unknown): v is Gender => (GENDERS as readonly unknown[]).includes(v)

/** The named fields of `from` that pass `check`; the rest are left out. */
function fieldsThat<K extends string, T> (from: Record<string, unknown>, keys: readonly K[], check: (v: unknown) => v is T): Partial<Record<K, T>> {
  const kept: Partial<Record<K, T>> = {}
  for (const key of keys) {
    const v = from[key]
    if (check(v)) kept[key] = v
  }
  return kept
}
