//! Private, author-owned accounts of relatives and parent-child relationships.

use hdi::prelude::*;

#[derive(Clone, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub enum PersonRef {
    Me,
    Relative(ActionHash),
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub enum Direction {
    Parent,
    Child,
}

#[hdk_entry_helper]
#[derive(Clone, PartialEq, Eq)]
pub struct Relative {
    pub name: String,
    /// Random bytes prevent the public private-entry hash being a direct hash of a guessed name.
    pub nonce: Vec<u8>,
}

#[hdk_entry_helper]
#[derive(Clone, PartialEq, Eq)]
pub struct Relationship {
    pub parent: PersonRef,
    pub child: PersonRef,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    #[entry_type(visibility = "private")]
    Relative(Relative),
    #[entry_type(visibility = "private")]
    Relationship(Relationship),
}

pub const WHAKAPAPA_NEEDS_PROFILE: &str = "Whakapapa needs a profile first";
pub const NOT_THE_AUTHOR: &str = "Only the author of a whakapapa entry can change it";
pub const UPDATE_MUST_POINT_AT_ORIGINAL: &str =
    "A whakapapa update must point at its first version";
pub const RELATIONSHIP_CANNOT_BE_UPDATED: &str = "A relationship cannot be updated";
// Keep in sync with the profile zome and entry order in both DNA manifests.
const PROFILE_ZOME_INDEX: u8 = 0;
const PROFILE_ENTRY_INDEX: u8 = 0;

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, ()>()? {
        FlatOp::StoreRecord(OpRecord::CreatePrivateEntry {
            app_entry_type,
            action,
        })
        | FlatOp::RegisterAgentActivity(OpActivity::CreatePrivateEntry {
            app_entry_type: Some(app_entry_type),
            action,
        }) if matches!(
            app_entry_type,
            UnitEntryTypes::Relative | UnitEntryTypes::Relationship
        ) =>
        {
            validate_create(&action)
        }
        FlatOp::StoreRecord(OpRecord::UpdatePrivateEntry {
            app_entry_type,
            action,
            ..
        })
        | FlatOp::RegisterAgentActivity(OpActivity::UpdatePrivateEntry {
            app_entry_type: Some(app_entry_type),
            action,
            ..
        })
        | FlatOp::RegisterUpdate(OpUpdate::PrivateEntry {
            app_entry_type,
            action,
            ..
        }) if matches!(
            app_entry_type,
            UnitEntryTypes::Relative | UnitEntryTypes::Relationship
        ) =>
        {
            validate_update(&action)
        }
        FlatOp::StoreRecord(OpRecord::DeleteEntry { action, .. })
        | FlatOp::RegisterDelete(OpDelete { action })
        | FlatOp::RegisterAgentActivity(OpActivity::DeleteEntry { action, .. }) => {
            validate_delete(&action)
        }
        _ => Ok(ValidateCallbackResult::Valid),
    }
}

fn validate_create(action: &Create) -> ExternResult<ValidateCallbackResult> {
    // `profiles_integrity` is the first integrity zome and Profile is its
    // first entry type in both DNA manifests. Integrity zomes cannot link one
    // another because their generated `__num_entry_types` symbols collide.
    let profile = EntryType::App(AppEntryDef::new(
        PROFILE_ZOME_INDEX.into(),
        PROFILE_ENTRY_INDEX.into(),
        EntryVisibility::Public,
    ));
    let earlier = must_get_agent_activity(
        action.author.clone(),
        ChainFilter::new(action.prev_action.clone()),
    )?;
    if earlier.iter().any(|activity| {
        matches!(activity.action.hashed.content, Action::Create(Create { ref entry_type, .. }) if *entry_type == profile)
    }) {
        Ok(ValidateCallbackResult::Valid)
    } else {
        Ok(ValidateCallbackResult::Invalid(WHAKAPAPA_NEEDS_PROFILE.into()))
    }
}

fn validate_update(action: &Update) -> ExternResult<ValidateCallbackResult> {
    let relative: EntryType = UnitEntryTypes::Relative.try_into()?;
    if action.entry_type != relative {
        return Ok(ValidateCallbackResult::Invalid(
            RELATIONSHIP_CANNOT_BE_UPDATED.into(),
        ));
    }
    let original = must_get_action(action.original_action_address.clone())?;
    if *original.action().author() != action.author {
        return Ok(ValidateCallbackResult::Invalid(NOT_THE_AUTHOR.into()));
    }
    match original.action() {
        Action::Create(create) if create.entry_type == action.entry_type => {
            Ok(ValidateCallbackResult::Valid)
        }
        _ => Ok(ValidateCallbackResult::Invalid(
            UPDATE_MUST_POINT_AT_ORIGINAL.into(),
        )),
    }
}

