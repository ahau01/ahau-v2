//! Coordinator calls for the current agent's own whakapapa.

use hdk::prelude::*;
use whakapapa_integrity::{
    Direction, EntryTypes, PersonRef, Relationship, Relative, UnitEntryTypes,
};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AddRelativeInput {
    pub name: String,
    pub direction: Direction,
    pub of: PersonRef,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Whakapapa {
    pub relatives: Vec<NamedRelative>,
    pub relationships: Vec<Relationship>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct NamedRelative {
    pub action: ActionHash,
    pub name: String,
}

pub const NAME_REQUIRED: &str = "A relative needs a name";
pub const RELATIVE_NOT_FOUND: &str = "That relative is not on this agent's chain";
pub const PRIVATE_ENTRY_UNAVAILABLE: &str =
    "A private whakapapa entry on this chain has no contents";

/// Add a relative and their first relationship in one source-chain workflow.
#[hdk_extern]
pub fn add_relative(input: AddRelativeInput) -> ExternResult<Whakapapa> {
    if input.name.trim().is_empty() {
        return Err(wasm_error!(WasmErrorInner::Guest(NAME_REQUIRED.into())));
    }
    if let PersonRef::Relative(hash) = &input.of {
        if !relative_exists(hash)? {
            return Err(wasm_error!(WasmErrorInner::Guest(
                RELATIVE_NOT_FOUND.into()
            )));
        }
    }
    let nonce = random_bytes(32)?.to_vec();
    let relative_action = create_entry(EntryTypes::Relative(Relative {
        name: input.name,
        nonce,
    }))?;
    let new_ref = PersonRef::Relative(relative_action);
    let relationship = match input.direction {
        Direction::Parent => Relationship {
            parent: new_ref,
            child: input.of,
        },
        Direction::Child => Relationship {
            parent: input.of,
            child: new_ref,
        },
    };
    create_entry(EntryTypes::Relationship(relationship))?;
    get_whakapapa(())
}

/// Return this agent's latest relative names and unretracted relationships.
#[hdk_extern]
pub fn get_whakapapa(_: ()) -> ExternResult<Whakapapa> {
    let relative_type: EntryType = UnitEntryTypes::Relative.try_into()?;
    let relationship_type: EntryType = UnitEntryTypes::Relationship.try_into()?;
    let mut name_versions = Vec::<(ActionHash, ActionHash, String)>::new();
    let mut deleted_names = std::collections::BTreeSet::<ActionHash>::new();
    let mut relationships = std::collections::BTreeMap::<ActionHash, Relationship>::new();
    // Entry-type filtering omits Delete actions, which have no entry type of
    // their own. Read all chain actions so retractions can be applied too.
    for record in query(ChainQueryFilter::new().include_entries(true))? {
        match record.action() {
            Action::Create(create) if create.entry_type == relative_type => {
                let hash = record.action_address().clone();
                let relative = decode::<Relative>(&record)?;
                name_versions.push((hash.clone(), hash, relative.name));
            }
            Action::Update(update) if update.entry_type == relative_type => {
                let relative = decode::<Relative>(&record)?;
                name_versions.push((
                    record.action_address().clone(),
                    update.original_action_address.clone(),
                    relative.name,
                ));
            }
            Action::Create(create) if create.entry_type == relationship_type => {
                let relationship = decode::<Relationship>(&record)?;
                let hash = record.action_address().clone();
                relationships.insert(hash, relationship);
            }
            Action::Delete(delete) => {
                deleted_names.insert(delete.deletes_address.clone());
                relationships.remove(&delete.deletes_address);
            }
            _ => {}
        }
    }
    Ok(Whakapapa {
        relatives: latest_names(name_versions, deleted_names)
            .into_iter()
            .map(|(action, name)| NamedRelative { action, name })
            .collect(),
        relationships: relationships.into_values().collect(),
    })
}

fn relative_exists(hash: &ActionHash) -> ExternResult<bool> {
    Ok(get_whakapapa(())?
        .relatives
        .iter()
        .any(|relative| &relative.action == hash))
}

fn latest_names(
    versions: Vec<(ActionHash, ActionHash, String)>,
    deleted: std::collections::BTreeSet<ActionHash>,
) -> std::collections::BTreeMap<ActionHash, String> {
    let mut names = std::collections::BTreeMap::new();
    for (action, root, name) in versions {
        if !deleted.contains(&action) {
            names.insert(root, name);
        }
    }
    names
}

fn decode<T>(record: &Record) -> ExternResult<T>
where
    T: TryFrom<SerializedBytes, Error = SerializedBytesError>,
{
    let entry = record
        .entry()
        .to_app_option::<T>()
        .map_err(|error| wasm_error!(error))?;
    entry.ok_or_else(|| wasm_error!(WasmErrorInner::Guest(PRIVATE_ENTRY_UNAVAILABLE.into())))
}
