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

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, ()>()? {
        FlatOp::StoreRecord(OpRecord::CreateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
        }) => validate_create_profile(&action),
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

/// Delete ops don't say what they delete, so look at the original: a
/// profile may only be deleted by its author.
fn validate_delete(action: &Delete) -> ExternResult<ValidateCallbackResult> {
    let profile_type: EntryType = UnitEntryTypes::Profile.try_into()?;
    let original = must_get_action(action.deletes_address.clone())?;
    if original.action().entry_type() != Some(&profile_type) {
        return Ok(ValidateCallbackResult::Valid);
    }
    validate_by_original_author(&action.author, &action.deletes_address)
}