fn validate_delete(action: &Delete) -> ExternResult<ValidateCallbackResult> {
    let original = must_get_action(action.deletes_address.clone())?;
    let relative: EntryType = UnitEntryTypes::Relative.try_into()?;
    let relationship: EntryType = UnitEntryTypes::Relationship.try_into()?;
    if !matches!(original.action().entry_type(), Some(entry_type) if *entry_type == relative || *entry_type == relationship)
    {
        // Every integrity zome sees every Delete action. Leave unrelated entry
        // types to their owning zome's validator.
        return Ok(ValidateCallbackResult::Valid);
    }
    if original.action().author() != &action.author {
        return Ok(ValidateCallbackResult::Invalid(NOT_THE_AUTHOR.into()));
    }
    Ok(ValidateCallbackResult::Valid)
}

#[cfg(test)]
mod tests {
    use super::*;
    use hdi::test_utils::short_hand::*;

    const OWNER: u8 = 1;
    const OTHER: u8 = 2;

    struct FakeHost {
        earlier: Vec<Action>,
        original: Option<Action>,
    }

    impl HdiT for FakeHost {
        fn zome_info(&self, _: ()) -> ExternResult<ZomeInfo> {
            Ok(ZomeInfo {
                name: "whakapapa_integrity".into(),
                id: 0.into(),
                properties: Default::default(),
                entry_defs: EntryDefs(vec![]),
                extern_fns: vec![],
                zome_types: ScopedZomeTypesSet {
                    entries: ScopedZomeTypes(vec![(0.into(), vec![0.into(), 1.into()])]),
                    links: ScopedZomeTypes(vec![]),
                },
            })
        }
        fn must_get_agent_activity(
            &self,
            _: MustGetAgentActivityInput,
        ) -> ExternResult<Vec<RegisterAgentActivity>> {
            Ok(self
                .earlier
                .iter()
                .map(|action| RegisterAgentActivity {
                    action: signed(action.clone()),
                    cached_entry: None,
                })
                .collect())
        }
        fn must_get_action(&self, _: MustGetActionInput) -> ExternResult<SignedActionHashed> {
            Ok(signed(
                self.original.clone().expect("original action expected"),
            ))
        }
        fn verify_signature(&self, _: VerifySignature) -> ExternResult<bool> {
            unreachable!()
        }
        fn must_get_entry(&self, _: MustGetEntryInput) -> ExternResult<EntryHashed> {
            unreachable!()
        }
        fn must_get_valid_record(&self, _: MustGetValidRecordInput) -> ExternResult<Record> {
            unreachable!()
        }
        fn dna_info(&self, _: ()) -> ExternResult<DnaInfo> {
            unreachable!()
        }
        fn trace(&self, _: TraceMsg) -> ExternResult<()> {
            unreachable!()
        }
        fn x_salsa20_poly1305_decrypt(
            &self,
            _: XSalsa20Poly1305Decrypt,
        ) -> ExternResult<Option<XSalsa20Poly1305Data>> {
            unreachable!()
        }
        fn x_25519_x_salsa20_poly1305_decrypt(
            &self,
            _: X25519XSalsa20Poly1305Decrypt,
        ) -> ExternResult<Option<XSalsa20Poly1305Data>> {
            unreachable!()
        }
        fn ed_25519_x_salsa20_poly1305_decrypt(
            &self,
            _: Ed25519XSalsa20Poly1305Decrypt,
        ) -> ExternResult<XSalsa20Poly1305Data> {
            unreachable!()
        }
    }

    fn signed(action: Action) -> SignedActionHashed {
        SignedHashed {
            hashed: HoloHashed {
                content: action,
                hash: ah(20),
            },
            signature: Signature([0; 64]),
        }
    }

    fn relative_type() -> EntryType {
        UnitEntryTypes::Relative.try_into().unwrap()
    }

    fn profile_type() -> EntryType {
        EntryType::App(AppEntryDef::new(
            PROFILE_ZOME_INDEX.into(),
            PROFILE_ENTRY_INDEX.into(),
            EntryVisibility::Public,
        ))
    }

    fn create(author: u8) -> Create {
        Create {
            author: ak(author),
            timestamp: Timestamp::from_micros(0),
            action_seq: 1,
            prev_action: ah(0),
            entry_type: relative_type(),
            entry_hash: eh(10),
            weight: Default::default(),
        }
    }

    fn update(author: u8) -> Update {
        Update {
            author: ak(author),
            timestamp: Timestamp::from_micros(0),
            action_seq: 2,
            prev_action: ah(1),
            original_action_address: ah(9),
            original_entry_address: eh(10),
            entry_type: relative_type(),
            entry_hash: eh(11),
            weight: Default::default(),
        }
    }

