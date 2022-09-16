// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[cfg(msim)]
pub use msim::*;

#[cfg(msim)]
pub mod configs {
    use msim::*;
    use std::time::Duration;

    pub fn wan_latency_50ms() -> SimConfig {
        SimConfig {
            net: NetworkConfig {
                latency: LatencyConfig {
                    default_latency: LatencyDistribution::uniform(
                        Duration::from_millis(40)..Duration::from_millis(60),
                    ),
                    ..Default::default()
                },
                ..Default::default()
            },
        }
    }
}
