//! A person's own profile: their account of themselves, written by their
//! agent key. It is not the canonical record of that person; other people's
//! whakapapa records about them live elsewhere (CLAUDE.md rule 1).
//!
//! The owner is the agent who authored the entry. There is no owner field,
//! so a profile cannot claim to belong to someone other than its author.

use hdi::prelude::*;

/// Every field but `name` is optional. Missing fields read as empty, so
/// profiles written before a field existed still read back: nothing on a
/// source chain is ever rewritten.
#[hdk_entry_helper]
#[derive(Clone, PartialEq, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct Profile {
    /// First name / known as.
    pub name: String,
    /// 1 for the eldest.
    pub birth_order: Option<u32>,
    pub gender: Option<Gender>,
    pub full_name: Option<String>,
    /// Also known as.
    pub alt_names: Vec<String>,
    /// `YYYY`, `YYYY-MM` or `YYYY-MM-DD`: people often know only part of it.
    pub date_of_birth: Option<String>,
    pub place_of_birth: Option<String>,
    /// About.
    pub description: Option<String>,
    pub profession: Option<String>,
    pub skills: Vec<String>,
    /// Places of education.
    pub education: Vec<String>,
}

/// How the person identifies. `Unknown` is a choice, unlike no answer.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Gender {
    Male,
    Female,
    Other,
    Unknown,
}

/// The "Personal information" section: contact details the person keeps to
/// themselves. A private entry, so it stays on their own source chain and is
/// never published to the DHT. Sharing it (say, with kaitiaki) is not
/// designed yet. Free text throughout: the old app checked none of it.
#[hdk_entry_helper]
#[derive(Clone, PartialEq, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct PersonalInformation {
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub postcode: Option<String>,
    pub city: Option<String>,
    pub country: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Profile(Profile),
    #[entry_type(visibility = "private")]
    PersonalInformation(PersonalInformation),
}

pub const ALREADY_HAS_PROFILE: &str = "This agent already has a profile";
pub const NOT_THE_AUTHOR: &str = "Only the author of a profile can change it";
pub const PROFILES_CANNOT_BE_DELETED: &str = "Profiles can't be deleted yet";
pub const PERSONAL_INFORMATION_CANNOT_BE_DELETED: &str = "Personal information can't be deleted yet";
pub const PERSONAL_INFORMATION_NEEDS_A_PROFILE: &str = "Personal information needs a profile first";
pub const ALREADY_HAS_PERSONAL_INFORMATION: &str = "This agent already has personal information";
pub const NAME_REQUIRED: &str = "A profile needs a name";
pub const BIRTH_ORDER_INVALID: &str = "Order of birth must be a whole number, from 1";
pub const DATE_OF_BIRTH_INVALID: &str = "Date of birth must be a real date: a year, a year and month, or a full date";

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, ()>()? {
        // Every authority that stores a profile op applies the same rules,
        // so a conductor that skips its own validation can't get a bad write
        // held as valid by the entry or agent-activity authorities.
        FlatOp::StoreRecord(OpRecord::CreateEntry {
            app_entry: EntryTypes::Profile(profile),
            action,
        })
        | FlatOp::StoreEntry(OpEntry::CreateEntry {
            app_entry: EntryTypes::Profile(profile),
            action,
        }) => first_invalid([validate_profile_content(&profile), validate_create_profile(&action)]),
        FlatOp::RegisterAgentActivity(OpActivity::CreateEntry {
            app_entry_type: Some(UnitEntryTypes::Profile),
            action,
        }) => validate_create_profile(&action),
        FlatOp::StoreRecord(OpRecord::CreatePrivateEntry {
            app_entry_type: UnitEntryTypes::PersonalInformation,
            action,
        })
        | FlatOp::RegisterAgentActivity(OpActivity::CreatePrivateEntry {
            app_entry_type: Some(UnitEntryTypes::PersonalInformation),
            action,
        }) => validate_create_personal_information(&action),
        // Checked on every op that carries the update, so that neither the
        // author's record nor the update metadata on the original can carry
        // someone else's change.
        FlatOp::StoreEntry(OpEntry::UpdateEntry {
            app_entry: EntryTypes::Profile(profile),
            action,
            ..
        })
        | FlatOp::StoreRecord(OpRecord::UpdateEntry {
            app_entry: EntryTypes::Profile(profile),
            action,
            ..
        })
        | FlatOp::RegisterUpdate(OpUpdate::Entry {
            app_entry: EntryTypes::Profile(profile),
            action,
        }) => first_invalid([
            validate_profile_content(&profile),
            validate_by_original_author(&action.author, &action.original_action_address),
        ]),
        FlatOp::RegisterAgentActivity(OpActivity::UpdateEntry {
            app_entry_type: Some(UnitEntryTypes::Profile),
            action,
            ..
        }) => validate_by_original_author(&action.author, &action.original_action_address),
        // Personal information is private, so these ops carry no contents;
        // only who may change it can be checked.
        FlatOp::StoreRecord(OpRecord::UpdatePrivateEntry {
            app_entry_type: UnitEntryTypes::PersonalInformation,
            action,
            ..
        })
        | FlatOp::RegisterAgentActivity(OpActivity::UpdatePrivateEntry {
            app_entry_type: Some(UnitEntryTypes::PersonalInformation),
            action,
            ..
        })
        | FlatOp::RegisterUpdate(OpUpdate::PrivateEntry {
            app_entry_type: UnitEntryTypes::PersonalInformation,
            action,
            ..
        }) => validate_by_original_author(&action.author, &action.original_action_address),
        FlatOp::RegisterAgentActivity(OpActivity::DeleteEntry { action, .. }) => validate_delete(&action),
        FlatOp::StoreRecord(OpRecord::DeleteEntry { action, .. })
        | FlatOp::RegisterDelete(OpDelete { action }) => validate_delete(&action),
        _ => Ok(ValidateCallbackResult::Valid),
    }
}

