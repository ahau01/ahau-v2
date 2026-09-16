/**
 * In-memory reference implementation of the contract.
 *
 * Its job is to find out whether the contract can be satisfied at all, and
 * where it resists. Operations are implemented as specified rather than as
 * convenient; where the contract was awkward the friction is recorded in
 * docs/contract-friction.md instead of being smoothed away here.
 *
 * Passing under this backend shows the contract is implementable. It does not
 * show it is portable: an in-process store can enforce anything.
 */

import {
  type Capabilities,
  type Supported,
  supported,
  unsupported
} from '../contract/capabilities.js'
import {
  asRecordId,
  type ApprovalResult,
  type PairedWriteResult,
  type PermissionWriteResult,
  type RecordId,
  type TraversalRequest,
  type WriteAcknowledgement,
  type WriteResult
} from '../contract/semantics.js'
import type { DataAccess } from '../contract/operations/index.js'
import { asGroupId } from '../contract/types/index.js'
import type {
  Collection as CollectionRecord,
  Credential,
  Group,
  GroupApplication,
  GroupId,
  GroupSettings,
  IdentityId,
  Membership,
  Person,
  Profile,
  Story,
  Submission,
  SubmissionProposal,
  Viewer,
  WhakapapaLink,
  WhakapapaView
} from '../contract/types/index.js'
import * as seed from './data.js'
import { fullyEnforced } from './profiles.js'
import {
  Collection,
  MembershipRegister,
  isReadable,
  nextId
} from './store.js'

export interface FixtureOptions {
  readonly viewer?: IdentityId
  readonly capabilities?: Capabilities
}

const TODAY = '2026-09-17'

