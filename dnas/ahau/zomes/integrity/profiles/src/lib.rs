//! A person's own profile: their account of themselves, written by their
//! agent key. It is not the canonical record of that person; other people's
//! whakapapa records about them live elsewhere (CLAUDE.md rule 1).
//!
//! The owner is the agent who authored the entry. There is no owner field,
//! so a profile cannot claim to belong to someone other than its author.

use hdi::prelude::*;

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Profile {
    pub name: String,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Profile(Profile),
}

pub const ALREADY_HAS_PROFILE: &str = "This agent already has a profile";
pub const NOT_THE_AUTHOR: &str = "Only the author of a profile can change it";
pub const PROFILES_CANNOT_BE_DELETED: &str = "Profiles can't be deleted yet";

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, ()>()? {
        // Every authority that stores a profile op applies the same rules,
        // so a conductor that skips its own validation can't get a bad write
        // held as valid by the entry or agent-activity authorities.
        FlatOp::StoreRecord(OpRecord::CreateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
        })
        | FlatOp::StoreEntry(OpEntry::CreateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
        })
        | FlatOp::RegisterAgentActivity(OpActivity::CreateEntry {
            app_entry_type: Some(UnitEntryTypes::Profile),
            action,
        }) => validate_create_profile(&action),
        FlatOp::StoreEntry(OpEntry::UpdateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
            ..
        })
        | FlatOp::RegisterAgentActivity(OpActivity::UpdateEntry {
            app_entry_type: Some(UnitEntryTypes::Profile),
            action,
            ..
        }) => validate_by_original_author(&action.author, &action.original_action_address),
        FlatOp::RegisterAgentActivity(OpActivity::DeleteEntry { action, .. }) => validate_delete(&action),
        // Checked on both ops so that neither the author's record nor the
        // update metadata on the original can carry someone else's change.
        FlatOp::StoreRecord(OpRecord::UpdateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
            ..
        })
        | FlatOp::RegisterUpdate(OpUpdate::Entry {
            app_entry: EntryTypes::Profile(_),
            action,
        }) => validate_by_original_author(&action.author, &action.original_action_address),
        FlatOp::StoreRecord(OpRecord::DeleteEntry { action, .. })
        | FlatOp::RegisterDelete(OpDelete { action }) => validate_delete(&action),
        _ => Ok(ValidateCallbackResult::Valid),
    }
}

/// One profile per agent key: the author's chain before this action must
/// hold no other profile.
fn validate_create_profile(action: &Create) -> ExternResult<ValidateCallbackResult> {
    let profile_type: EntryType = UnitEntryTypes::Profile.try_into()?;
    let earlier = must_get_agent_activity(
        action.author.clone(),
        ChainFilter::new(action.prev_action.clone()),
    )?;
    let has_profile = earlier.iter().any(|activity| {
        matches!(
            activity.action.hashed.content,
            Action::Create(Create { ref entry_type, .. }) if *entry_type == profile_type
        )
    });
    if has_profile {
        return Ok(ValidateCallbackResult::Invalid(ALREADY_HAS_PROFILE.into()));
    }
    Ok(ValidateCallbackResult::Valid)
}

/// A profile is its author's own account of themselves (CLAUDE.md rule 1),
/// so only that author may change it.
fn validate_by_original_author(
    author: &AgentPubKey,
    original: &ActionHash,
) -> ExternResult<ValidateCallbackResult> {
    let original = must_get_action(original.clone())?;
    if original.action().author() != author {
        return Ok(ValidateCallbackResult::Invalid(NOT_THE_AUTHOR.into()));
    }
    Ok(ValidateCallbackResult::Valid)
}

/// Delete ops don't say what they delete, so look at the original. No one
/// may delete a profile yet: a deleted profile would read back as none, but
/// the one-profile rule would never let its author make another. Retraction
/// gets designed together with editing.
fn validate_delete(action: &Delete) -> ExternResult<ValidateCallbackResult> {
    let profile_type: EntryType = UnitEntryTypes::Profile.try_into()?;
    let original = must_get_action(action.deletes_address.clone())?;
    if original.action().entry_type() != Some(&profile_type) {
        return Ok(ValidateCallbackResult::Valid);
    }
    Ok(ValidateCallbackResult::Invalid(PROFILES_CANNOT_BE_DELETED.into()))
}

/// Every authority that receives a profile op must apply the same rules,
/// not only the record authority. A rogue zome can't reach these paths (its
/// own conductor validates first), so these call `validate` directly with
/// the host mocked.
#[cfg(test)]
mod tests {
    use super::*;
    use hdi::test_utils::short_hand::*;

    const OWNER: u8 = 1;
    const OTHER: u8 = 2;

    fn profile_type() -> EntryType {
        EntryType::App(AppEntryDef::new(0.into(), 0.into(), EntryVisibility::Public))
    }

    fn profile_entry() -> Entry {
        Entry::try_from(Profile { name: "Mere".into() }).unwrap()
    }

    fn create_profile(author: u8) -> Create {
        Create {
            author: ak(author),
            timestamp: Timestamp::from_micros(0),
            action_seq: 4,
            prev_action: ah(3),
            entry_type: profile_type(),
            entry_hash: eh(10),
            weight: Default::default(),
        }
    }

