//! A person's own profile: their account of themselves, attached to their
//! agent key. It is not the canonical record of that person; others'
//! whakapapa records about them are kept separately.

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

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    if let Some((original, changer)) = changed_action(&op) {
        return validate_change(original, changer);
    }
    match op.flattened::<EntryTypes, ()>()? {
        FlatOp::StoreRecord(OpRecord::CreateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
        })
        | FlatOp::StoreEntry(OpEntry::CreateEntry {
            app_entry: EntryTypes::Profile(_),
            action,
        }) => validate_create_profile(&action),
        FlatOp::RegisterAgentActivity(OpActivity::CreateEntry {
            app_entry_type: Some(UnitEntryTypes::Profile),
            action,
        }) => validate_create_profile(&action),
        _ => Ok(ValidateCallbackResult::Valid),
    }
}

/// One profile per agent key: the author's chain before this action must hold none.
fn validate_create_profile(action: &Create) -> ExternResult<ValidateCallbackResult> {
    let profile_type: EntryType = UnitEntryTypes::Profile.try_into()?;
    let earlier = must_get_agent_activity(
        action.author.clone(),
        ChainFilter::new(action.prev_action.clone()),
    )?;
    let has_profile = earlier.iter().any(|activity| {
        let earlier_action = activity.action.hashed.content.clone();
        matches!(earlier_action, Action::Create(_))
            && earlier_action.entry_type() == Some(&profile_type)
    });
    if has_profile {
        return Ok(ValidateCallbackResult::Invalid(
            "This agent already has a profile".into(),
        ));
    }
    Ok(ValidateCallbackResult::Valid)
}

/// The action an update or delete changes, and who is changing it.
fn changed_action(op: &Op) -> Option<(ActionHash, AgentPubKey)> {
    let action = match op {
        Op::StoreRecord(StoreRecord { record }) => record.action().clone(),
        Op::StoreEntry(StoreEntry { action, .. }) => action.hashed.content.clone().into(),
        Op::RegisterUpdate(RegisterUpdate { update, .. }) => {
            Action::Update(update.hashed.content.clone())
        }
        Op::RegisterDelete(RegisterDelete { delete }) => {
            Action::Delete(delete.hashed.content.clone())
        }
        Op::RegisterAgentActivity(RegisterAgentActivity { action, .. }) => {
            action.hashed.content.clone()
        }
        _ => return None,
    };
    match action {
        Action::Update(update) => Some((update.original_action_address, update.author)),
        Action::Delete(delete) => Some((delete.deletes_address, delete.author)),
        _ => None,
    }
}

/// A profile is its author's own account of themselves: nobody else may change it.
fn validate_change(
    original: ActionHash,
    changer: AgentPubKey,
) -> ExternResult<ValidateCallbackResult> {
    let profile_type: EntryType = UnitEntryTypes::Profile.try_into()?;
    let original = must_get_action(original)?.hashed.content;
    if original.entry_type() == Some(&profile_type) && *original.author() != changer {
        return Ok(ValidateCallbackResult::Invalid(
            "Only the agent who created a profile can change it".into(),
        ));
    }
    Ok(ValidateCallbackResult::Valid)
}
