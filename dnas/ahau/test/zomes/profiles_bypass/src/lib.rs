//! Test only, never bundled in the real hApp. Plays a client that bypasses
//! the profile client module and writes to the DHT directly, so tests can
//! show the integrity zome's validation holds on its own.

use hdk::prelude::*;
use profiles_integrity::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct ProfileOf {
    pub agent: AgentPubKey,
    pub profile: Profile,
}

/// Try to overwrite another agent's profile with an update.
#[hdk_extern]
pub fn update_profile_of(input: ProfileOf) -> ExternResult<()> {
    let original = profile_action_of(input.agent)?;
    update_entry(original, input.profile)?;
    Ok(())
}

/// Try to delete another agent's profile.
#[hdk_extern]
pub fn delete_profile_of(agent: AgentPubKey) -> ExternResult<()> {
    delete_entry(profile_action_of(agent)?)?;
    Ok(())
}

fn profile_action_of(agent: AgentPubKey) -> ExternResult<ActionHash> {
    let activity = get_agent_activity(
        agent,
        ChainQueryFilter::new().entry_type(UnitEntryTypes::Profile.try_into()?),
        ActivityRequest::Full,
        GetOptions::default(),
    )?;
    activity
        .valid_activity
        .first()
        .map(|(_, hash)| hash.clone())
        .ok_or(wasm_error!(WasmErrorInner::Guest(
            "No profile found for that agent".into()
        )))
}
