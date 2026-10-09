//! Profile calls for the agent running this cell. Reads come from the
//! agent's own source chain, so "my profile" never depends on the DHT or on
//! links anyone else could add.

use hdk::prelude::*;
use profiles_integrity::*;

/// A person's profile as they see it themselves: the public profile plus
/// their private personal information. Only ever built for the agent's own
/// profile; no one else's personal information is reachable.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct MyProfile {
    #[serde(flatten)]
    pub profile: Profile,
    #[serde(default)]
    pub personal: PersonalInformation,
}

/// Creates the profile of the agent running this call. Both entries are
/// written in this one call, so one can't exist without the other.
#[hdk_extern]
pub fn create_my_profile(input: MyProfile) -> ExternResult<MyProfile> {
    create_entry(EntryTypes::Profile(input.profile.clone()))?;
    create_entry(EntryTypes::PersonalInformation(input.personal.clone()))?;
    Ok(input)
}

/// This agent's profile, or None if they haven't created one.
#[hdk_extern]
pub fn get_my_profile() -> ExternResult<Option<MyProfile>> {
    let Some(profile) = latest_on_my_chain::<Profile>(UnitEntryTypes::Profile)? else {
        return Ok(None);
    };
    // Profiles created before personal information existed have none.
    let personal = latest_on_my_chain::<PersonalInformation>(UnitEntryTypes::PersonalInformation)?
        .unwrap_or_default();
    Ok(Some(MyProfile { profile, personal }))
}

/// The latest entry of this type on the agent's own chain.
fn latest_on_my_chain<T>(entry_type: UnitEntryTypes) -> ExternResult<Option<T>>
where
    T: TryFrom<SerializedBytes, Error = SerializedBytesError>,
{
    let records = query(
        ChainQueryFilter::new()
            .entry_type(entry_type.try_into()?)
            .include_entries(true),
    )?;
    records
        .last()
        .map(|record| {
            record
                .entry()
                .to_app_option::<T>()
                .map_err(|e| wasm_error!(e))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Malformed entry".into())))
        })
        .transpose()
}
