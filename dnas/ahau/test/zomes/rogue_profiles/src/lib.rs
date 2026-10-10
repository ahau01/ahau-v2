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

/// Writes personal information with no checks, profile or not.
#[hdk_extern]
pub fn create_personal_information(personal: PersonalInformation) -> ExternResult<()> {
    create_entry(EntryTypes::PersonalInformation(personal))?;
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

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateAgentPersonalInformationInput {
    pub agent: AgentPubKey,
    pub personal: PersonalInformation,
}

/// Tries to overwrite another agent's personal information. The entry is
/// private, but the action creating it is public, so it can be pointed at.
#[hdk_extern]
pub fn update_agent_personal_information(input: UpdateAgentPersonalInformationInput) -> ExternResult<()> {
    let original = agent_action(input.agent, UnitEntryTypes::PersonalInformation)?;
    update_entry(original, EntryTypes::PersonalInformation(input.personal))?;
    Ok(())
}

/// Tries to delete another agent's personal information.
#[hdk_extern]
pub fn delete_agent_personal_information(agent: AgentPubKey) -> ExternResult<()> {
    delete_entry(agent_action(agent, UnitEntryTypes::PersonalInformation)?)?;
    Ok(())
}

fn agent_profile_action(agent: AgentPubKey) -> ExternResult<ActionHash> {
    agent_action(agent, UnitEntryTypes::Profile)
}

fn agent_action(agent: AgentPubKey, entry_type: UnitEntryTypes) -> ExternResult<ActionHash> {
    let activity = get_agent_activity(
        agent,
        ChainQueryFilter::new().entry_type(entry_type.try_into()?),
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
    update_entry(my_original(UnitEntryTypes::Profile)?, EntryTypes::Profile(profile))?;
    Ok(())
}

/// Updates this agent's own personal information, as `update_my_profile` does.
#[hdk_extern]
pub fn update_my_personal_information(personal: PersonalInformation) -> ExternResult<()> {
    update_entry(my_original(UnitEntryTypes::PersonalInformation)?, EntryTypes::PersonalInformation(personal))?;
    Ok(())
}

/// Tries to update this agent's own profile by pointing at its latest
/// update rather than at the original.
#[hdk_extern]
pub fn update_my_latest_profile(profile: Profile) -> ExternResult<()> {
    update_entry(my_action(UnitEntryTypes::Profile, ActionType::Update)?, EntryTypes::Profile(profile))?;
    Ok(())
}

/// Tries to update this agent's own personal information by pointing at its
/// latest update, as `update_my_latest_profile` does.
#[hdk_extern]
pub fn update_my_latest_personal_information(personal: PersonalInformation) -> ExternResult<()> {
    let latest = my_action(UnitEntryTypes::PersonalInformation, ActionType::Update)?;
    update_entry(latest, EntryTypes::PersonalInformation(personal))?;
    Ok(())
}

/// Tries to delete this agent's own profile.
#[hdk_extern]
pub fn delete_my_profile() -> ExternResult<()> {
    delete_entry(my_original(UnitEntryTypes::Profile)?)?;
    Ok(())
}

/// The Create this agent's account of that entry type started with.
fn my_original(entry_type: UnitEntryTypes) -> ExternResult<ActionHash> {
    my_action(entry_type, ActionType::Create)
}

/// The latest action of this kind on this agent's own chain for that entry
/// type. Validation allows one Create per entry type, so for a Create the
/// latest is also the first.
fn my_action(entry_type: UnitEntryTypes, action_type: ActionType) -> ExternResult<ActionHash> {
    let records = query(
        ChainQueryFilter::new()
            .entry_type(entry_type.try_into()?)
            .action_type(action_type),
    )?;
    records
        .last()
        .map(|record| record.action_address().clone())
        .ok_or(wasm_error!(WasmErrorInner::Guest("This agent has nothing of that kind to change yet".into())))
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SeenPersonalInformation {
    pub action_found: bool,
    pub contents: Option<PersonalInformation>,
}

/// Tries to read another agent's personal information from the network.
#[hdk_extern]
pub fn get_agent_personal_information(agent: AgentPubKey) -> ExternResult<SeenPersonalInformation> {
    let activity = get_agent_activity(
        agent,
        ChainQueryFilter::new().entry_type(UnitEntryTypes::PersonalInformation.try_into()?),
        ActivityRequest::Full,
        GetOptions::network(),
    )?;
    let Some((_, hash)) = activity.valid_activity.first() else {
        return Ok(SeenPersonalInformation { action_found: false, contents: None });
    };
    let contents = match get(hash.clone(), GetOptions::network())? {
        Some(record) => record.entry().to_app_option::<PersonalInformation>().map_err(|e| wasm_error!(e))?,
        None => None,
    };
    Ok(SeenPersonalInformation { action_found: true, contents })
}
