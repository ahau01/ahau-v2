use serde_json::{json, Value};
use whakapapa::Whakapapa;
use whakapapa_integrity::WHAKAPAPA_NEEDS_PROFILE;

#[path = "../../../../test/sweettest.rs"]
mod shared_sweettest;
use shared_sweettest::{test_network, TestNetwork};

fn profile(name: &str) -> Value {
    json!({"name":name,"birthOrder":null,"gender":null,"fullName":null,"altNames":[],"dateOfBirth":null,
        "placeOfBirth":null,"description":null,"profession":null,"skills":[],"education":[],
        "personal":{"email":null,"phone":null,"address":null,"postcode":null,"city":null,"country":null}})
}

async fn create_profile(network: &TestNetwork, index: usize) {
    network
        .call::<_, Value>(index, "profiles", "create_my_profile", profile("Mere"))
        .await;
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn relative_and_relationship_are_created_and_read_together() {
    let network = test_network(1, "whakapapa-sweettest").await;
    create_profile(&network, 0).await;
    let invalid = network
        .rejected(
            0,
            "whakapapa",
            "add_relative",
            json!({"name":"  ","direction":"Parent","of":"Me"}),
        )
        .await;
    assert!(invalid.contains("A relative needs a name"), "{invalid}");
    let still_empty: Whakapapa = network.call(0, "whakapapa", "get_whakapapa", ()).await;
    assert!(still_empty.relatives.is_empty());
    let result: Whakapapa = network
        .call(
            0,
            "whakapapa",
            "add_relative",
            json!({"name":"Māmā","direction":"Parent","of":"Me"}),
        )
        .await;
    assert_eq!(result.relatives.len(), 1);
    assert_eq!(result.relatives[0].name, "Māmā");
    assert_eq!(result.relationships.len(), 1);
    let read: Whakapapa = network.call(0, "whakapapa", "get_whakapapa", ()).await;
    assert_eq!(read, result);
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn private_actions_are_visible_but_contents_are_not_and_mutations_are_author_only() {
    let network = test_network(2, "whakapapa-sweettest").await;
    create_profile(&network, 0).await;
    let created: Whakapapa = network
        .call(
            0,
            "whakapapa",
            "add_relative",
            json!({"name":"Māmā","direction":"Parent","of":"Me"}),
        )
        .await;
    network.sync().await;
    let owner = network.cells[0].agent_pubkey();
    let relative: Value = network
        .call(1, "rogue_whakapapa", "get_agent_relative", owner.clone())
        .await;
    let relationship: Value = network
        .call(
            1,
            "rogue_whakapapa",
            "get_agent_relationship",
            owner.clone(),
        )
        .await;
    assert_eq!(relative, json!({"actionFound":true,"contents":null}));
    assert_eq!(relationship, json!({"actionFound":true,"contents":null}));
    let update = network
        .rejected(
            1,
            "rogue_whakapapa",
            "update_agent_relative",
            json!({"agent":owner,"name":"Not Māmā"}),
        )
        .await;
    assert!(
        update.contains("Only the author of a whakapapa entry can change it"),
        "{update}"
    );
    let delete = network
        .rejected(
            1,
            "rogue_whakapapa",
            "delete_agent_relative",
            network.cells[0].agent_pubkey(),
        )
        .await;
    assert!(
        delete.contains("Only the author of a whakapapa entry can change it"),
        "{delete}"
    );
    let delete_relationship = network
        .rejected(
            1,
            "rogue_whakapapa",
            "delete_agent_relationship",
            network.cells[0].agent_pubkey(),
        )
        .await;
    assert!(
        delete_relationship.contains("Only the author of a whakapapa entry can change it"),
        "{delete_relationship}"
    );
    let renamed_action = network
        .call::<_, holochain::prelude::ActionHash>(
            0,
            "rogue_whakapapa",
            "update_agent_relative",
            json!({"agent":network.cells[0].agent_pubkey(),"name":"Māmā updated"}),
        )
        .await;
    let renamed: Whakapapa = network.call(0, "whakapapa", "get_whakapapa", ()).await;
    assert_eq!(renamed.relatives[0].name, "Māmā updated");
    assert_eq!(renamed.relationships, created.relationships);
    network
        .call::<_, ()>(
            0,
            "rogue_whakapapa",
            "delete_relative_version",
            renamed_action,
        )
        .await;
    let restored: Whakapapa = network.call(0, "whakapapa", "get_whakapapa", ()).await;
    assert_eq!(restored.relatives[0].name, "Māmā");
    network
        .call::<_, ()>(
            0,
            "rogue_whakapapa",
            "delete_agent_relationship",
            network.cells[0].agent_pubkey(),
        )
        .await;
    let retracted: Whakapapa = network.call(0, "whakapapa", "get_whakapapa", ()).await;
    assert!(retracted.relationships.is_empty());
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn profile_is_required_and_failed_coordinator_calls_commit_no_relative() {
    let network = test_network(1, "whakapapa-sweettest").await;
    let error = network
        .rejected(
            0,
            "whakapapa",
            "add_relative",
            json!({"name":"Māmā","direction":"Parent","of":"Me"}),
        )
        .await;
    assert!(error.contains(WHAKAPAPA_NEEDS_PROFILE), "{error}");
    create_profile(&network, 0).await;
    let forced = network
        .rejected(
            0,
            "rogue_whakapapa",
            "write_both_then_fail",
            "staged".to_string(),
        )
        .await;
    assert!(
        forced.contains("Forced failure after relative and relationship writes"),
        "{forced}"
    );
    let empty: Whakapapa = network.call(0, "whakapapa", "get_whakapapa", ()).await;
    assert!(empty.relatives.is_empty());
    assert!(empty.relationships.is_empty());
}
