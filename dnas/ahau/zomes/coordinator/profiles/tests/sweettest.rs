use profiles_integrity::{Gender, PartialDate, PersonalInformation, Profile};

use profiles::MyProfile;

#[path = "../../../../test/sweettest.rs"]
mod shared_sweettest;
use shared_sweettest::{test_network, TestNetwork};

#[path = "../../../../test/profile_history.rs"]
mod profile_history;
use profile_history::MyProfileHistory;

fn profile(name: &str) -> Profile {
    Profile {
        name: name.to_owned(),
        ..Profile::default()
    }
}

fn personal(email: &str) -> PersonalInformation {
    PersonalInformation {
        email: Some(email.to_owned()),
        ..PersonalInformation::default()
    }
}

fn my_profile(name: &str, email: &str) -> MyProfile {
    MyProfile {
        profile: profile(name),
        personal: personal(email),
    }
}

async fn create_profile_then_update(
    network: &TestNetwork,
    initial: MyProfile,
    updates: Vec<MyProfile>,
) {
    network
        .call::<_, MyProfile>(0, "profiles", "create_my_profile", initial)
        .await;
    for update in updates {
        network
            .call::<_, MyProfile>(0, "profiles", "update_my_profile", update)
            .await;
    }
}

fn profile_names(history: &MyProfileHistory) -> Vec<&str> {
    history
        .profiles
        .iter()
        .map(|profile| profile.name.as_str())
        .collect()
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn another_agent_cannot_overwrite_a_profile() {
    let network = test_network(2, "profiles-sweettest").await;
    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "create_my_profile",
            my_profile("Mere", "mere@example.com"),
        )
        .await;
    network
        .call::<_, MyProfile>(
            1,
            "profiles",
            "create_my_profile",
            my_profile("Hemi", "hemi@example.com"),
        )
        .await;
    network.sync().await;

    let error = network
        .rejected(
            1,
            "rogue_profiles",
            "update_agent_profile",
            serde_json::json!({
                "agent": network.cells[0].agent_pubkey(),
                "profile": profile("Not Mere"),
            }),
        )
        .await;
    assert!(
        error.contains("Only the author of a profile can change it"),
        "{error}"
    );
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(accepted.unwrap().profile.name, "Mere");

    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "update_my_profile",
            my_profile("Mere Rangi", "mere.rangi@example.com"),
        )
        .await;
    network
        .call::<_, MyProfile>(
            1,
            "profiles",
            "update_my_profile",
            my_profile("Hemi Rangi", "hemi.rangi@example.com"),
        )
        .await;
    network.sync().await;

    let mere: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    let hemi: Option<MyProfile> = network.call(1, "profiles", "get_my_profile", ()).await;
    assert_eq!(mere.unwrap().profile.name, "Mere Rangi");
    assert_eq!(hemi.unwrap().profile.name, "Hemi Rangi");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn coordinator_updates_both_sections_twice_and_preserves_all_versions() {
    let network = test_network(1, "profiles-sweettest").await;
    create_profile_then_update(
        &network,
        my_profile("Mere", "mere@example.com"),
        vec![
            my_profile("Mere Rangi", "mere.rangi@example.com"),
            my_profile("Mere Rangi-Williams", "mere.williams@example.com"),
        ],
    )
    .await;

    let history: MyProfileHistory = network
        .call(0, "rogue_profiles", "get_my_profile_history", ())
        .await;
    assert_eq!(
        profile_names(&history),
        ["Mere", "Mere Rangi", "Mere Rangi-Williams"]
    );
    assert_eq!(
        history
            .personal_information
            .iter()
            .map(|personal| personal.email.as_deref())
            .collect::<Vec<_>>(),
        [
            Some("mere@example.com"),
            Some("mere.rangi@example.com"),
            Some("mere.williams@example.com")
        ]
    );

    let saved: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    let saved = saved.unwrap();
    assert_eq!(saved.profile.name, "Mere Rangi-Williams");
    assert_eq!(
        saved.personal.email.as_deref(),
        Some("mere.williams@example.com")
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn clearing_email_keeps_the_earlier_personal_information_version() {
    let network = test_network(1, "profiles-sweettest").await;
    create_profile_then_update(
        &network,
        my_profile("Mere", "mere@example.com"),
        vec![MyProfile {
            profile: profile("Mere Rangi"),
            personal: PersonalInformation::default(),
        }],
    )
    .await;

    let history: MyProfileHistory = network
        .call(0, "rogue_profiles", "get_my_profile_history", ())
        .await;
    assert_eq!(history.personal_information.len(), 2);
    assert_eq!(
        history.personal_information[0].email.as_deref(),
        Some("mere@example.com")
    );
    assert_eq!(history.personal_information[1].email, None);

    let latest: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(latest.unwrap().personal.email, None);
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn coordinator_update_creates_personal_information_for_an_older_profile() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;

    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "update_my_profile",
            my_profile("Mere Rangi", "mere@example.com"),
        )
        .await;

    let saved: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    let saved = saved.unwrap();
    assert_eq!(saved.profile.name, "Mere Rangi");
    assert_eq!(saved.personal.email.as_deref(), Some("mere@example.com"));
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn a_refused_coordinator_update_leaves_both_sections_unchanged() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "create_my_profile",
            my_profile("Mere", "mere@example.com"),
        )
        .await;

    let error = network
        .rejected(
            0,
            "profiles",
            "update_my_profile",
            my_profile(" ", "changed@example.com"),
        )
        .await;
    assert!(error.contains("A profile needs a name"), "{error}");

    let saved: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    let saved = saved.unwrap();
    assert_eq!(saved.profile.name, "Mere");
    assert_eq!(saved.personal.email.as_deref(), Some("mere@example.com"));
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn a_profile_is_authored_by_the_calling_agent() {
    let network = test_network(2, "profiles-sweettest").await;
    network
        .call::<_, ()>(
            1,
            "rogue_profiles",
            "create_profile",
            profile("Written by rogue"),
        )
        .await;
    network.sync().await;

    let owner: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    let rogue: Option<MyProfile> = network.call(1, "profiles", "get_my_profile", ()).await;
    assert!(
        owner.is_none(),
        "another agent's write must not appear as the owner's profile"
    );
    assert_eq!(rogue.unwrap().profile.name, "Written by rogue");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn another_agent_cannot_delete_a_profile() {
    let network = test_network(2, "profiles-sweettest").await;
    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "create_my_profile",
            my_profile("Mere", "mere@example.com"),
        )
        .await;
    network.sync().await;

    let error = network
        .rejected(
            1,
            "rogue_profiles",
            "delete_agent_profile",
            network.cells[0].agent_pubkey(),
        )
        .await;
    assert!(error.contains("Profiles can't be deleted yet"), "{error}");
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(accepted.unwrap().profile.name, "Mere");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn another_agent_cannot_read_personal_information_contents() {
    let network = test_network(2, "profiles-sweettest").await;
    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "create_my_profile",
            my_profile("Mere", "mere@example.com"),
        )
        .await;
    network.sync().await;

    let seen: serde_json::Value = network
        .call(
            1,
            "rogue_profiles",
            "get_agent_personal_information",
            network.cells[0].agent_pubkey(),
        )
        .await;
    assert_eq!(
        seen,
        serde_json::json!({ "actionFound": true, "contents": null })
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn another_agent_cannot_overwrite_personal_information() {
    let network = test_network(2, "profiles-sweettest").await;
    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "create_my_profile",
            my_profile("Mere", "mere@example.com"),
        )
        .await;
    network.sync().await;

    let error = network
        .rejected(
            1,
            "rogue_profiles",
            "update_agent_personal_information",
            serde_json::json!({
                "agent": network.cells[0].agent_pubkey(),
                "personal": personal("not-mere@example.com"),
            }),
        )
        .await;
    assert!(
        error.contains("Only the author of a profile can change it"),
        "{error}"
    );
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(
        accepted.unwrap().personal.email.as_deref(),
        Some("mere@example.com")
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn another_agent_cannot_delete_personal_information() {
    let network = test_network(2, "profiles-sweettest").await;
    network
        .call::<_, MyProfile>(
            0,
            "profiles",
            "create_my_profile",
            my_profile("Mere", "mere@example.com"),
        )
        .await;
    network.sync().await;

    let error = network
        .rejected(
            1,
            "rogue_profiles",
            "delete_agent_personal_information",
            network.cells[0].agent_pubkey(),
        )
        .await;
    assert!(
        error.contains("Personal information can't be deleted yet"),
        "{error}"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn personal_information_requires_a_profile() {
    let network = test_network(1, "profiles-sweettest").await;
    let error = network
        .rejected(
            0,
            "rogue_profiles",
            "create_personal_information",
            personal("mere@example.com"),
        )
        .await;
    assert!(
        error.contains("Personal information needs a profile first"),
        "{error}"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn an_agent_cannot_create_second_personal_information() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "create_personal_information",
            personal("mere@example.com"),
        )
        .await;
    let error = network
        .rejected(
            0,
            "rogue_profiles",
            "create_personal_information",
            personal("other@example.com"),
        )
        .await;
    assert!(
        error.contains("This agent already has personal information"),
        "{error}"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn an_author_can_update_their_profile() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "update_my_profile",
            profile("Mere Rangi"),
        )
        .await;
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(accepted.unwrap().profile.name, "Mere Rangi");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn an_author_can_update_their_personal_information() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "create_personal_information",
            personal("mere@example.com"),
        )
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "update_my_personal_information",
            personal("mere.rangi@example.com"),
        )
        .await;
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(
        accepted.unwrap().personal.email.as_deref(),
        Some("mere.rangi@example.com")
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn profile_updates_must_point_to_the_first_version() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "update_my_profile",
            profile("Mere Rangi"),
        )
        .await;
    let error = network
        .rejected(
            0,
            "rogue_profiles",
            "update_my_latest_profile",
            profile("Mere R."),
        )
        .await;
    assert!(
        error.contains("Changes to a profile must point at its first version"),
        "{error}"
    );
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(accepted.unwrap().profile.name, "Mere Rangi");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn personal_information_updates_must_point_to_the_first_version() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "create_personal_information",
            personal("mere@example.com"),
        )
        .await;
    network
        .call::<_, ()>(
            0,
            "rogue_profiles",
            "update_my_personal_information",
            personal("mere.rangi@example.com"),
        )
        .await;
    let error = network
        .rejected(
            0,
            "rogue_profiles",
            "update_my_latest_personal_information",
            personal("mere.r@example.com"),
        )
        .await;
    assert!(
        error.contains("Changes to a profile must point at its first version"),
        "{error}"
    );
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(
        accepted.unwrap().personal.email.as_deref(),
        Some("mere.rangi@example.com")
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn an_author_cannot_delete_their_profile() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("Mere"))
        .await;
    let error = network
        .rejected(0, "rogue_profiles", "delete_my_profile", ())
        .await;
    assert!(error.contains("Profiles can't be deleted yet"), "{error}");
    let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
    assert_eq!(accepted.unwrap().profile.name, "Mere");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn an_agent_cannot_create_a_second_profile() {
    let network = test_network(1, "profiles-sweettest").await;
    network
        .call::<_, ()>(0, "rogue_profiles", "create_profile", profile("First"))
        .await;
    let error = network
        .rejected(0, "rogue_profiles", "create_profile", profile("Second"))
        .await;
    assert!(
        error.contains("This agent already has a profile"),
        "{error}"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn invalid_profile_fields_are_rejected() {
    let network = test_network(1, "profiles-sweettest").await;
    let error = network
        .rejected(0, "rogue_profiles", "create_profile", profile(" "))
        .await;
    assert!(error.contains("A profile needs a name"), "{error}");

    let mut invalid_date = profile("Mere");
    invalid_date.date_of_birth = Some(PartialDate("01/01/1990".into()));
    let error = network
        .rejected(0, "rogue_profiles", "create_profile", invalid_date)
        .await;
    assert!(
        error.contains("Date of birth must be a real date"),
        "{error}"
    );

    let mut invalid_birth_order = profile("Mere");
    invalid_birth_order.birth_order = Some(0);
    let error = network
        .rejected(0, "rogue_profiles", "create_profile", invalid_birth_order)
        .await;
    assert!(
        error.contains("Order of birth must be a whole number, from 1"),
        "{error}"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn rust_gender_variants_are_accepted_and_unknown_values_rejected() {
    let network = test_network(1, "profiles-sweettest").await;
    let variants = [Gender::Male, Gender::Female, Gender::Other, Gender::Unknown];
    for (index, gender) in variants.into_iter().enumerate() {
        let mut next = profile("Mere");
        next.gender = Some(gender);
        if index == 0 {
            network
                .call::<_, ()>(0, "rogue_profiles", "create_profile", next)
                .await;
        } else {
            network
                .call::<_, ()>(0, "rogue_profiles", "update_my_profile", next)
                .await;
        }
        let accepted: Option<MyProfile> = network.call(0, "profiles", "get_my_profile", ()).await;
        assert_eq!(accepted.unwrap().profile.gender, Some(gender));
    }

    // The Rust enum has no such variant; send its invalid serialized form
    // directly so rejection is tested at the coordinator boundary.
    let error = network
        .rejected(
            0,
            "rogue_profiles",
            "update_my_profile",
            serde_json::json!({ "name": "Mere", "gender": "tane" }),
        )
        .await;
    assert!(!error.is_empty());
}
