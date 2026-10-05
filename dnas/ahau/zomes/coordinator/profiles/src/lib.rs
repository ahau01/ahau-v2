//! Profile calls for the agent running this cell. Reads come from the
//! agent's own source chain, so "my profile" never depends on the DHT or on
//! links anyone else could add.

use hdk::prelude::*;
use profiles_integrity::*;

/// Creates the profile of the agent running this call.
#[hdk_extern]
pub fn create_my_profile(profile: Profile) -> ExternResult<Profile> {
    create_entry(EntryTypes::Profile(profile.clone()))?;
    Ok(profile)
}

/// This agent's profile, or None if they haven't created one.
#[hdk_extern]
pub fn get_my_profile() -> ExternResult<Option<Profile>> {
    let records = query(
        ChainQueryFilter::new()
            .entry_type(UnitEntryTypes::Profile.try_into()?)
            .include_entries(true),
    )?;
    records
        .last()
        .map(|record| {
            record
                .entry()
                .to_app_option::<Profile>()
                .map_err(|e| wasm_error!(e))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Malformed profile".into())))
        })
        .transpose()
}
