import { MigrationUserConfig, MigrationConfig } from './types';

declare module 'hardhat/types/config' {
    export interface HardhatUserConfig {
        migration?: MigrationUserConfig;
    }

    export interface HardhatConfig {
        migration: MigrationConfig;
    }
}
