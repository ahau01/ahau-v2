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
  storage?: PretendStorage
  /** How long "Holochain" takes to start, so the launch screen is visible. */
  startDelayMs?: number
  /** Act out a failure, to demo how the app handles it. */
  fail?: 'start' | 'save'
}

/** Only what the pretend client needs from a Web Storage object. */
interface PretendStorage {
  getItem (key: string): string | null
  setItem (key: string, value: string): void
}

const KEY = 'ahau:pretend-profile'

export function createPretendProfileClient (options: PretendProfileClientOptions = {}): ProfileClient {
  let memory: string | null = null
  const storage = options.storage ?? {
    getItem: () => memory,
    setItem: (_key: string, value: string) => { memory = value }
  }
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  return {
    async waitUntilReady () {
      await delay(options.startDelayMs ?? 0)
      if (options.fail === 'start') return { status: 'failed', reason: 'Pretend Holochain was told not to start' }
      return { status: 'ready' }
    },

    async getMyProfile () {
      const saved = storage.getItem(KEY)
      return saved === null ? null : JSON.parse(saved) as Profile
    },

    async createMyProfile (profile) {
      await delay(options.startDelayMs ?? 0)
      if (options.fail === 'save') return { status: 'failed', reason: 'Pretend Holochain was told not to save' }
      // Like the zome: one profile per agent key.
      if (storage.getItem(KEY) !== null) return { status: 'failed', reason: 'This agent already has a profile' }
      storage.setItem(KEY, JSON.stringify(profile))
      return { status: 'created', profile }
    },

    async close () {}
  }
}