/// What a profile must hold, whoever writes it. Only rules the person
/// would agree are about well-formed data, not about what's true of them.
fn validate_profile_content(profile: &Profile) -> ExternResult<ValidateCallbackResult> {
    if profile.name.trim().is_empty() {
        return Ok(ValidateCallbackResult::Invalid(NAME_REQUIRED.into()));
    }
    if profile.birth_order == Some(0) {
        return Ok(ValidateCallbackResult::Invalid(BIRTH_ORDER_INVALID.into()));
    }
    if let Some(date) = &profile.date_of_birth {
        if !is_partial_date(date) {
            return Ok(ValidateCallbackResult::Invalid(DATE_OF_BIRTH_INVALID.into()));
        }
    }
    Ok(ValidateCallbackResult::Valid)
}

/// `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, naming a day that can exist. Digits
/// may be unknown (`X`) where the old app's date picker allowed it: trailing
/// year digits, the whole month, or the day's last digit or both.
fn is_partial_date(date: &str) -> bool {
    let parts: Vec<&str> = date.split('-').collect();
    let (year, month, day) = match parts.as_slice() {
        [y] => (*y, None, None),
        [y, m] => (*y, Some(*m), None),
        [y, m, d] => (*y, Some(*m), Some(*d)),
        _ => return false,
    };
    let Some(year) = read_year(year) else { return false };
    let month = match month.map(read_month) {
        None => return true,
        Some(None) => return false,
        Some(Some(month)) => month,
    };
    match day {
        None => true,
        Some(day) => is_day_in(day, year, month),
    }
}

/// A year's four digits, the trailing ones possibly unknown. `Some(None)`
/// when any digit is unknown.
fn read_year(year: &str) -> Option<Option<u32>> {
    let known = year.trim_end_matches('X');
    if year.len() != 4 || !known.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    Some(if known.len() == 4 { known.parse().ok() } else { None })
}

/// `01` to `12`, or `XX`. `Some(None)` when unknown.
fn read_month(month: &str) -> Option<Option<u32>> {
    if month == "XX" {
        return Some(None);
    }
    match two_digits(month) {
        Some(m @ 1..=12) => Some(Some(m)),
        _ => None,
    }
}

fn is_day_in(day: &str, year: Option<u32>, month: Option<u32>) -> bool {
    match day.as_bytes() {
        [b'X', b'X'] => true,
        [b'1'..=b'3', b'X'] => true,
        _ => match two_digits(day) {
            Some(d) => (1..=days_in(year, month)).contains(&d),
            None => false,
        },
    }
}

/// The most days the month can have, given what's known of it.
fn days_in(year: Option<u32>, month: Option<u32>) -> u32 {
    match month {
        Some(2) => match year {
            Some(y) if !(y % 4 == 0 && (y % 100 != 0 || y % 400 == 0)) => 28,
            _ => 29,
        },
        Some(4 | 6 | 9 | 11) => 30,
        _ => 31,
    }
}

