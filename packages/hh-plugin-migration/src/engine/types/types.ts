export type GlobalMigrationState = {
    state: SystemState;
    migrationsData: MigrationData[];
    stateSaves: SystemState[];
    currentMigrationData: { fullPath: string; fileName: string; migrationTimestamp: number };
};

export type SystemState = {
    migrationState: {
        latestMigration: number;
    };
    networkState: any;
};

export type MigrationData = {
    fullPath: string;
    fileName: string;
    migrationTimestamp: number;
};

export const defaultGlobalMigrationState: GlobalMigrationState = {
    state: {
        migrationState: {
            latestMigration: -1
        },
        networkState: {}
    },
    migrationsData: [],
    stateSaves: [],
    currentMigrationData: {
        fullPath: '',
        fileName: '',
        migrationTimestamp: -1
    }
};

export type HistoryExecution = {
    type: 'DEPLOY' | 'EXECUTION';
    params: any[];
    description: string;
    tx: string;
};

export type History = {
    [migrationName: string]: {
        executions: HistoryExecution[];
    };
};

export type Deployment = {
    contractName: string;
    abi: any; // object
    bytecode: string;
};
export type SystemDeployments = { [address: string]: Deployment };

export type deployedContract = string;
export type deployedProxy = {
    proxyContract: deployedContract;
    logicContract: deployedContract;
};

export type ExecutionSettings = {
    confirmationToWait: number;
};

export type NetworkSettings = {
    networkName: string;
    isFork: boolean;
    originalNetwork: string;
};

export type defaultMigrationArgs = {
    // ledger
    ledger: boolean;
    ledgerPath: string;

    // settings
    gasPrice: number;
    minBlockConfirmations: number;
};

export interface IMigration {
    up: (initialState: any) => Promise<any>;
    healthCheck: (initialState: any, newState: any) => Promise<any>;
    down: (initialState: any, newState: any) => Promise<any>;
}
