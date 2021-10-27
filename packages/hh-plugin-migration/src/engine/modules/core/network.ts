import { MigrationConfig } from '../../../types';

export class Network {
    networkName: string;
    isFork: boolean;
    originalNetwork: string;

    constructor(migrationConfig: MigrationConfig, hreNetworkName: string) {
        const forkConfig = migrationConfig.forkNetworkConfig;

        this.networkName = forkConfig?.networkName || hreNetworkName;
        this.originalNetwork = forkConfig?.originalNetworkName || hreNetworkName;
        this.isFork = forkConfig !== undefined;
    }
}