fn two_digits(part: &str) -> Option<u32> {
    (part.len() == 2 && part.bytes().all(|b| b.is_ascii_digit())).then(|| part.parse().ok())?
}

/// The first result that isn't Valid, or Valid if every check passed.
fn first_invalid<const N: usize>(
    results: [ExternResult<ValidateCallbackResult>; N],
) -> ExternResult<ValidateCallbackResult> {
    for result in results {
        match result? {
            ValidateCallbackResult::Valid => {}
            other => return Ok(other),
        }
    }
    Ok(ValidateCallbackResult::Valid)
}

/// One profile per agent key: the author's chain before this action must
/// hold no other profile.
fn validate_create_profile(action: &Create) -> ExternResult<ValidateCallbackResult> {
    if created_earlier(action, UnitEntryTypes::Profile)? {
        return Ok(ValidateCallbackResult::Invalid(ALREADY_HAS_PROFILE.into()));
    }
    Ok(ValidateCallbackResult::Valid)
}

/// Personal information is the private half of a profile: at most one per
/// agent key, and only once that agent's profile exists. The contents are
/// private, but the action is public, so every authority can check this.
fn validate_create_personal_information(action: &Create) -> ExternResult<ValidateCallbackResult> {
    if !created_earlier(action, UnitEntryTypes::Profile)? {
        return Ok(ValidateCallbackResult::Invalid(PERSONAL_INFORMATION_NEEDS_A_PROFILE.into()));
    }
    if created_earlier(action, UnitEntryTypes::PersonalInformation)? {
        return Ok(ValidateCallbackResult::Invalid(ALREADY_HAS_PERSONAL_INFORMATION.into()));
    }
    Ok(ValidateCallbackResult::Valid)
}

