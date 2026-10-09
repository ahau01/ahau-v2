/**
 * First launch: which screen a person sees when they open Āhau. Plain
 * TypeScript so it can be tested without Svelte or Holochain; its only
 * dependency is the profile client interface.
 *
 * There is no login. "Returning" means this agent key already has a profile.
 */

import type { Gender, NewProfile, PersonalInformation, Profile, ProfileClient } from '../profile/client.js'

export type FirstLaunchState =
  | { kind: 'starting' }
  | { kind: 'failed-to-start', reason: string }
  | { kind: 'welcome' }
  | { kind: 'needs-profile', form: ProfileForm, errors?: ProfileFormErrors }
  | { kind: 'saving', form: ProfileForm }
  | { kind: 'ready', profile: Profile }

/** States the launch screen shows: Holochain starting or failed to, or the welcome. */
export type LaunchState = Extract<FirstLaunchState, { kind: 'starting' | 'failed-to-start' | 'welcome' }>
/** States the create-profile screen shows: filling in the form, or saving it. */
export type CreateProfileState = Extract<FirstLaunchState, { kind: 'needs-profile' | 'saving' }>

export function isLaunchState (state: FirstLaunchState): state is LaunchState {
  return state.kind === 'starting' || state.kind === 'failed-to-start' || state.kind === 'welcome'
}

export function isCreateProfileState (state: FirstLaunchState): state is CreateProfileState {
  return state.kind === 'needs-profile' || state.kind === 'saving'
}

/** The create-profile form as the person has filled it in, exactly as typed. */
export interface ProfileForm {
  name: string
  birthOrder: string
  gender: Gender | null
  fullName: string
  /** One per "Also known as" box, blank or not. */
  altNames: string[]
  /** Each part is '' until picked; month is '01' to '12'. */
  dateOfBirth: { day: string, month: string, year: string }
  placeOfBirth: string
  description: string
  profession: string
  skills: string[]
  education: string[]
  personal: Record<keyof PersonalInformation, string>
}

export function emptyProfileForm (): ProfileForm {
  return {
    name: '',
    birthOrder: '',
    gender: null,
    fullName: '',
    altNames: [],
    dateOfBirth: { day: '', month: '', year: '' },
    placeOfBirth: '',
    description: '',
    profession: '',
    skills: [],
    education: [],
    personal: { email: '', phone: '', address: '', postcode: '', city: '', country: '' }
  }
}

/**
 * Why a save was refused: per field, or `save` when Holochain refused it.
 * A new object each time, even for the same messages, so a screen can tell
 * a repeated refusal from no change and react again.
 */
export interface ProfileFormErrors {
  name?: string
  birthOrder?: string
  dateOfBirth?: string
  save?: string
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
    set(profile ? { kind: 'ready', profile } : { kind: 'welcome' })
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
        set({ kind: 'ready', profile: result.profile })
      } else {
        set({ kind: 'needs-profile', form, errors: { save: result.reason } })
      }
    }
  }
}

/**
 * The profile to save from what was typed: trimmed, with blank fields and
 * blank boxes left out. Or why it can't be saved yet.
 */
function readForm (form: ProfileForm): { profile: NewProfile } | { errors: ProfileFormErrors } {
  // A name of only spaces is no name. The zome refuses it too.
  const name = form.name.trim()
  const birthOrder = form.birthOrder.trim()
  const dateOfBirth = readDate(form.dateOfBirth)

  // Every problem at once, so the person isn't sent back field by field.
  const errors: ProfileFormErrors = {}
  if (!name) errors.name = 'Please enter a name.'
  if (birthOrder && !/^[1-9]\d*$/.test(birthOrder)) {
    errors.birthOrder = 'Order of birth must be a whole number, from 1'
  }
  if ('error' in dateOfBirth) errors.dateOfBirth = dateOfBirth.error
  if (Object.keys(errors).length > 0 || 'error' in dateOfBirth) return { errors }

  const profile: NewProfile = {
    name,
    ...text('fullName', form.fullName),
    ...text('placeOfBirth', form.placeOfBirth),
    ...text('description', form.description),
    ...text('profession', form.profession),
    ...list('altNames', form.altNames),
    ...list('skills', form.skills),
    ...list('education', form.education)
  }
  if (birthOrder) profile.birthOrder = Number(birthOrder)
  if (form.gender) profile.gender = form.gender
  if (dateOfBirth.date) profile.dateOfBirth = dateOfBirth.date

  const personal: Partial<PersonalInformation> = {}
  for (const [key, value] of Object.entries(form.personal) as Array<[keyof PersonalInformation, string]>) {
    if (value.trim()) personal[key] = value.trim()
  }
  if (Object.keys(personal).length > 0) profile.personal = personal

  return { profile }
}

/**
 * A date from its three dropdowns, as the old app read them
 * (ahau-monorepo apps/ahau/ui/src/lib/date-helpers.mjs, convertDateObjToString):
 * a year alone or a year and month is a date; a gap before a picked part isn't.
 */
function readDate ({ day, month, year }: ProfileForm['dateOfBirth']): { date: string } | { error: string } {
  if (year && month && day) return { date: `${year}-${month}-${day}` }
  if (year && month) return { date: `${year}-${month}` }
  if (year && !day) return { date: year }
  if (!year && !month && !day) return { date: '' }
  if (year) return { error: 'Please specify a month' }
  if (month && day) return { error: 'Please specify a year' }
  if (day) return { error: 'Please specify a year and month' }
  return { error: 'Please specify a year' }
}

function text<K extends string> (key: K, value: string): Partial<Record<K, string>> {
  const trimmed = value.trim()
  return trimmed ? { [key]: trimmed } as Record<K, string> : {}
}

function list<K extends string> (key: K, values: string[]): Partial<Record<K, string[]>> {
  const filled = values.map(value => value.trim()).filter(Boolean)
  return filled.length > 0 ? { [key]: filled } as Record<K, string[]> : {}
}
