//! TEST ONLY. Bypass the supported coordinator to prove privacy and integrity rules.

use hdk::prelude::*;
use whakapapa_integrity::{EntryTypes, Relative, UnitEntryTypes};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Seen<T> {
    pub action_found: bool,
    pub contents: Option<T>,
}

#[hdk_extern]
pub fn get_agent_relative(agent: AgentPubKey) -> ExternResult<Seen<Relative>> {
    get_agent_entry(agent, UnitEntryTypes::Relative)
}

#[hdk_extern]
pub fn get_agent_relationship(
    agent: AgentPubKey,
) -> ExternResult<Seen<whakapapa_integrity::Relationship>> {
    get_agent_entry(agent, UnitEntryTypes::Relationship)
}

fn get_agent_entry<T>(agent: AgentPubKey, entry_type: UnitEntryTypes) -> ExternResult<Seen<T>>
where
    T: TryFrom<SerializedBytes, Error = SerializedBytesError>,
{
    let Some(hash) = agent_entry_action(agent, entry_type)? else {
        return Ok(Seen {
            action_found: false,
            contents: None,
        });
    };
    let contents = match get(hash, GetOptions::network())? {
        Some(record) => record
            .entry()
            .to_app_option::<T>()
            .map_err(|e| wasm_error!(e))?,
        None => None,
    };
    Ok(Seen {
        action_found: true,
        contents,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateRelativeInput {
    pub agent: AgentPubKey,
    pub name: String,
}

#[hdk_extern]
pub fn update_agent_relative(input: UpdateRelativeInput) -> ExternResult<ActionHash> {
    let original = agent_entry_action(input.agent, UnitEntryTypes::Relative)?.ok_or(
        wasm_error!(WasmErrorInner::Guest("That agent has no relative".into())),
    )?;
    update_entry(
        original,
        EntryTypes::Relative(Relative {
            name: input.name,
            nonce: vec![0; 32],
        }),
    )
}

#[hdk_extern]
pub fn delete_agent_relative(agent: AgentPubKey) -> ExternResult<()> {
    let action = agent_entry_action(agent, UnitEntryTypes::Relative)?.ok_or(wasm_error!(
        WasmErrorInner::Guest("That agent has no relative".into())
    ))?;
    delete_entry(action)?;
    Ok(())
}

#[hdk_extern]
pub fn delete_agent_relationship(agent: AgentPubKey) -> ExternResult<()> {
    let action = agent_entry_action(agent, UnitEntryTypes::Relationship)?.ok_or(wasm_error!(
        WasmErrorInner::Guest("That agent has no relationship".into())
    ))?;
    delete_entry(action)?;
    Ok(())
}

#[hdk_extern]
pub fn delete_relative_version(action: ActionHash) -> ExternResult<()> {
    delete_entry(action)?;
    Ok(())
}

fn agent_entry_action(
    agent: AgentPubKey,
    entry_type: UnitEntryTypes,
) -> ExternResult<Option<ActionHash>> {
    let activity = get_agent_activity(
        agent,
        ChainQueryFilter::new().entry_type(entry_type.try_into()?),
        ActivityRequest::Full,
        GetOptions::network(),
    )?;
    Ok(activity
        .valid_activity
        .first()
        .map(|(_, hash)| hash.clone()))
}

/// Exercises conductor rollback after a write is staged within a coordinator call.
#[hdk_extern]
pub fn write_both_then_fail(name: String) -> ExternResult<()> {
    let relative = create_entry(EntryTypes::Relative(Relative {
        name,
        nonce: vec![0; 32],
    }))?;
    create_entry(EntryTypes::Relationship(
        whakapapa_integrity::Relationship {
            parent: whakapapa_integrity::PersonRef::Me,
            child: whakapapa_integrity::PersonRef::Relative(relative),
        },
    ))?;
    Err(wasm_error!(WasmErrorInner::Guest(
        "Forced failure after relative and relationship writes".into()
    )))
}