/// Whether the author's chain before this action creates an entry of this type.
fn created_earlier(action: &Create, of: UnitEntryTypes) -> ExternResult<bool> {
    let wanted: EntryType = of.try_into()?;
    let earlier = must_get_agent_activity(
        action.author.clone(),
        ChainFilter::new(action.prev_action.clone()),
    )?;
    Ok(earlier.iter().any(|activity| {
        matches!(
            activity.action.hashed.content,
            Action::Create(Create { ref entry_type, .. }) if *entry_type == wanted
        )
    }))
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
/// gets designed together with editing. Personal information is half of
/// the profile, so the same holds for it.
fn validate_delete(action: &Delete) -> ExternResult<ValidateCallbackResult> {
    let profile_type: EntryType = UnitEntryTypes::Profile.try_into()?;
    let personal_type: EntryType = UnitEntryTypes::PersonalInformation.try_into()?;
    let original = must_get_action(action.deletes_address.clone())?;
    match original.action().entry_type() {
        Some(entry_type) if *entry_type == profile_type => {
            Ok(ValidateCallbackResult::Invalid(PROFILES_CANNOT_BE_DELETED.into()))
        }
        Some(entry_type) if *entry_type == personal_type => {
            Ok(ValidateCallbackResult::Invalid(PERSONAL_INFORMATION_CANNOT_BE_DELETED.into()))
        }
        _ => Ok(ValidateCallbackResult::Valid),
    }
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
        Entry::try_from(Profile { name: "Mere".into(), ..Default::default() }).unwrap()
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
                    entries: ScopedZomeTypes(vec![(0.into(), vec![0.into(), 1.into()])]),
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
    fn store_entry_refuses_a_profile_with_a_blank_name() {
        mock_host(vec![], None);
        let blank = Entry::try_from(Profile { name: "  ".into(), ..Default::default() }).unwrap();
        let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), blank);
        assert_eq!(validate(op).unwrap(), invalid(NAME_REQUIRED));
    }

    #[test]
    fn store_entry_refuses_an_update_to_a_blank_name() {
        mock_host(vec![], Some(Action::Create(create_profile(OWNER))));
        let blank = Entry::try_from(Profile { name: "".into(), ..Default::default() }).unwrap();
        let op = s_entry(EntryCreationAction::Update(update_profile(OWNER, ah(9))), blank);
        assert_eq!(validate(op).unwrap(), invalid(NAME_REQUIRED));
    }

    fn with_date_of_birth(date: &str) -> Entry {
        Entry::try_from(Profile {
            name: "Mere".into(),
            date_of_birth: Some(date.into()),
            ..Default::default()
        })
        .unwrap()
    }

    #[test]
    fn store_entry_accepts_a_date_of_birth_known_to_the_year_month_or_day() {
        for date in ["1990", "1990-01", "1990-01-31", "2000-02-29"] {
            mock_host(vec![], None);
            let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), with_date_of_birth(date));
            assert_eq!(validate(op).unwrap(), ValidateCallbackResult::Valid, "{date}");
        }
    }

    /// The old app's date picker let people leave digits unknown (EDTF's X),
    /// e.g. born in the 1920s: `192X`.
    #[test]
    fn store_entry_accepts_a_date_of_birth_with_unknown_digits() {
        for date in ["192X", "19XX", "XXXX", "1990-XX", "1990-XX-XX", "1990-03-1X", "XXXX-03-09", "0042"] {
            mock_host(vec![], None);
            let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), with_date_of_birth(date));
            assert_eq!(validate(op).unwrap(), ValidateCallbackResult::Valid, "{date}");
        }
    }

    #[test]
    fn store_entry_refuses_unknown_digits_the_old_app_never_wrote() {
        for date in ["1X90", "X990", "1990-X3", "1990-1X", "1990-03-X9", "1990-03-4X", "1990-03-0X"] {
            mock_host(vec![], None);
            let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), with_date_of_birth(date));
            assert_eq!(validate(op).unwrap(), invalid(DATE_OF_BIRTH_INVALID), "{date}");
        }
    }

    #[test]
    fn store_entry_refuses_a_date_of_birth_that_is_not_a_real_date() {
        for date in ["", "90", "1990-1", "1990-13", "1990-00", "1990-01-32", "1990-02-29", "1990-01-01T00:00", "01/01/1990"] {
            mock_host(vec![], None);
            let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), with_date_of_birth(date));
            assert_eq!(validate(op).unwrap(), invalid(DATE_OF_BIRTH_INVALID), "{date}");
        }
    }

    #[test]
    fn store_entry_refuses_a_birth_order_of_zero() {
        mock_host(vec![], None);
        let zeroth = Entry::try_from(Profile { name: "Mere".into(), birth_order: Some(0), ..Default::default() }).unwrap();
        let op = s_entry(EntryCreationAction::Create(create_profile(OWNER)), zeroth);
        assert_eq!(validate(op).unwrap(), invalid(BIRTH_ORDER_INVALID));
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

    #[test]
    fn agent_activity_refuses_deleting_personal_information() {
        mock_host(vec![], Some(Action::Create(create_personal_information(OWNER))));
        let op = r_activity(Action::Delete(Delete {
            author: ak(OWNER),
            timestamp: Timestamp::from_micros(0),
            action_seq: 6,
            prev_action: ah(5),
            deletes_address: ah(9),
            deletes_entry_address: eh(12),
            weight: Default::default(),
        }));
        assert_eq!(validate(op).unwrap(), invalid(PERSONAL_INFORMATION_CANNOT_BE_DELETED));
    }

    fn create_personal_information(author: u8) -> Create {
        Create {
            entry_type: EntryType::App(AppEntryDef::new(1.into(), 0.into(), EntryVisibility::Private)),
            entry_hash: eh(12),
            action_seq: 5,
            prev_action: ah(4),
            ..create_profile(author)
        }
    }

    #[test]
    fn agent_activity_accepts_personal_information_after_a_profile() {
        mock_host(vec![Action::Create(create_profile(OWNER))], None);
        let op = r_activity(Action::Create(create_personal_information(OWNER)));
        assert_eq!(validate(op).unwrap(), ValidateCallbackResult::Valid);
    }

    #[test]
    fn agent_activity_refuses_personal_information_without_a_profile() {
        mock_host(vec![], None);
        let op = r_activity(Action::Create(create_personal_information(OWNER)));
        assert_eq!(validate(op).unwrap(), invalid(PERSONAL_INFORMATION_NEEDS_A_PROFILE));
    }

    #[test]
    fn agent_activity_refuses_a_second_personal_information() {
        mock_host(
            vec![Action::Create(create_profile(OWNER)), Action::Create(create_personal_information(OWNER))],
            None,
        );
        let op = r_activity(Action::Create(create_personal_information(OWNER)));
        assert_eq!(validate(op).unwrap(), invalid(ALREADY_HAS_PERSONAL_INFORMATION));
    }

    #[test]
    fn store_record_refuses_personal_information_without_a_profile() {
        mock_host(vec![], None);
        let op = s_record(Action::Create(create_personal_information(OWNER)), RecordEntry::Hidden);
        assert_eq!(validate(op).unwrap(), invalid(PERSONAL_INFORMATION_NEEDS_A_PROFILE));
    }
}
