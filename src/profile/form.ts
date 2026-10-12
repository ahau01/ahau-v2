/**
 * The profile form's plain-data state and its conversion to a save payload.
 * Shared by first launch and the profile edit dialog.
 */

import { BIRTH_ORDER_INVALID, type Gender, type NewProfile, type PersonalInformation, type Profile } from './client.js'
import { dayOptions, monthOptions, yearOptions } from './date-options.js'

/** The profile form as the person has filled it in, exactly as typed. */
export interface ProfileForm {
  name: string
  birthOrder: string
  gender: Gender | null
  fullName: string
  /** One per "Also known as" box, blank or not. */
  altNames: string[]
  /** Each part is '' until picked; month is '01' to '12'. */
  dateOfBirth: { day: string, month: string, year: string, unrepresentable?: string }
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

/** Seed the shared form with every saved field, leaving nulls blank. */
export function profileForm (profile: Profile): ProfileForm {
  const dateOfBirth = profile.dateOfBirth === null
    ? { day: '', month: '', year: '' }
    : dateParts(profile.dateOfBirth)
  return {
    name: profile.name,
    birthOrder: profile.birthOrder === null ? '' : String(profile.birthOrder),
    gender: profile.gender,
    fullName: profile.fullName ?? '',
    altNames: [...profile.altNames],
    dateOfBirth,
    placeOfBirth: profile.placeOfBirth ?? '',
    description: profile.description ?? '',
    profession: profile.profession ?? '',
    skills: [...profile.skills],
    education: [...profile.education],
    personal: {
      email: profile.personal.email ?? '',
      phone: profile.personal.phone ?? '',
      address: profile.personal.address ?? '',
      postcode: profile.personal.postcode ?? '',
      city: profile.personal.city ?? '',
      country: profile.personal.country ?? ''
    }
  }
}

function dateParts (date: string): ProfileForm['dateOfBirth'] {
  const parts = date.split('-')
  const [year, month, day] = parts
  const representable = year !== undefined && year !== '' && yearOptions.includes(year) &&
    (parts.length === 1 || (month !== undefined && month !== '' && monthOptions.some(option => option.value === month))) &&
    (parts.length < 3 || (day !== undefined && dayOptions.includes(day))) &&
    (parts.length === 1 || parts.length === 2 || parts.length === 3)
  if (!representable) return { day: '', month: '', year: '', unrepresentable: date }
  return { day: day ?? '', month: month ?? '', year }
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

/**
 * The profile to save from what was typed: trimmed, with blank fields and
 * blank boxes left out. Or why it can't be saved yet.
 */
export function readForm (form: ProfileForm): { profile: NewProfile } | { errors: ProfileFormErrors } {
  // A name of only spaces is no name. The zome refuses it too.
  const name = form.name.trim()
  const birthOrder = form.birthOrder.trim()
  const dateOfBirth = readDate(form.dateOfBirth)

  // Every problem at once, so the person isn't sent back field by field.
  const errors: ProfileFormErrors = {}
  if (!name) errors.name = 'Please enter a name.'
  if (birthOrder && !/^[1-9]\d*$/.test(birthOrder)) errors.birthOrder = BIRTH_ORDER_INVALID
  if ('error' in dateOfBirth) errors.dateOfBirth = dateOfBirth.error
  // `'error' in dateOfBirth` changes nothing at runtime (that case set an
  // error above); it tells TypeScript the date was read, for below.
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
function readDate (parts: ProfileForm['dateOfBirth']): { date: string } | { error: string } {
  const { day, month, year } = parts
  if (parts.unrepresentable !== undefined) return { date: parts.unrepresentable }
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
