/**
 * Sample whakapapa for the fixture backend.
 *
 * Every person, group and story here is invented. No real whakapapa enters
 * this repository, and none should: genealogical records belong to the
 * communities they describe, not to a test fixture.
 *
 * The shape is chosen to exercise the contract's harder promises rather than
 * to be large -- several generations of links, a retracted record, a paired
 * public/private group, a subgroup, a story with mentions, and both a pending
 * submission and a pending application.
 */

import { asRecordId, type RecordId } from '../contract/semantics.js'
import {
  asGroupId,
  asIdentityId,
  type Collection,
  type Credential,
  type Group,
  type GroupApplication,
  type GroupId,
  type GroupSettings,
  type IdentityId,
  type Membership,
  type Person,
  type Profile,
  type RecordMeta,
  type Story,
  type Submission,
  type WhakapapaLink,
  type WhakapapaView
} from '../contract/types/index.js'

export const IDENTITIES = {
  kaitiaki: asIdentityId('identity-kaitiaki'),
  member: asIdentityId('identity-member'),
  outsider: asIdentityId('identity-outsider')
} as const

export const GROUPS = {
  main: asGroupId('group-te-kohanga'),
  sub: asGroupId('group-te-kohanga-whanau')
} as const

const id = (raw: string): RecordId => asRecordId(raw)

/** Visible to members of the main group; the ordinary case. */
const inGroup = (author: IdentityId): RecordMeta => ({
  status: { state: 'active' },
  visibility: { scope: 'group', group: GROUPS.main },
  provenance: { author, recordedAt: '2026-03-01' }
})

const publicly = (author: IdentityId): RecordMeta => ({
  status: { state: 'active' },
  visibility: { scope: 'public' },
  provenance: { author, recordedAt: '2026-03-01' }
})

const person = (
  key: string,
  preferredName: string,
  extra: Partial<Person> = {}
): Person => ({
  ...inGroup(IDENTITIES.kaitiaki),
  id: id(key),
  preferredName,
  legalName: null,
  gender: null,
  birthOrder: null,
  aliveInterval: null,
  deceased: false,
  avatar: null,
  customFields: [],
  ...extra
})

/** Three generations, so a descendant walk has somewhere to go. */
export const PEOPLE: readonly Person[] = [
  person('person-rangi', 'Rangi', { deceased: true, aliveInterval: '1920/1994' }),
  person('person-hine', 'Hine', { deceased: true, aliveInterval: '1924/2001' }),
  person('person-tane', 'Tāne', { birthOrder: 1 }),
  person('person-ngaire', 'Ngaire', { birthOrder: 2 }),
  person('person-mere', 'Mere', {
    customFields: [{ key: 'rohe', value: 'Te Tai Tokerau' }]
  }),
  person('person-ari', 'Ari'),
  // Retracted: must be absent from reads while remaining in the store.
  person('person-withdrawn', 'Withdrawn Record', {
    status: { state: 'retracted', at: '2026-04-02', reason: 'added in error' }
  })
]

const link = (
  key: string,
  parent: string,
  child: string,
  relationshipType: string,
  isPartner = false
): WhakapapaLink => ({
  ...inGroup(IDENTITIES.kaitiaki),
  id: id(key),
  parent: id(parent),
  child: id(child),
  relationshipType,
  isPartner
})

export const LINKS: readonly WhakapapaLink[] = [
  link('link-rangi-hine', 'person-rangi', 'person-hine', 'partner', true),
  link('link-rangi-tane', 'person-rangi', 'person-tane', 'birth'),
  link('link-rangi-ngaire', 'person-rangi', 'person-ngaire', 'birth'),
  link('link-tane-mere', 'person-tane', 'person-mere', 'partner', true),
  link('link-tane-ari', 'person-tane', 'person-ari', 'birth')
]

