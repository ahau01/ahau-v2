//! TEST ONLY. A coordinator zome that makes the profile writes our own
//! coordinator never would, as someone bypassing the app might. It ships
//! with the real integrity zome, so its DNA is the real network; the tests
//! use it to show that validation, not the coordinator or the UI, is what
//! refuses these writes.

use hdk::prelude::*;
use profiles_integrity::*;

/// Writes a profile with no checks at all.
#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<()> {
    create_entry(EntryTypes::Profile(profile))?;
    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateAgentProfileInput {
    pub agent: AgentPubKey,
    pub profile: Profile,
}

/// Tries to overwrite another agent's profile.
#[hdk_extern]
pub fn update_agent_profile(input: UpdateAgentProfileInput) -> ExternResult<()> {
    let original = agent_profile_action(input.agent)?;
    update_entry(original, EntryTypes::Profile(input.profile))?;
    Ok(())
}

/// Tries to delete another agent's profile.
#[hdk_extern]
pub fn delete_agent_profile(agent: AgentPubKey) -> ExternResult<()> {
    let original = agent_profile_action(agent)?;
    delete_entry(original)?;
    Ok(())
}

fn agent_profile_action(agent: AgentPubKey) -> ExternResult<ActionHash> {
    let activity = get_agent_activity(
        agent,
        ChainQueryFilter::new().entry_type(UnitEntryTypes::Profile.try_into()?),
        ActivityRequest::Full,
        GetOptions::network(),
    )?;
    activity
        .valid_activity
        .first()
        .map(|(_, hash)| hash.clone())
        .ok_or(wasm_error!(WasmErrorInner::Guest("That agent has no profile".into())))
}

/// Updates this agent's own profile. There is no app function for this yet;
/// it shows validation lets an author change their own profile.
#[hdk_extern]
pub fn update_my_profile(profile: Profile) -> ExternResult<()> {
    update_entry(my_profile_action()?, EntryTypes::Profile(profile))?;
    Ok(())
}

/// Tries to delete this agent's own profile.
#[hdk_extern]
pub fn delete_my_profile() -> ExternResult<()> {
    delete_entry(my_profile_action()?)?;
    Ok(())
}

fn my_profile_action() -> ExternResult<ActionHash> {
    let records = query(
        ChainQueryFilter::new()
            .entry_type(UnitEntryTypes::Profile.try_into()?)
            .action_type(ActionType::Create),
    )?;
    records
        .first()
        .map(|record| record.action_address().clone())
        .ok_or(wasm_error!(WasmErrorInner::Guest("This agent has no profile".into())))
}
