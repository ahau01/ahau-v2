/**
 * First launch: which screen a person sees when they open Āhau. Plain
 * TypeScript so it can be tested without Svelte or Holochain; its only
 * dependency is the profile client interface.
 *
 * There is no login. "Returning" means this agent key already has a profile.
 */

import type { Profile, ProfileClient } from '../profile/client.js'

export type FirstLaunchState =
  | { kind: 'starting' }
  | { kind: 'failed-to-start', reason: string }
  | { kind: 'needs-profile', name: string, error?: string }
  | { kind: 'saving', name: string }
  | { kind: 'ready', profile: Profile }

export interface FirstLaunch {
  readonly state: FirstLaunchState
  /** Wait for Holochain, then decide whether this person needs a profile. */
  start (): Promise<void>
  /** Save this person's profile from what they typed. */
  submit (name: string): Promise<void>
  /**
   * Follow the state: called now with the current state, then on each change.
   * Returns a function that stops following. Matches Svelte's store contract.
   */
  subscribe (listener: (state: FirstLaunchState) => void): () => void
}

export function createFirstLaunch (client: ProfileClient): FirstLaunch {
  let state: FirstLaunchState = { kind: 'starting' }
  const listeners = new Set<(state: FirstLaunchState) => void>()

  function set (next: FirstLaunchState): void {
    state = next
    for (const listener of listeners) listener(state)
  }

  return {
    get state () { return state },

    subscribe (listener) {
      listeners.add(listener)
      listener(state)
      return () => { listeners.delete(listener) }
    },

    async start () {
      const readiness = await client.waitUntilReady()
      if (readiness.status === 'failed') {
        set({ kind: 'failed-to-start', reason: readiness.reason })
        return
      }
      // Unsure whether a profile exists: asking to create one could wrongly
      // re-onboard a returning person, so report it as a startup failure.
      let profile: Profile | null
      try {
        profile = await client.getMyProfile()
      } catch (err) {
        set({ kind: 'failed-to-start', reason: err instanceof Error ? err.message : String(err) })
        return
      }
      set(profile ? { kind: 'ready', profile } : { kind: 'needs-profile', name: '' })
    },

    async submit (name) {
      // Only the create-profile screen can save, and only once at a time.
      if (state.kind !== 'needs-profile') return
      // A name of only spaces is no name. Saved trimmed; the zome should
      // enforce the same rule once it validates names (#19).
      const trimmed = name.trim()
      if (!trimmed) {
        set({ kind: 'needs-profile', name, error: 'Please enter a name.' })
        return
      }

      set({ kind: 'saving', name })
      const result = await client.createMyProfile({ name: trimmed })
      if (result.status === 'created') {
        set({ kind: 'ready', profile: result.profile })
      } else {
        set({ kind: 'needs-profile', name, error: result.reason })
      }
    }
  }
}
