/**
 * First launch: which screen a person sees when they open Āhau. Plain
 * TypeScript so it can be tested without Svelte or Holochain; it depends
 * only on the profile client interface and the zome's own messages.
 *
 * There is no login. "Returning" means this agent key already has a profile.
 * Going in from the avatar step records nothing: it only moves the screen
 * from launch into the shell.
 */

import { type Profile, type ProfileClient } from '../profile/client.js'
import { emptyProfileForm, readForm, type ProfileForm, type ProfileFormErrors } from '../profile/form.js'

export { emptyProfileForm, readForm, type ProfileForm, type ProfileFormErrors } from '../profile/form.js'

export type FirstLaunchState =
  | { kind: 'starting' }
  | { kind: 'failed-to-start', reason: string }
  | { kind: 'welcome' }
  | { kind: 'needs-profile', form: ProfileForm, errors?: ProfileFormErrors }
  | { kind: 'saving', form: ProfileForm }
  /** This agent has a profile; the launch screen shows its avatar step. */
  | { kind: 'has-profile', profile: Profile }
  | { kind: 'ready', profile: Profile }

/**
 * States the launch screen shows: Holochain starting or failed to, the
 * welcome, or the avatar step for an agent with a profile.
 */
export type LaunchState = Extract<FirstLaunchState, { kind: 'starting' | 'failed-to-start' | 'welcome' | 'has-profile' }>
/** States the create-profile screen shows: filling in the form, or saving it. */
export type CreateProfileState = Extract<FirstLaunchState, { kind: 'needs-profile' | 'saving' }>

export function isLaunchState (state: FirstLaunchState): state is LaunchState {
  return state.kind === 'starting' || state.kind === 'failed-to-start' || state.kind === 'welcome' || state.kind === 'has-profile'
}

export function isCreateProfileState (state: FirstLaunchState): state is CreateProfileState {
  return state.kind === 'needs-profile' || state.kind === 'saving'
}

export interface FirstLaunch {
  readonly state: FirstLaunchState
  /** Wait for Holochain, then decide whether this person needs a profile. */
  start (): Promise<void>
  /** From the welcome: the person says who they are, opening the profile form. */
  begin (): void
  /** Close the profile form without saving, back to the welcome. */
  cancel (): void
  /** Save this person's profile from the form. */
  submit (form: ProfileForm): Promise<void>
  /**
   * From the avatar step: the person goes in. Writes nothing and calls
   * nothing; identity is the agent key, not a login.
   */
  enter (): void
  /**
   * Follow the state: called now with the current state, then on each change.
   * Returns a function that stops following. Matches Svelte's store contract.
   */
  subscribe (listener: (state: FirstLaunchState) => void): () => void
}

export function createFirstLaunch (client: ProfileClient): FirstLaunch {
  let state: FirstLaunchState = { kind: 'starting' }
  const listeners = new Set<(state: FirstLaunchState) => void>()
  let launching: Promise<void> | undefined

  function set (next: FirstLaunchState): void {
    state = next
    for (const listener of listeners) listener(state)
  }

  async function launch (): Promise<void> {
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
    set(profile ? { kind: 'has-profile', profile } : { kind: 'welcome' })
  }

  return {
    get state () { return state },

    subscribe (listener) {
      listeners.add(listener)
      listener(state)
      return () => { listeners.delete(listener) }
    },

    start () {
      // Once only: a second run (HMR, a later effect) finishing late would
      // knock a saving or ready screen backwards. Every caller awaits the
      // one real launch.
      launching ??= launch()
      return launching
    },

    begin () {
      if (state.kind === 'welcome') set({ kind: 'needs-profile', form: emptyProfileForm() })
    },

    cancel () {
      // Not while saving: the save may already be on its way to Holochain.
      if (state.kind === 'needs-profile') set({ kind: 'welcome' })
    },

    enter () {
      if (state.kind === 'has-profile') set({ kind: 'ready', profile: state.profile })
    },

    async submit (form) {
      // Only the create-profile screen can save, and only once at a time.
      if (state.kind !== 'needs-profile') return
      const read = readForm(form)
      if ('errors' in read) {
        set({ kind: 'needs-profile', form, errors: read.errors })
        return
      }

      set({ kind: 'saving', form })
      const result = await client.createMyProfile(read.profile)
      if (result.status === 'created') {
        set({ kind: 'has-profile', profile: result.profile })
      } else {
        set({ kind: 'needs-profile', form, errors: { save: result.reason } })
      }
    }
  }
}
