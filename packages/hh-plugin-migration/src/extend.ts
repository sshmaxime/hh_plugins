import { extendConfig, extendEnvironment } from 'hardhat/config';
import { HardhatConfig, HardhatUserConfig } from 'hardhat/types';
import { resolveConfig } from 'hardhat/internal/core/config/config-resolution';

import { loadMigrationForkNetworkConfig } from './extend.setup';

const DEFAULT_MIGRATION_DIR = 'migration';

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const migrationForkNetworkConfig = loadMigrationForkNetworkConfig(userConfig.networks, userConfig.migration);

    // reconstruct hardhat network config from forked network
    const networkConfig: HardhatUserConfig = {
        ...userConfig,
        networks: {
            hardhat: migrationForkNetworkConfig?.hardhatConfig || userConfig.networks?.hardhat
        }
    };

    // resolve network config from the pre-computed network config
    config.networks = resolveConfig('', networkConfig).networks;
    config.migration = {
        dir: userConfig.migration?.dir || DEFAULT_MIGRATION_DIR,
        forkConfig: migrationForkNetworkConfig
    };
});

extendEnvironment((hre) => {});
