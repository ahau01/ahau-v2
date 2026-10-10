/**
 * What a person's own profile page shows, as plain data (design D6). Plain
 * TypeScript so the rules are tested without Svelte.
 *
 * Labels are the create-profile form's, so a person sees the same words they
 * typed into. Blank fields are left out; list fields give one item each.
 */

import type { Gender, PersonalInformation, Profile } from '../profile/client.js'

export interface ProfileItem {
  label: string
  value: string
}

export interface ProfileSection {
  items: ProfileItem[]
  isEmpty: boolean
}

export interface ProfileSections {
  /** Published: anyone using Āhau can read it today (#67). */
  profile: ProfileSection
  /** A private entry on the agent's own chain (ADR-0007). */
  personal: ProfileSection
}

export function profileSections (profile: Profile): ProfileSections {
  return {
    profile: section(publicItems(profile)),
    // Only `profile.personal`, so nothing else can land in the private section.
    personal: section(personalItems(profile.personal))
  }
}

function publicItems (profile: Profile): ProfileItem[] {
  return [
    ...item('First name / known as', profile.name),
    ...item('Order of birth', profile.birthOrder === null ? null : String(profile.birthOrder)),
    ...item('Identifies as', profile.gender && GENDER_LABELS[profile.gender]),
    ...item('Full name', profile.fullName),
    ...items('Also known as', profile.altNames),
    ...item('Date of birth', profile.dateOfBirth && formatDate(profile.dateOfBirth)),
    ...item('Place of birth', profile.placeOfBirth),
    ...item(`About ${profile.name}`.trim(), profile.description),
    ...item('Profession', profile.profession),
    ...items('Skill/qualification', profile.skills),
    ...items('Place of education', profile.education)
  ]
}

function personalItems (personal: PersonalInformation): ProfileItem[] {
  return [
    ...item('Email', personal.email),
    ...item('Phone', personal.phone),
    ...item('Address', personal.address),
    ...item('Postcode', personal.postcode),
    ...item('City', personal.city),
    ...item('Country', personal.country)
  ]
}

/** As the create-profile gender picker words them. */
const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  unknown: 'Unknown'
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December']

/**
 * A date as given, with no made-up parts: `1952`, `March 1952`,
 * `9 March 1952`. An `X` marks an unknown digit (EDTF, as the date picker
 * offers): an unknown year shows as typed (`192X`), an unknown month is left
 * out, and a day shows only with its month.
 */
export function formatDate (date: string): string {
  const [year, month, day] = date.split('-')
  const monthName = month && /^\d\d$/.test(month) ? MONTHS[Number(month) - 1] : undefined
  const dayText = monthName && day && day !== 'XX' ? day.replace(/^0/, '') : undefined
  const yearText = year && year !== 'XXXX' ? year : undefined
  return [dayText, monthName, yearText].filter(Boolean).join(' ')
}

function item (label: string, value: string | null): ProfileItem[] {
  const trimmed = value?.trim()
  return trimmed ? [{ label, value: trimmed }] : []
}

function items (label: string, values: string[]): ProfileItem[] {
  return values.flatMap(value => item(label, value))
}

function section (items: ProfileItem[]): ProfileSection {
  return { items, isEmpty: items.length === 0 }
}