    #[test]
    fn create_requires_profile_in_prior_chain_activity() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        assert_eq!(
            validate_create(&create(OWNER)).unwrap(),
            ValidateCallbackResult::Invalid(WHAKAPAPA_NEEDS_PROFILE.into())
        );
    }

    #[test]
    fn create_is_valid_when_profile_precedes_it() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let mut profile = create(OWNER);
        profile.entry_type = profile_type();
        set_hdi(FakeHost {
            earlier: vec![Action::Create(profile)],
            original: None,
        });
        assert_eq!(
            validate_create(&create(OWNER)).unwrap(),
            ValidateCallbackResult::Valid
        );
    }

    #[test]
    fn update_refuses_another_author() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let original = Action::Create(create(OWNER));
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(original),
        });
        assert_eq!(
            validate_update(&update(OTHER)).unwrap(),
            ValidateCallbackResult::Invalid(NOT_THE_AUTHOR.into())
        );
    }

    #[test]
    fn update_of_an_update_is_refused() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let mut update_action = update(OWNER);
        update_action.original_action_address = ah(8);
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(Action::Update(update(OWNER))),
        });
        assert_eq!(
            validate_update(&update_action).unwrap(),
            ValidateCallbackResult::Invalid(UPDATE_MUST_POINT_AT_ORIGINAL.into())
        );
    }

    #[test]
    fn update_of_another_entry_type_is_refused() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let mut profile = create(OWNER);
        profile.entry_type = profile_type();
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(Action::Create(profile)),
        });
        assert_eq!(
            validate_update(&update(OWNER)).unwrap(),
            ValidateCallbackResult::Invalid(UPDATE_MUST_POINT_AT_ORIGINAL.into())
        );
    }

    #[test]
    fn relationship_update_is_refused() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let mut relationship_update = update(OWNER);
        relationship_update.entry_type = UnitEntryTypes::Relationship.try_into().unwrap();
        assert_eq!(
            validate_update(&relationship_update).unwrap(),
            ValidateCallbackResult::Invalid(RELATIONSHIP_CANNOT_BE_UPDATED.into())
        );
    }

    #[test]
    fn author_can_update_the_original_relative() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let original = Action::Create(create(OWNER));
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(original),
        });
        assert_eq!(
            validate_update(&update(OWNER)).unwrap(),
            ValidateCallbackResult::Valid
        );
    }

    #[test]
    fn delete_refuses_another_author() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let original = Action::Create(create(OWNER));
        let delete = Delete {
            author: ak(OTHER),
            timestamp: Timestamp::from_micros(0),
            action_seq: 2,
            prev_action: ah(1),
            deletes_address: ah(9),
            deletes_entry_address: eh(10),
            weight: Default::default(),
        };
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(original),
        });
        assert_eq!(
            validate_delete(&delete).unwrap(),
            ValidateCallbackResult::Invalid(NOT_THE_AUTHOR.into())
        );
    }

    #[test]
    fn unrelated_entry_delete_is_left_to_its_zome() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let mut profile = create(OWNER);
        profile.entry_type = profile_type();
        let delete = Delete {
            author: ak(OTHER),
            timestamp: Timestamp::from_micros(0),
            action_seq: 2,
            prev_action: ah(1),
            deletes_address: ah(9),
            deletes_entry_address: eh(10),
            weight: Default::default(),
        };
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(Action::Create(profile)),
        });
        assert_eq!(
            validate_delete(&delete).unwrap(),
            ValidateCallbackResult::Valid
        );
    }

    #[test]
    fn author_can_delete_a_whakapapa_entry() {
        set_hdi(FakeHost {
            earlier: vec![],
            original: None,
        });
        let delete = Delete {
            author: ak(OWNER),
            timestamp: Timestamp::from_micros(0),
            action_seq: 2,
            prev_action: ah(1),
            deletes_address: ah(9),
            deletes_entry_address: eh(10),
            weight: Default::default(),
        };
        set_hdi(FakeHost {
            earlier: vec![],
            original: Some(Action::Create(create(OWNER))),
        });
        assert_eq!(
            validate_delete(&delete).unwrap(),
            ValidateCallbackResult::Valid
        );
    }

    #[test]
    fn profile_reference_tracks_the_documented_dna_order() {
        let dna = include_str!("../../../../workdir/dna.yaml");
        let test_dna = include_str!("../../../../test/workdir/dna.yaml");
        let profiles = include_str!("../../profiles/src/lib.rs");
        assert!(
            dna.find("- name: profiles_integrity").unwrap()
                < dna.find("- name: whakapapa_integrity").unwrap()
        );
        assert!(
            test_dna.find("- name: profiles_integrity").unwrap()
                < test_dna.find("- name: whakapapa_integrity").unwrap()
        );
        assert!(
            profiles.find("Profile(Profile)").unwrap()
                < profiles.find("PersonalInformation(").unwrap()
        );
        assert_eq!(PROFILE_ZOME_INDEX, 0);
        assert_eq!(PROFILE_ENTRY_INDEX, 0);
    }
}
