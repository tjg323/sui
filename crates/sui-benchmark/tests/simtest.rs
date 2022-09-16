// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::sync::Arc;
use sui_config::SUI_CLIENT_CONFIG;
use sui_sdk::crypto::FileBasedKeystore;
use sui_types::{
    base_types::SuiAddress,
    crypto::{EncodeDecodeBase64, SuiKeyPair},
};
use test_utils::{messages::get_gas_object_with_wallet_context, network::setup_network_and_wallet};

use sui_benchmark::{drivers::bench_driver::BenchDriver, workloads::make_combination_workload};

use sui_macros::sim_test;

#[sim_test]
async fn test_simulated_load() {
    let (swarm, context, _) = setup_network_and_wallet().await.unwrap();

    let wallet_conf = swarm.dir().join(SUI_CLIENT_CONFIG);

    let keystore = FileBasedKeystore::load_or_create(&wallet_conf).unwrap();

    let key_pair = keystore.key_pairs()[0];
    let public_key = key_pair.public();

    let sender: SuiAddress = (&public_key).into();

    let ed_key_pair = match key_pair {
        SuiKeyPair::Ed25519SuiKeyPair(kp) => kp,
        _ => panic!(),
    };

    // we can't clone, but can ser/deser
    let ed_key_pair = ed_key_pair.encode_base64();
    let ed_key_pair = Arc::new(match SuiKeyPair::decode_base64(&ed_key_pair).unwrap() {
        SuiKeyPair::Ed25519SuiKeyPair(x) => x,
        _ => panic!("Unexpected keypair type"),
    });

    let gas = get_gas_object_with_wallet_context(&context, &sender)
        .await
        .expect("Expect {sender} to have at least one gas object");

    let _combination_workload = make_combination_workload(
        10,          // target_qps
        10,          // num_workers
        5,           // in_flight_ratio
        gas.0,       // primary_gas_id
        sender,      // owner
        ed_key_pair, // keypair
        1,           // num_transfer_accounts
        1,           // shared_counter_weight
        1,           // transfer_object_weight
    );

    let driver = BenchDriver::new(stat_collection_interval);
    driver.run(workloads, aggregator, &registry).await;

    println!("OK");
}
