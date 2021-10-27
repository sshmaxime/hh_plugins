export type ForkNetworkConfig = {
    url: string;
    networkName: string;
    originalNetworkName: string;
};

export interface MigrationUserConfig {
    dir?: string;
}

export interface MigrationConfig {
    dir: string;
    forkNetworkConfig?: ForkNetworkConfig;
}
