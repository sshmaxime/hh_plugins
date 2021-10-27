import { extendConfig } from 'hardhat/config';
import { HardhatConfig, HardhatUserConfig, HttpNetworkConfig, NetworksUserConfig } from 'hardhat/types';
import { resolveConfig } from 'hardhat/internal/core/config/config-resolution';
import { ForkNetworkConfig } from './types';
import { DEFAULT_MIGRATION_DIR, FORK_PREFIX } from './constants';

const loadMigrationForkedNetworkConfig = (
    networkToFork: string,
    hardhatNetworkUserConfig: NetworksUserConfig | undefined
): ForkNetworkConfig => {
    if (!hardhatNetworkUserConfig) {
        console.log(`cannot fork a network if there is no networks in hardhat.config.ts file, aborting.`);
        process.exit(-1);
    }

    // populate with the proper config
    const networkConfig = hardhatNetworkUserConfig[networkToFork] as HttpNetworkConfig;

    // check the forked network url
    if (!networkConfig?.url) {
        console.log(`${networkToFork}'s url is not present in hardhat.config.ts file, aborting.`);
        process.exit(-1);
    }

    return {
        url: networkConfig.url,
        networkName: FORK_PREFIX + networkToFork,
        originalNetworkName: networkToFork
    };
};

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const isMigration: string = process.env['MIGRATION'] as string;
    const networkToFork: string = process.env['FORK'] as string;

    config.migration = {
        dir: userConfig.migration?.dir || DEFAULT_MIGRATION_DIR
    };

    // if it's not a migration, plugin should return
    if (!isMigration) return;

    // if it's not a fork of a network, plugin should return
    if (!networkToFork) return;

    config.migration.forkNetworkConfig = loadMigrationForkedNetworkConfig(networkToFork, userConfig.networks);

    // reconstruct hardhat network config from forked network config
    const networkConfig: HardhatUserConfig = {
        ...userConfig,

        networks: {
            hardhat: {
                forking: {
                    url: config.migration.forkNetworkConfig.url
                }
            }
        }
    };

    // resolve network config from the pre-computed network config
    config.networks = resolveConfig('', networkConfig).networks;
});
