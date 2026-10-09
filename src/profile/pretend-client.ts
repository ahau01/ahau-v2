/**
 * A pretend profile client for running the app without Holochain. Same
 * interface as the real client; nothing here reaches a conductor.
 *
 * DEV ONLY. It keeps the one profile this pretend agent has in `storage`
 * (the browser's localStorage in the app) so "returning user" can be demoed
 * by reloading. #18 replaces it with the real client.
 */

import type { Profile, ProfileClient } from './client.js'

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
      if (readSaved(storage.getItem(KEY)) !== null) return { status: 'failed', reason: 'This agent already has a profile' }
      storage.setItem(KEY, JSON.stringify(profile))
      return { status: 'created', profile }
    },

    async close () {}
  }
}

/** A stale or hand-edited saved value counts as no profile, not a crash. */
function readSaved (saved: string | null): Profile | null {
  if (saved === null) return null
  try {
    const value: unknown = JSON.parse(saved)
    if (typeof value === 'object' && value !== null && 'name' in value && typeof value.name === 'string') {
      return { name: value.name }
    }
  } catch {}
  return null
}
