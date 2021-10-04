import { extendConfig, extendEnvironment } from "hardhat/config";

import { HardhatConfig, HardhatUserConfig } from "hardhat/types";

import { resolveConfig } from "hardhat/internal/core/config/config-resolution";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

import "./engine/tasks";

import { loadMigrationNetworkConfig } from "./setup";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const migrationNetworkConfig = loadMigrationNetworkConfig(
      config.paths.root
    );

    const networkConfig: HardhatUserConfig = {
      ...userConfig,
      networks: {
        ...userConfig.networks,
        ...migrationNetworkConfig.networks,
      },
    };

    config.networks = resolveConfig("", networkConfig).networks;
    config.migration = {
      dir: userConfig.migration.dir,
      forkConfig: migrationNetworkConfig.hardhatForkConfig,
    };
  }
);

extendEnvironment((hre) => {});