export const GROUP: Group = {
  id: GROUPS.main,
  public: {
    ...publicly(IDENTITIES.kaitiaki),
    id: id('group-face-public'),
    name: 'Te Kōhanga',
    description: 'A fictional community, for testing only.',
    avatar: null
  },
  private: {
    ...inGroup(IDENTITIES.kaitiaki),
    id: id('group-face-private'),
    name: 'Te Kōhanga',
    description: 'Members-only face of the same fictional community.',
    avatar: null
  }
}

export const SUBGROUP: Group = {
  id: GROUPS.sub,
  public: {
    ...publicly(IDENTITIES.kaitiaki),
    id: id('subgroup-face-public'),
    name: 'Te Kōhanga Whānau',
    description: 'A fictional subgroup.',
    avatar: null
  },
  private: {
    ...inGroup(IDENTITIES.kaitiaki),
    id: id('subgroup-face-private'),
    name: 'Te Kōhanga Whānau',
    description: null,
    avatar: null
  }
}

export const SUBGROUP_PARENTS: ReadonlyMap<GroupId, GroupId> = new Map([
  [GROUPS.sub, GROUPS.main]
])

export const MEMBERSHIPS: readonly Membership[] = [
  {
    identity: IDENTITIES.kaitiaki,
    group: GROUPS.main,
    role: 'kaitiaki',
    since: '2024-01-01',
    until: null
  },
  {
    identity: IDENTITIES.member,
    group: GROUPS.main,
    role: 'member',
    since: '2025-06-01',
    until: null
  }
  // IDENTITIES.outsider belongs to nothing, so group-scoped records must be
  // invisible to them.
]

export const PROFILES: readonly Profile[] = [
  {
    ...inGroup(IDENTITIES.kaitiaki),
    id: id('profile-kaitiaki'),
    identity: IDENTITIES.kaitiaki,
    group: GROUPS.main,
    preferredName: 'Rangi (kaitiaki)',
    avatar: null
  }
]

export const WHAKAPAPA_VIEWS: readonly WhakapapaView[] = [
  {
    ...inGroup(IDENTITIES.kaitiaki),
    id: id('view-main'),
    group: GROUPS.main,
    name: 'Descendants of Rangi',
    description: null,
    focus: id('person-rangi'),
    ignoredProfiles: [],
    importantRelationships: [],
    recordCount: PEOPLE.length
  }
]

export const STORIES: readonly Story[] = [
  {
    ...inGroup(IDENTITIES.member),
    id: id('story-hui'),
    title: 'The hui at the marae',
    description: 'A fictional gathering.',
    artefacts: [],
    mentions: [id('person-tane'), id('person-mere')]
  },
  {
    ...inGroup(IDENTITIES.member),
    id: id('story-river'),
    title: 'By the river',
    description: null,
    artefacts: [],
    mentions: [id('person-tane')]
  }
]

export const COLLECTIONS: readonly Collection[] = [
  {
    ...inGroup(IDENTITIES.member),
    id: id('collection-gatherings'),
    name: 'Gatherings',
    stories: [id('story-hui')]
  }
]

export const SUBMISSIONS: readonly Submission[] = [
  {
    ...inGroup(IDENTITIES.member),
    id: id('submission-pending'),
    group: GROUPS.main,
    targetType: 'edit-person',
    target: id('person-mere'),
    comments: [{ author: IDENTITIES.member, comment: 'Correcting a spelling.' }],
    dependencies: []
  }
]

export const APPLICATIONS: readonly GroupApplication[] = [
  {
    ...inGroup(IDENTITIES.kaitiaki),
    id: id('application-pending'),
    group: GROUPS.main,
    applicant: IDENTITIES.outsider,
    reviewed: false
  }
]

export const CREDENTIALS: readonly Credential[] = [
  {
    ...inGroup(IDENTITIES.kaitiaki),
    id: id('credential-membership'),
    subject: IDENTITIES.member,
    kind: 'MembershipCredential'
  }
]

export const GROUP_SETTINGS: readonly GroupSettings[] = [
  { ...inGroup(IDENTITIES.kaitiaki), id: id('settings-main'), group: GROUPS.main }
]
