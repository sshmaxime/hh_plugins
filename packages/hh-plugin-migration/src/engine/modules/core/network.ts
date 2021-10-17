import { MigrationConfig } from "../../../type-extensions";

export class Network {
    networkName: string;
    isFork: boolean;
    originalNetwork: string;

    constructor(migrationConfig: MigrationConfig, hreNetworkName: string) {
        const forkConfig = migrationConfig.forkConfig;

        this.networkName = forkConfig?.networkName || hreNetworkName;
        this.originalNetwork =
            forkConfig?.originalNetworkName || hreNetworkName;
        this.isFork = forkConfig?.isFork || false;
    }
}
