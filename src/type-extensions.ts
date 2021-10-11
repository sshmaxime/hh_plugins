// If your plugin extends types from another plugin, you should import the plugin here.
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import 'hardhat/types/config';
import 'hardhat/types/runtime';
import { ForkMigrationNetworkConfig } from './extend.setup';

export interface MigrationUserConfig {
    dir?: string;
}

export interface MigrationConfig {
    dir: string;
    forkConfig: ForkMigrationNetworkConfig;
}

declare module 'hardhat/types/config' {
    export interface HardhatUserConfig {
        migration?: MigrationUserConfig;
    }

    export interface HardhatConfig {
        migration: MigrationConfig;
    }
}

declare module 'hardhat/types/runtime' {}
