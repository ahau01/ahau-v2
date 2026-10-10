/**
 * Cases for the four cross-cutting semantics, plus the cascades that exist
 * only in doc comments.
 *
 * These are the promises the contract makes beyond any single operation, and
 * the ones an adapter is most likely to satisfy by accident rather than by
 * design. Each cites the purpose or decision it derives from.
 */

import { isEnforced } from '../../contract/index.js'
import type { ConformanceCase } from '../report.js'
import { declined, fail, pass } from '../report.js'

/** A group the suite may write into. Adapters run mutating cases on a scratch instance. */
const anyGroup = async (backend: Parameters<ConformanceCase['run']>[0]) => {
  const groups = await backend.group.listGroups()
  return groups[0]?.id ?? null
}

export const semanticsCases: readonly ConformanceCase[] = [
  {
    id: 'semantics/retraction-hides-without-erasing',
    operation: 'person.retractPerson',
    source: 'deletePerson',
    purpose:
      'Remove a person from the record, tombstoning both their profile and the whakapapa links that reference them.',
    mutates: true,
    async run (backend) {
      const people = await backend.person.listPeople(
        (await anyGroup(backend)) ?? ('' as never)
      )
      const target = people[0]
      if (!target) return fail('no readable person to retract')

      await backend.person.retractPerson(target.id, 'conformance')
      const after = await backend.person.getPerson(target.id)
      if (after !== null) return fail('a retracted person is still returned by reads')

      // Retraction is not deletion: acting on it again must still be possible.
      const again = await backend.person.retractPerson(target.id, 'conformance')
      if (!again.id) return fail('the record appears to have been erased, not retracted')
      return pass()
    }
  },
  {
    id: 'semantics/retraction-cascades-to-links',
    operation: 'person.retractPerson',
    source: 'deletePerson',
    purpose:
      'Remove a person from the record, tombstoning both their profile and the whakapapa links that reference them.',
    mutates: true,
    async run (backend) {
      const group = await anyGroup(backend)
      if (!group) return fail('no readable group')
      const people = await backend.person.listPeople(group)
      const root = people[0]
      if (!root) return fail('no readable person')

      const before = await backend.whakapapa.getFamily({ from: root.id, depth: 1 })
      if (!before.supported) return declined(before.capability, before.detail)
      const edge = before.value[0]
      if (!edge) return pass() // nothing linked; the cascade is vacuously satisfied

      await backend.person.retractPerson(edge.child, 'conformance')
      const after = await backend.whakapapa.getFamily({ from: root.id, depth: 1 })
      if (!after.supported) return declined(after.capability, after.detail)
      if (after.value.some(l => l.id === edge.id)) {
        return fail('a link to a retracted person is still returned')
      }
      return pass()
    }
  },
  {
    id: 'semantics/write-acknowledgement-is-honest',
    operation: 'link.saveLink',
    source: 'saveLink',
    purpose:
      'Create or update a link between two people - the act of recording a relationship in the whakapapa.',
    mutates: true,
    async run (backend) {
      const group = await anyGroup(backend)
      if (!group) return fail('no readable group')
      const people = await backend.person.listPeople(group)
      const [a, b] = people
      if (!a || !b) return fail('need two people to link')

      const result = await backend.link.saveLink(null, {
        parent: a.id,
        child: b.id,
        relationshipType: 'conformance',
        isPartner: false,
        visibility: { scope: 'group', group }
      })
      const ack = result.acknowledgement
      if (ack.status === 'partial' && ack.accepted > ack.attempted) {
        return fail('partial acknowledgement reports more accepted than attempted')
      }
      if (ack.status === 'partial' && ack.failures.length === 0) {
        return fail('partial acknowledgement reports no failures, so it is not partial')
      }
      return pass()
    }
  },
  {
    id: 'semantics/paired-write-matches-declared-atomicity',
    operation: 'group.updateGroup',
    source: 'updateTribe',
    purpose: "Update both halves of a group's paired profile at once.",
    mutates: true,
    async run (backend) {
      const group = await anyGroup(backend)
      if (!group) return fail('no readable group')
      const face = { name: 'Conformance', description: null, avatar: null }
      const result = await backend.group.updateGroup(group, face, face)

      if (backend.capabilities.atomicMultiWrite && result.status !== 'atomic') {
        return fail('backend declares atomicMultiWrite but reported an independent write')
      }
      if (!backend.capabilities.atomicMultiWrite && result.status === 'atomic') {
        return fail('backend reported atomicity it does not declare')
      }
      return pass()
    }
  },
  {
    id: 'semantics/traversal-respects-declared-depth',
    operation: 'whakapapa.getDescendants',
    source: 'getDescendantLinks',
    purpose:
      'Fetch the child and partner links descending from a person, to draw the tree below them.',
    mutates: false,
    async run (backend) {
      const group = await anyGroup(backend)
      if (!group) return fail('no readable group')
      const people = await backend.person.listPeople(group)
      const root = people[0]
      if (!root) return fail('no readable person')

      const limit = backend.capabilities.maxTraversalDepth
      if (limit === null) {
        const deep = await backend.whakapapa.getDescendants({ from: root.id, depth: 99 })
        return deep.supported
          ? pass()
          : fail('backend declares unbounded traversal but declined a deep walk')
      }

      const beyond = await backend.whakapapa.getDescendants({
        from: root.id,
        depth: limit + 1
      })
      if (beyond.supported) {
        return fail(`backend declares maxTraversalDepth ${limit} but served a deeper walk`)
      }
      const within = await backend.whakapapa.getDescendants({ from: root.id, depth: limit })
      return within.supported
        ? pass()
        : fail('backend declined a walk within its own declared depth')
    }
  },
  {
    id: 'semantics/declared-enforcement-matches-behaviour',
    operation: 'submissions.approveSubmissionFields',
    source: 'approveEditGroupPersonSubmission',
    purpose:
      'Approve a proposed edit to a person profile, accepting only the fields the reviewer allows.',
    mutates: true,
    async run (backend) {
      const pending = await backend.submissions.listSubmissions(null)
      const submission = pending.find(s => s.proposal.kind === 'edit-person')
      if (!submission) return pass() // nothing to approve; vacuously satisfied
      if (submission.proposal.kind !== 'edit-person') return pass()

      const target = submission.proposal.target
      const before = await backend.person.getPerson(target)
      const proposed = submission.proposal.person.preferredName

      // Allow a field the proposal does not change.
      const result = await backend.submissions.approveSubmissionFields(
        submission.id,
        ['legalName'],
        null
      )

      if (result.enforcement !== backend.capabilities.fieldLevelApproval) {
        return fail('approval reports enforcement differing from the declared capability')
      }

      const after = await backend.person.getPerson(target)
      const changed = before?.preferredName !== after?.preferredName

      if (isEnforced(result.enforcement) && changed) {
        return fail(
          'backend declares field-level approval as enforced but applied a field outside allowedFields'
        )
      }
      if (!isEnforced(result.enforcement)) {
        return declined(
          'fieldLevelApproval',
          `field restrictions are ${result.enforcement}; the change landed regardless${changed ? '' : ' (and happened not to differ)'}`
        )
      }
      return pass()
    }
  },
  {
    id: 'semantics/approval-states-what-it-applied',
    operation: 'submissions.approveSubmission',
    source: 'approveSubmission',
    purpose: 'Approve a proposal wholesale, accepting it as submitted.',
    mutates: true,
    async run (backend) {
      const pending = await backend.submissions.listSubmissions(null)
      const submission = pending[0]
      if (!submission) return pass()

      const result = await backend.submissions.approveSubmission(submission.id, null)
      if (result.submission !== submission.id) {
        return fail('approval names a different submission than the one approved')
      }
      if (!Array.isArray(result.applied)) {
        return fail('approval does not report what it applied')
      }
      const stillPending = await backend.submissions.listSubmissions(null)
      if (stillPending.some(s => s.id === submission.id)) {
        return fail('an approved proposal is still listed as awaiting review')
      }
      return pass()
    }
  },
  {
    id: 'semantics/visibility-excludes-non-members',
    operation: 'person.listPeople',
    source: 'loadPersonList',
    purpose:
      'List the people in a tribe, with an admin variant returning the fuller record available to kaitiaki.',
    mutates: false,
    async run (backend) {
      const viewer = await backend.person.getViewer()
      const group = await anyGroup(backend)
      if (!group) return fail('no readable group')

      const belongs = viewer.memberships.some(m => m.group === group)
      const people = await backend.person.listPeople(group)

      if (!belongs && people.length > 0) {
        return fail('group-scoped people are visible to a viewer who does not belong')
      }
      if (!isEnforced(backend.capabilities.membershipEnforcement)) {
        return declined(
          'membershipEnforcement',
          'membership is not enforced, so visibility is advisory rather than guaranteed'
        )
      }
      return pass()
    }
  }
]