export function createFixtureBackend (options: FixtureOptions = {}): DataAccess {
  const capabilities = options.capabilities ?? fullyEnforced
  const viewer = options.viewer ?? seed.IDENTITIES.kaitiaki

  const people = new Collection<Person>(seed.PEOPLE)
  const links = new Collection<WhakapapaLink>(seed.LINKS)
  const profiles = new Collection<Profile>(seed.PROFILES)
  const views = new Collection<WhakapapaView>(seed.WHAKAPAPA_VIEWS)
  const stories = new Collection<Story>(seed.STORIES)
  const collections = new Collection<CollectionRecord>(seed.COLLECTIONS)
  const submissions = new Collection<Submission>(seed.SUBMISSIONS)
  const applications = new Collection<GroupApplication>(seed.APPLICATIONS)
  const credentials = new Collection<Credential>(seed.CREDENTIALS)
  const settings = new Collection<GroupSettings>(seed.GROUP_SETTINGS)
  const members = new MembershipRegister(seed.MEMBERSHIPS)
  const groups = new Map<GroupId, Group>([
    [seed.GROUPS.main, seed.GROUP],
    [seed.GROUPS.sub, seed.SUBGROUP]
  ])
  const subgroupParents = new Map(seed.SUBGROUP_PARENTS)
  const storehouses = [
    { id: seed.GROUPS.main as unknown as never, name: null, blocked: false }
  ]
  void storehouses

  const seen = (): readonly Membership[] => members.for(viewer)

  /**
   * How a write is acknowledged.
   *
   * A backend with no atomicity guarantee also has no single point that
   * accepts a write, so the degraded profile reports partial acceptance. That
   * is a simulation for the caller's benefit -- the store itself always
   * commits -- and exists so both branches of WriteAcknowledgement are
   * reachable without a real relay.
   */
  const acknowledge = (): WriteAcknowledgement =>
    capabilities.atomicMultiWrite
      ? { status: 'committed' }
      : { status: 'partial', accepted: 1, attempted: 2, failures: [{ target: 'relay-2', reason: 'no response' }] }

  const wrote = (id: RecordId): WriteResult => ({ id, acknowledgement: acknowledge() })

  /** A write carrying a permission rule reports how strongly it was applied. */
  const wroteUnderRule = (id: RecordId, rule: 'membershipEnforcement' | 'fieldLevelApproval'): PermissionWriteResult => ({
    id,
    acknowledgement: acknowledge(),
    enforcement: capabilities[rule]
  })

  /**
   * Approval applies the proposed change, per the contract.
   *
   * The fixture reports nothing applied, and that is honest rather than lazy:
   * the Submission record carries targetType and target but no proposal
   * payload, so there is literally nothing recorded to apply. That gap is the
   * remaining half of friction finding 1 and needs a decision about how
   * proposals are represented before any backend can satisfy this properly.
   */
  /**
   * Apply a proposal. Under enforced field approval only the allowed fields
   * are written; under advisory the restriction is recorded but not applied,
   * which is the difference the capability describes.
   */
  const applyProposal = (
    proposal: SubmissionProposal,
    allowedFields: readonly string[] | null
  ): readonly RecordId[] => {
    const restrict = <T extends object>(fields: T): Partial<T> => {
      if (allowedFields === null) return fields
      if (capabilities.fieldLevelApproval !== 'enforced') return fields
      return Object.fromEntries(
        Object.entries(fields).filter(([key]) => allowedFields.includes(key))
      ) as Partial<T>
    }
    switch (proposal.kind) {
      case 'edit-person': {
        const existing = people.get(proposal.target)
        if (!existing) return []
        people.put({ ...existing, ...restrict(proposal.person) })
        return [proposal.target]
      }
      case 'new-person': {
        const id = nextId('person')
        people.put({ ...seed.PEOPLE[0]!, ...proposal.person, id })
        return [id]
      }
      case 'new-link': {
        const id = nextId('link')
        links.put({
          status: { state: 'active' },
          visibility: proposal.link.visibility,
          provenance: { author: viewer, recordedAt: TODAY },
          id,
          parent: proposal.link.parent,
          child: proposal.link.child,
          relationshipType: proposal.link.relationshipType,
          isPartner: proposal.link.isPartner
        })
        return [id]
      }
      case 'edit-whakapapa-view': {
        const existing = views.get(proposal.target)
        if (!existing) return []
        views.put({ ...existing, ...restrict(proposal.view) })
        return [proposal.target]
      }
      case 'retraction': {
        people.retract(proposal.target, TODAY, proposal.reason)
        stories.retract(proposal.target, TODAY, proposal.reason)
        return [proposal.target]
      }
    }
  }

  const approved = (submission: RecordId, applied: readonly RecordId[]): ApprovalResult => ({
    submission,
    acknowledgement: acknowledge(),
    applied,
    enforcement: capabilities.fieldLevelApproval
  })

  const pairedWrite = (ids: readonly RecordId[]): PairedWriteResult =>
    capabilities.atomicMultiWrite
      ? { status: 'atomic', ids }
      : {
          status: 'independent',
          parts: ids.map((id, index) => ({
            part: index === 0 ? 'public' : 'private',
            outcome:
              index === 0
                ? { ok: true as const, id }
                : { ok: false as const, reason: 'second write not acknowledged' }
          }))
        }

  /** Breadth-first walk over links, honouring the declared depth limit. */
  const walk = (
    request: TraversalRequest,
    edges: (from: RecordId) => readonly WhakapapaLink[]
  ): Supported<readonly WhakapapaLink[]> => {
    const limit = capabilities.maxTraversalDepth
    const asked = request.depth ?? Infinity
    if (limit !== null && asked > limit) {
      return unsupported(
        'maxTraversalDepth',
        `walk of depth ${asked} requested; this backend serves at most ${limit}`
      )
    }
    const depth = Math.min(asked, limit ?? Infinity)
    const found: WhakapapaLink[] = []
    const visited = new Set<string>([request.from])
    let frontier: RecordId[] = [request.from]
    for (let step = 0; step < depth && frontier.length > 0; step++) {
      const next: RecordId[] = []
      for (const node of frontier) {
        for (const edge of edges(node)) {
          if (!isReadable(edge, viewer, seen())) continue
          if (found.some(f => f.id === edge.id)) continue
          found.push(edge)
          if (!visited.has(edge.child)) {
            visited.add(edge.child)
            next.push(edge.child)
          }
        }
      }
      frontier = next
    }
    return supported(found)
  }

  const readableGroup = (id: GroupId): Group | null => {
    const group = groups.get(id)
    if (!group) return null
    return isReadable(group.private, viewer, seen()) || isReadable(group.public, viewer, seen())
      ? group
      : null
  }

  return {
    capabilities,

    person: {
      async getViewer (): Promise<Viewer> {
        return { identity: viewer, memberships: seen() }
      },
      async getPerson (id) {
        return people.readableOne(id, viewer, seen())
      },
      async getPersonCustomFields (id) {
        return people.readableOne(id, viewer, seen())?.customFields ?? []
      },
      async savePerson (given, input) {
        const id = given ?? nextId('person')
        const existing = people.get(id)
        people.put({
          ...(existing ?? seed.PEOPLE[0]!),
          ...input,
          id,
          customFields: input.customFields
        })
        return wrote(id)
      },
      async findPeopleByName (name, group) {
        if (!capabilities.nameSearch) {
          return unsupported('nameSearch', 'this backend provides no text search')
        }
        void group
        const needle = name.toLowerCase()
        return supported(
          people
            .readable(viewer, seen())
            .filter(p => (p.preferredName ?? '').toLowerCase().includes(needle))
        )
      },
      async retractPerson (id, reason) {
        people.retract(id, TODAY, reason)
        // The person's links go too: that is what the source accessor did, and
        // the contract's doc comment says so.
        for (const edge of links.all()) {
          if (edge.parent === id || edge.child === id) {
            links.retract(edge.id, TODAY, 'person retracted')
          }
        }
        return wrote(id)
      },
      async listPeople (group) {
        void group
        return people.readable(viewer, seen())
      }
    },

    profile: {
      async getProfile (id) {
        return profiles.readableOne(id, viewer, seen())
      }
    },

    whakapapa: {
      async getWhakapapaView (id) {
        return views.readableOne(id, viewer, seen())
      },
      async listWhakapapaViews (group) {
        return views
          .readable(viewer, seen())
          .filter(v => group === null || v.group === group)
      },
      async saveWhakapapaView (given, input) {
        const id = given ?? nextId('view')
        const existing = views.get(id) ?? seed.WHAKAPAPA_VIEWS[0]!
        views.put({ ...existing, ...input, id })
        return wrote(id)
      },
      async getDescendants (request) {
        return walk(request, from => links.all().filter(l => l.parent === from && !l.isPartner))
      },
      async getFamily (request) {
        return walk(request, from =>
          links.all().filter(l => l.parent === from || l.child === from)
        )
      }
    },

    link: {
      async saveLink (given, input) {
        const id = given ?? nextId('link')
        links.put({
          status: { state: 'active' },
          visibility: input.visibility,
          provenance: { author: viewer, recordedAt: TODAY },
          id,
          parent: input.parent,
          child: input.child,
          relationshipType: input.relationshipType,
          isPartner: input.isPartner
        })
        return wrote(id)
      },
      async findLink (parent, child, isPartner) {
        return (
          links
            .readable(viewer, seen())
            .find(l => l.parent === parent && l.child === child && l.isPartner === isPartner) ??
          null
        )
      }
    },

    group: {
      async getGroup (id) {
        return readableGroup(id)
      },
      async listGroups () {
        return [...groups.values()].filter(
          g => isReadable(g.public, viewer, seen()) || isReadable(g.private, viewer, seen())
        )
      },
      async createGroup (input) {
        const group = asGroupId(`group-${nextId('new')}`)
        const face = {
          status: { state: 'active' as const },
          visibility: { scope: 'group' as const, group },
          provenance: { author: viewer, recordedAt: TODAY },
          id: nextId('group-face'),
          name: input.name,
          description: input.description,
          avatar: input.avatar
        }
        groups.set(group, { id: group, public: { ...face, visibility: { scope: 'public' } }, private: face })
        members.add({ identity: viewer, group, role: 'kaitiaki', since: TODAY, until: null })
        return { id: group, acknowledgement: acknowledge() }
      },
      async saveGroupProfile (group, visibility, input) {
        const existing = groups.get(group)
        if (!existing) return wrote(nextId('group-face'))
        const face = visibility.scope === 'public' ? 'public' : 'private'
        // input.id is RecordId | null, the record's is RecordId, so it cannot
        // simply be spread. Recorded as friction: create and update share an
        // input type whose optional id collides with the record type.
        const updated: Group = {
          ...existing,
          [face]: { ...existing[face], ...input, visibility }
        }
        groups.set(group, updated)
        return wrote(updated[face].id)
      },
      async updateGroup (group, publicFace, privateFace) {
        const existing = groups.get(group)
        if (!existing) return pairedWrite([nextId('group-face'), nextId('group-face')])
        groups.set(group, {
          ...existing,
          public: { ...existing.public, ...publicFace },
          private: { ...existing.private, ...privateFace }
        })
        return pairedWrite([existing.public.id, existing.private.id])
      },
      async retractGroup (group, reason) {
        const existing = groups.get(group)
        if (!existing) return pairedWrite([])
        const retract = (state: Group['public']): Group['public'] => ({
          ...state,
          status: { state: 'retracted', at: TODAY, reason }
        })
        groups.set(group, {
          ...existing,
          public: retract(existing.public),
          private: retract(existing.private)
        })
        return pairedWrite([existing.public.id, existing.private.id])
      },
      async grantAdministration (group, identities) {
        for (const identity of identities) {
          members.add({ identity, group, role: 'kaitiaki', since: TODAY, until: null })
        }
        return wroteUnderRule(nextId('grant'), 'membershipEnforcement')
      },
      async listMembers (group) {
        return members.of(group)
      },
      async createSubgroup (parent, input) {
        const group = asGroupId(`subgroup-${nextId('new')}`)
        const face = {
          status: { state: 'active' as const },
          visibility: { scope: 'group' as const, group: parent },
          provenance: { author: viewer, recordedAt: TODAY },
          id: nextId('subgroup-face'),
          name: input.name,
          description: input.description,
          avatar: input.avatar
        }
        groups.set(group, { id: group, public: { ...face, visibility: { scope: 'public' } }, private: face })
        subgroupParents.set(group, parent)
        return { id: group, acknowledgement: acknowledge() }
      },
      async listSubgroups (parent) {
        return [...groups.values()].filter(g => subgroupParents.get(g.id) === parent)
      },
      async removeSubgroupMembership (subgroup, identity) {
        const parent = subgroupParents.get(subgroup)
        members.end(identity, subgroup, TODAY)
        if (parent) members.end(identity, parent, TODAY)
        return pairedWrite([nextId('membership'), nextId('membership')])
      }
    },

    settings: {
      async getGroupSettings (group) {
        return settings.readable(viewer, seen()).find(s => s.group === group) ?? null
      },
      async listGroupSettings () {
        return settings.readable(viewer, seen())
      },
      async saveGroupSettings (input) {
        const id = nextId('settings')
        const existing = seed.GROUP_SETTINGS[0]!
        settings.put({ ...existing, id, group: input.group })
        return wrote(id)
      },
      async retractGroupSettings (group) {
        const row = settings.all().find(s => s.group === group)
        if (row) settings.retract(row.id, TODAY, null)
        return wrote(row?.id ?? nextId('settings'))
      },
      async exportIdentity () {
        return { material: `fixture-identity:${viewer}`, format: 'fixture/opaque' }
      },
      async resetLocalStore () {
        // Explicitly not a retraction: it removes a store, not a record.
        for (const person of people.all()) people.retract(person.id, TODAY, 'local reset')
      }
    },

    story: {
      async getStory (id) {
        return stories.readableOne(id, viewer, seen())
      },
      async listStories () {
        return stories.readable(viewer, seen())
      },
      async listStoriesMentioning (request) {
        const limit = capabilities.maxTraversalDepth
        const asked = request.depth ?? 1
        if (limit !== null && asked > limit) {
          return unsupported('maxTraversalDepth', `depth ${asked} exceeds ${limit}`)
        }
        return supported(
          stories.readable(viewer, seen()).filter(s => s.mentions.includes(request.from))
        )
      },
      async saveStory (given, input) {
        const id = given ?? nextId('story')
        const existing = stories.get(id) ?? seed.STORIES[0]!
        stories.put({ ...existing, ...input, id, visibility: input.visibility })
        return wrote(id)
      },
      async retractStory (id, reason) {
        stories.retract(id, TODAY, reason)
        return wrote(id)
      }
    },

    collection: {
      async getCollection (id) {
        return collections.readableOne(id, viewer, seen())
      },
      async listCollections () {
        return collections.readable(viewer, seen())
      },
      async saveCollection (given, input) {
        const id = given ?? nextId('collection')
        const existing = collections.get(id) ?? seed.COLLECTIONS[0]!
        collections.put({ ...existing, ...input, id, visibility: input.visibility })
        return wrote(id)
      },
      async retractCollection (id, reason) {
        collections.retract(id, TODAY, reason)
        return wrote(id)
      },
      async setCollectionStoryLink (collection, story, included) {
        const existing = collections.get(collection)
        if (existing) {
          const stories = included
            ? [...new Set([...existing.stories, story])]
            : existing.stories.filter(s => s !== story)
          collections.put({ ...existing, stories })
        }
        return wrote(collection)
      }
    },

    artefact: {
      async saveArtefact (given, input) {
        void input
        return wrote(given ?? nextId('artefact'))
      },
      async retractArtefact (id, reason) {
        void reason
        return wrote(id)
      }
    },

    submissions: {
      async listSubmissions (group) {
        return submissions
          .readable(viewer, seen())
          .filter(s => group === null || s.group === group)
      },
      async proposeNewPerson (group, person, comment) {
        void group
        void person
        void comment
        return wrote(nextId('submission'))
      },
      async proposeEditPerson (group, target, person, comment) {
        void group
        void target
        void person
        void comment
        return wrote(nextId('submission'))
      },
      async proposeNewLink (group, link, comment) {
        void group
        void link
        void comment
        return wrote(nextId('submission'))
      },
      async proposeEditWhakapapaView (group, target, view, comment) {
        void group
        void target
        void view
        void comment
        return wrote(nextId('submission'))
      },
      async proposeRetraction (group, target, comment) {
        void group
        void target
        void comment
        return wrote(nextId('submission'))
      },
      async approveSubmission (id, comment) {
        void comment
        const submission = submissions.get(id)
        const applied = submission ? applyProposal(submission.proposal, null) : []
        submissions.retract(id, TODAY, 'approved')
        return approved(id, applied)
      },
      async approveSubmissionFields (id, allowedFields, comment) {
        void comment
        // Under an advisory backend the restriction is recorded but not
        // applied. The contract does not say what approval does to the target
        // record, which is recorded as friction.
        const submission = submissions.get(id)
        const applied = submission
          ? applyProposal(submission.proposal, allowedFields)
          : []
        submissions.retract(id, TODAY, 'approved with field restrictions')
        return approved(id, applied)
      },
      async rejectSubmission (id, comment) {
        void comment
        // Declining leaves the proposal visible, unlike retraction.
        return wrote(id)
      },
      async retractSubmission (id, reason) {
        submissions.retract(id, TODAY, reason)
        return wrote(id)
      },
      async linkSubmissions (parent, child) {
        const existing = submissions.get(parent)
        if (existing) {
          submissions.put({
            ...existing,
            dependencies: [...new Set([...existing.dependencies, child])]
          })
        }
        return wrote(parent)
      }
    },

    applications: {
      async applyToGroup (group, comment) {
        void comment
        const id = nextId('application')
        applications.put({
          status: { state: 'active' },
          visibility: { scope: 'group', group },
          provenance: { author: viewer, recordedAt: TODAY },
          id,
          group,
          applicant: viewer,
          reviewed: false
        })
        return wrote(id)
      },
      async acceptApplication (id, comment) {
        void comment
        const application = applications.get(id)
        if (application) {
          applications.put({ ...application, reviewed: true })
          members.add({
            identity: application.applicant,
            group: application.group,
            role: 'member',
            since: TODAY,
            until: null
          })
        }
        return wroteUnderRule(id, 'membershipEnforcement')
      },
      async declineApplication (id, comment) {
        void comment
        const application = applications.get(id)
        if (application) applications.put({ ...application, reviewed: true })
        return wrote(id)
      },
      async listPendingApplications (group) {
        return applications
          .readable(viewer, seen())
          .filter(a => a.group === group && !a.reviewed)
      },
      async offerMembershipCredential (group, identity) {
        void group
        const id = nextId('credential')
        credentials.put({
          status: { state: 'active' },
          visibility: { scope: 'restricted', audience: [identity] },
          provenance: { author: viewer, recordedAt: TODAY },
          id,
          subject: identity,
          kind: 'MembershipCredential'
        })
        return wrote(id)
      }
    },

    credentials: {
      async listCredentials () {
        return credentials.readable(viewer, seen())
      }
    },

    readiness: {
      async getReadiness () {
        return { ready: true, progress: 1 }
      }
    },

    storehouse: {
      async listStorehouses () {
        return []
      },
      async blockStorehouse (id) {
        void id
        return wrote(nextId('storehouse'))
      },
      async unblockStorehouse (id) {
        void id
        return wrote(nextId('storehouse'))
      }
    }
  }
}
