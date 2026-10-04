use hdk::prelude::*;
use profiles_integrity::*;

/// My profile, read from my own source chain, so it needs no network.
#[hdk_extern]
pub fn get_my_profile() -> ExternResult<Option<Profile>> {
    let records = query(
        ChainQueryFilter::new()
            .entry_type(UnitEntryTypes::Profile.try_into()?)
            .include_entries(true),
    )?;
    records
        .first()
        .map(|record| {
            record
                .entry()
                .to_app_option::<Profile>()
                .map_err(|err| wasm_error!(err))?
                .ok_or(wasm_error!(WasmErrorInner::Guest(
                    "Profile entry is missing".into()
                )))
        })
        .transpose()
}

/// Create my profile, attached to my agent key.
#[hdk_extern]
pub fn create_my_profile(profile: Profile) -> ExternResult<Profile> {
    create_entry(EntryTypes::Profile(profile.clone()))?;
    Ok(profile)
}
