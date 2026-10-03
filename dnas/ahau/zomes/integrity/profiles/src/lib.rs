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
