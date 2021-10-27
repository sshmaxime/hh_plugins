import { MigrationConfig } from '../../../types';
import { MIGRATION_DATA_DIR, MIGRATION_DEPLOYMENTS_DIR, MIGRATION_FILES_DIR } from '../../utils/constants';
import path from 'path';

export class Paths {
    pathToRoot: string;
    pathToMigrationDir: string;
    pathToMigrationFilesDir: string;
    pathToNetworkDir: string;
    pathToNetworkDeploymentsDir: string;

    constructor(migrationConfig: MigrationConfig, pathToRoot: string, networkName: string) {
        const pathToMigrationDir = path.join(pathToRoot, migrationConfig.dir);
        const pathToMigrationFilesDir = path.join(pathToMigrationDir, MIGRATION_FILES_DIR);
        const pathToNetworkDir = path.join(pathToMigrationDir, MIGRATION_DATA_DIR, networkName);
        const pathToNetworkDeploymentsDir = path.join(pathToMigrationDir, MIGRATION_DEPLOYMENTS_DIR);

        this.pathToRoot = pathToRoot;
        this.pathToMigrationDir = pathToMigrationDir;
        this.pathToMigrationFilesDir = pathToMigrationFilesDir;
        this.pathToNetworkDir = pathToNetworkDir;
        this.pathToNetworkDeploymentsDir = pathToNetworkDeploymentsDir;
    }
}
