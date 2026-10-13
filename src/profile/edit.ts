/** The profile page's edit flow, kept independent of its Svelte dialog. */

import type { NewProfile, Profile, UpdateProfileResult } from './client.js'
import { profileForm, readForm, type ProfileForm, type ProfileFormErrors } from './form.js'

export type ProfileEditState =
  | { kind: 'closed' }
  | { kind: 'open', form: ProfileForm }
  | { kind: 'saving', form: ProfileForm }
  | { kind: 'refused', form: ProfileForm, errors: ProfileFormErrors }
  | { kind: 'saved', profile: Profile }

export interface ProfileEdit {
  readonly state: ProfileEditState
  /** Open from the latest profile, not stale form state. */
  open (profile: Profile): void
  /** Discard edits without writing a version. */
  cancel (): void
  /** Validate and save one complete profile version. */
  submit (form: ProfileForm): Promise<void>
  /** Follow the state, including its current value on subscription. */
  subscribe (listener: (state: ProfileEditState) => void): () => void
}

export function createProfileEdit (update: (profile: NewProfile) => Promise<UpdateProfileResult>): ProfileEdit {
  let state: ProfileEditState = { kind: 'closed' }
  const listeners = new Set<(state: ProfileEditState) => void>()

  function set (next: ProfileEditState): void {
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

    open (profile) {
      if (state.kind === 'saving') return
      set({ kind: 'open', form: profileForm(profile) })
    },

    cancel () {
      if (state.kind === 'open' || state.kind === 'refused') set({ kind: 'closed' })
    },

    async submit (form) {
      if (state.kind !== 'open' && state.kind !== 'refused') return
      const read = readForm(form)
      if ('errors' in read) {
        set({ kind: 'refused', form, errors: read.errors })
        return
      }

      set({ kind: 'saving', form })
      let result: UpdateProfileResult
      try {
        result = await update(read.profile)
      } catch (err) {
        result = { status: 'failed', reason: err instanceof Error ? err.message : String(err) }
      }
      if (result.status === 'updated') {
        set({ kind: 'saved', profile: result.profile })
      } else {
        // A new errors object on each refusal lets the dialog announce a repeated message again.
        set({ kind: 'refused', form, errors: { save: result.reason } })
      }
    }
  }
}
