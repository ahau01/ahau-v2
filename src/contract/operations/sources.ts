/**
 * Which source accessor each contract operation answers for.
 *
 * Machine-readable so the coverage gate can prove every kept operation survived
 * into the contract, and that nothing was invented. Sources are exported
 * accessors from data-access-triage.json, plus the inline templates triaged
 * separately in data-access-leakage-triage.json and keyed by root field. Several entries are
 * many-to-one: where the triage recorded that accessors differed only in ways
 * the contract should not preserve, they collapse here.
 */
export const OPERATION_SOURCES: Readonly<Record<string, readonly string[]>> = {
  'person.getViewer': ['whoami'],
  'person.getPerson': ['getPerson'],
  'person.getPersonCustomFields': ['getPersonCustomFields'],
  'person.savePerson': ['savePerson'],
  'person.findPeopleByName': ['findPersonByName'],
  'person.retractPerson': ['deletePerson'],
  'person.listPeople': ['loadPersonList'],

  'profile.getProfile': ['getProfile'],

  'whakapapa.getWhakapapaView': ['getWhakapapaView'],
  'whakapapa.listWhakapapaViews': ['getWhakapapaViews'],
  'whakapapa.saveWhakapapaView': ['saveWhakapapaView'],
  'whakapapa.getDescendants': ['getDescendantLinks'],
  'whakapapa.getFamily': ['getFamilyLinks'],

  'link.saveLink': ['saveLink'],
  'link.findLink': ['whakapapaLink'],

  'group.getGroup': ['getTribe'],
  'group.listGroups': ['getTribes'],
  'group.createGroup': ['initGroup'],
  'group.saveGroupProfile': ['saveCommunity'],
  'group.updateGroup': ['updateTribe'],
  'group.retractGroup': ['deleteTribe'],
  'group.grantAdministration': ['addAdminsToGroup'],
  'group.listMembers': ['getMembers'],
  'group.createSubgroup': ['createSubGroup'],
  'group.listSubgroups': ['getSubGroups'],
  'group.removeSubgroupMembership': ['deleteSubGroup'],

  'settings.getGroupSettings': ['getSettings'],
  'settings.listGroupSettings': ['getAllSettings'],
  'settings.saveGroupSettings': ['saveSettings'],
  'settings.retractGroupSettings': ['deleteSettings'],
  'settings.exportIdentity': ['getBackup'],
  'settings.resetLocalStore': ['deleteAhau'],

  'story.getStory': ['getStory'],
  'story.listStories': ['getAllStories'],
  'story.listStoriesMentioning': ['getAllStoriesByMentions'],
  'story.saveStory': ['saveStory'],
  'story.retractStory': ['deleteStory'],

  'collection.getCollection': ['getCollection'],
  'collection.listCollections': ['getAllCollections'],
  'collection.saveCollection': ['saveCollection'],
  'collection.retractCollection': ['deleteCollection'],
  'collection.setCollectionStoryLink': ['saveCollectionStoryLink'],

  'artefact.saveArtefact': ['saveArtefact'],
  'artefact.retractArtefact': ['DELETE_ARTEFACT'],
  'artefact.uploadMedia': ['uploadFile'],

  'submissions.listSubmissions': ['getSubmissions'],
  'submissions.proposeNewPerson': ['proposeNewGroupPerson'],
  'submissions.proposeEditPerson': ['proposeEditGroupPerson'],
  'submissions.proposeNewLink': ['proposeNewWhakapapaLink'],
  'submissions.proposeEditWhakapapaView': ['proposeEditWhakapapaView'],
  'submissions.proposeRetraction': ['proposeTombstone'],
  'submissions.approveSubmission': ['approveSubmission'],
  // The four typed approvals collapse. They shared an identical signature and
  // differed only by payload type and mutation name, with the frontend
  // dispatching on a targetType the backend already held. Triage kept them
  // apart and recorded the collapse as a Milestone 2 decision; this is it.
  'submissions.approveSubmissionFields': [
    'approveEditGroupPersonSubmission',
    'approveEditWhakapapaViewSubmission',
    'approveNewGroupPersonSubmission',
    'approveNewWhakapapaLink'
  ],
  'submissions.rejectSubmission': ['rejectSubmission'],
  'submissions.retractSubmission': ['tombstoneSubmission'],
  'submissions.linkSubmissions': ['createSubmissionsLink'],

  'applications.applyToGroup': ['createGroupApplication'],
  'applications.acceptApplication': ['acceptGroupApplication'],
  'applications.declineApplication': ['declineGroupApplication'],
  'applications.listPendingApplications': ['listGroupApplications'],
  'applications.offerMembershipCredential': ['offerMembershipCredential'],

  'credentials.listCredentials': ['getAllCredentials'],
  'credentials.presentCredential': ['sendCredentialProof'],

  'readiness.getReadiness': ['getIndexes'],

  'storehouse.listStorehouses': ['getPatakas'],
  'storehouse.blockStorehouse': ['blockPataka'],
  'storehouse.unblockStorehouse': ['unblockPataka'],
  'storehouse.acceptInvite': ['acceptInvite'],
  'storehouse.listConnectedPeers': ['connectedPeers']
}