    fn update_profile(author: u8, original: ActionHash) -> Update {
        Update {
            author: ak(author),
            timestamp: Timestamp::from_micros(0),
            action_seq: 5,
            prev_action: ah(4),
            original_action_address: original,
            original_entry_address: eh(10),
            entry_type: profile_type(),
            entry_hash: eh(11),
            weight: Default::default(),
        }
    }

    fn signed(action: Action) -> SignedActionHashed {
        SignedHashed {
            hashed: HoloHashed { content: action, hash: ah(20) },
            signature: Signature([0u8; 64]),
        }
    }

    /// A stand-in conductor: the author's chain before this action is
    /// `earlier`, and any original an op points at is `original`.
    struct FakeHost {
        earlier: Vec<Action>,
        original: Option<Action>,
    }

    impl HdiT for FakeHost {
        fn zome_info(&self, _: ()) -> ExternResult<ZomeInfo> {
            Ok(ZomeInfo {
                name: "profiles_integrity".into(),
                id: 0.into(),
                properties: Default::default(),
                entry_defs: EntryDefs(vec![]),
                extern_fns: vec![],
                zome_types: ScopedZomeTypesSet {
                    entries: ScopedZomeTypes(vec![(0.into(), vec![0.into()])]),
                    links: ScopedZomeTypes(vec![]),
                },
            })
        }
        fn must_get_agent_activity(&self, _: MustGetAgentActivityInput) -> ExternResult<Vec<RegisterAgentActivity>> {
            Ok(self
                .earlier
                .iter()
                .map(|action| RegisterAgentActivity { action: signed(action.clone()), cached_entry: None })
                .collect())
        }
        fn must_get_action(&self, _: MustGetActionInput) -> ExternResult<SignedActionHashed> {
            Ok(signed(self.original.clone().expect("this test has no original action")))
        }
        fn verify_signature(&self, _: VerifySignature) -> ExternResult<bool> { unreachable!() }
        fn must_get_entry(&self, _: MustGetEntryInput) -> ExternResult<EntryHashed> { unreachable!() }
        fn must_get_valid_record(&self, _: MustGetValidRecordInput) -> ExternResult<Record> { unreachable!() }
        fn dna_info(&self, _: ()) -> ExternResult<DnaInfo> { unreachable!() }
        fn trace(&self, _: TraceMsg) -> ExternResult<()> { unreachable!() }
        fn x_salsa20_poly1305_decrypt(&self, _: XSalsa20Poly1305Decrypt) -> ExternResult<Option<XSalsa20Poly1305Data>> { unreachable!() }
        fn x_25519_x_salsa20_poly1305_decrypt(&self, _: X25519XSalsa20Poly1305Decrypt) -> ExternResult<Option<XSalsa20Poly1305Data>> { unreachable!() }
        fn ed_25519_x_salsa20_poly1305_decrypt(&self, _: Ed25519XSalsa20Poly1305Decrypt) -> ExternResult<XSalsa20Poly1305Data> { unreachable!() }
    }

    fn mock_host(earlier: Vec<Action>, original: Option<Action>) {
        set_hdi(FakeHost { earlier, original });
    }

    fn invalid(reason: &str) -> ValidateCallbackResult {
        ValidateCallbackResult::Invalid(reason.into())
    }

    #[test]
    fn store_entry_refuses_a_second_profile() {
        mock_host(vec![Action::Create(create_profile(OWNER))], None);
        let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), profile_entry());
        assert_eq!(validate(op).unwrap(), invalid(ALREADY_HAS_PROFILE));
    }

    #[test]
    fn store_entry_accepts_a_first_profile() {
        mock_host(vec![], None);
        let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), profile_entry());
        assert_eq!(validate(op).unwrap(), ValidateCallbackResult::Valid);
    }

    #[test]
    fn store_entry_refuses_an_update_by_someone_else() {
        mock_host(vec![], Some(Action::Create(create_profile(OWNER))));
        let op = s_entry(EntryCreationAction::Update(update_profile(OTHER, ah(9))), profile_entry());
        assert_eq!(validate(op).unwrap(), invalid(NOT_THE_AUTHOR));
    }

    #[test]
    fn store_entry_accepts_an_update_by_the_author() {
        mock_host(vec![], Some(Action::Create(create_profile(OWNER))));
        let op = s_entry(EntryCreationAction::Update(update_profile(OWNER, ah(9))), profile_entry());
        assert_eq!(validate(op).unwrap(), ValidateCallbackResult::Valid);
    }

    #[test]
    fn agent_activity_refuses_a_second_profile() {
        mock_host(vec![Action::Create(create_profile(OWNER))], None);
        let op = r_activity(Action::Create(create_profile(OWNER)));
        assert_eq!(validate(op).unwrap(), invalid(ALREADY_HAS_PROFILE));
    }

    #[test]
    fn agent_activity_refuses_deleting_a_profile() {
        mock_host(vec![], Some(Action::Create(create_profile(OWNER))));
        let op = r_activity(Action::Delete(Delete {
            author: ak(OWNER),
            timestamp: Timestamp::from_micros(0),
            action_seq: 5,
            prev_action: ah(4),
            deletes_address: ah(9),
            deletes_entry_address: eh(10),
            weight: Default::default(),
        }));
        assert_eq!(validate(op).unwrap(), invalid(PROFILES_CANNOT_BE_DELETED));
    }
}
