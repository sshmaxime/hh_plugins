import { MigrationData, SystemDeployments, SystemState } from '../types/types';

export const MIGRATION_FILES_DIR = 'migrations';

export const MIGRATION_DATA_DIR = 'data';
export const MIGRATION_DEPLOYMENTS_DIR = 'deployments';

export const MIGRATION_HISTORY_FILE_NAME = 'history.json';
export const MIGRATION_STATE_FILE_NAME = 'state.json';

export const defaultEngineState: {
    state: SystemState;
    deployment: SystemDeployments;
    migrationsData: MigrationData[];
    stateSaves: SystemState[];
    currentMigrationData: MigrationData;
} = {
    state: {
        migrationState: {
            latestMigration: -1
        },
        networkState: {}
    },
    deployment: {},
    migrationsData: [],
    stateSaves: [],
    currentMigrationData: {
        fullPath: '',
        fileName: '',
        migrationTimestamp: -1
    }
};
