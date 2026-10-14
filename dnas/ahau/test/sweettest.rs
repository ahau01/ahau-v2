use std::{fmt::Debug, fs, path::PathBuf};

use holochain::{
    prelude::{AppBundle, MemproofMap, RoleName},
    sweettest::{await_consistency, SweetCell, SweetConductorBatch},
};
use serde::{de::DeserializeOwned, Serialize};

pub struct TestNetwork {
    pub conductors: SweetConductorBatch,
    pub cells: Vec<SweetCell>,
}

impl TestNetwork {
    pub async fn call<I, O>(&self, index: usize, zome: &str, function: &str, payload: I) -> O
    where
        I: Serialize + Debug,
        O: DeserializeOwned + Debug,
    {
        let zome = self.cells[index].zome(zome);
        self.conductors[index]
            .sweet_handle()
            .call(&zome, function, payload)
            .await
    }

    pub async fn rejected<I>(&self, index: usize, zome: &str, function: &str, payload: I) -> String
    where
        I: Serialize + Debug,
    {
        let zome = self.cells[index].zome(zome);
        self.conductors[index]
            .sweet_handle()
            .call_fallible::<_, ()>(&zome, function, payload)
            .await
            .expect_err("expected the zome call to be rejected")
            .to_string()
    }

    pub async fn sync(&self) {
        await_consistency(self.cells.iter())
            .await
            .expect("DHT sync timed out");
    }
}

pub async fn test_network(agent_count: usize, app_id: &str) -> TestNetwork {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../../..");
    let rogue_happ_path = root.join("workdir/rogue/ahau-rogue.happ");
    let production_dna_path = root.join("dnas/ahau/workdir/ahau.dna");
    let rogue_bundle = AppBundle::unpack(
        fs::read(&rogue_happ_path)
            .unwrap_or_else(|_| {
                panic!(
                    "missing {}; run npm run test:sweettest",
                    rogue_happ_path.display()
                )
            })
            .as_slice(),
    )
    .expect("rogue test hApp should unpack");
    let mut resolved = rogue_bundle
        .resolve_cells(MemproofMap::default(), Default::default())
        .await
        .expect("rogue test hApp should resolve");
    assert_eq!(
        resolved.dnas_to_register.len(),
        1,
        "rogue hApp should contain one DNA"
    );
    let (rogue_dna, _) = resolved.dnas_to_register.pop().unwrap();
    let production_dna = holochain::sweettest::SweetDnaFile::from_bundle(&production_dna_path)
        .await
        .unwrap_or_else(|_| {
            panic!(
                "missing {}; run npm run test:sweettest",
                production_dna_path.display()
            )
        });
    assert_eq!(
        rogue_dna.dna_hash(),
        production_dna.dna_hash(),
        "rogue test hApp must use the production DNA"
    );

    let dnas = [(RoleName::from("ahau"), rogue_dna)];
    let mut conductors = if agent_count > 1 {
        SweetConductorBatch::from_standard_config_rendezvous(agent_count).await
    } else {
        SweetConductorBatch::from_standard_config(agent_count).await
    };
    let apps = conductors
        .setup_app(app_id, &dnas)
        .await
        .expect("install rogue test hApp for each agent")
        .into_inner();
    let cells = apps
        .into_iter()
        .map(|app| {
            let mut cells = app.into_cells();
            assert_eq!(cells.len(), 1, "each app should have one ahau cell");
            cells.remove(0)
        })
        .collect();

    if agent_count > 1 {
        conductors.exchange_peer_info().await;
    }
    TestNetwork { conductors, cells }
}
