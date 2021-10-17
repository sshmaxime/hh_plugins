import { defaultGlobalMigrationState, IMigration, SystemState } from '../types/types';
import path from 'path';
import fs from 'fs-extra';
import { importCsjOrEsModule } from '../utils/loaders';
import log from '../utils/logger';
import { CoreModules } from './core';
import { defaultEngineState, MIGRATION_DATA_DIR, MIGRATION_DEPLOYMENTS_DIR } from '../utils/constants';
import { isMigrationDirValid } from '../utils/utils';

export class Migration {
    globalmigrationState = defaultGlobalMigrationState;

    coreModules: CoreModules;

    constructor({ io, network, paths }: CoreModules) {
        this.coreModules = { io, network, paths };
    }

    migrateOneUp = async (migration: IMigration, timestamp: number, oldNetworkState: any, currentNetworkState: any) => {
        let newNetworkState: any;

        try {
            newNetworkState = await migration.up(currentNetworkState);

            try {
                await migration.healthCheck(oldNetworkState, newNetworkState);

                log.success('Health check success ✨ ');
            } catch (e) {
                log.error('Health check failed');
                log.error(e.stack);

                return undefined;
            }
        } catch (e) {
            log.error('Migration up failed');
            log.error(e.stack);
            log.error('Aborting.');

            process.exit(-1);
        }

        return {
            migrationState: { latestMigration: timestamp },
            networkState: newNetworkState
        };
    };

    migrateOneDown = async (migration: IMigration, oldNetworkSystemState: SystemState, currentNetworkState: any) => {
        let newNetworkState: any;
        try {
            newNetworkState = await migration.down(oldNetworkSystemState.networkState, currentNetworkState);
        } catch (e) {
            log.error('Migration down failed');
            log.error(e.stack);
            log.error('Aborting.');

            process.exit(-1);
        }

        return {
            migrationState: {
                latestMigration: oldNetworkSystemState.migrationState.latestMigration
            },
            networkState: newNetworkState
        };
    };

    migrate = async () => {
        this.loadEngineState();

        // if there is no migration to run, exit
        if (this.globalmigrationState.migrationsData.length === 0) {
            log.done(`Nothing to migrate ⚡️`);

            return;
        }

        this.globalmigrationState.stateSaves.push({ ...this.globalmigrationState.state });

        let index = 0;
        for (; index < this.globalmigrationState.migrationsData.length; index++) {
            const migrationData = this.globalmigrationState.migrationsData[index];

            const migration: IMigration = importCsjOrEsModule(migrationData.fullPath);

            log.info(`Executing ${migrationData.fileName}, timestamp: ${migrationData.migrationTimestamp}`);

            // save the current migration data
            this.globalmigrationState.currentMigrationData = migrationData;

            const newSystemState = await this.migrateOneUp(
                migration,
                migrationData.migrationTimestamp,
                this.globalmigrationState.stateSaves[index].networkState,
                this.globalmigrationState.state.networkState
            );

            if (!newSystemState) {
                break;
            }

            // update migration state
            this.globalmigrationState.state = newSystemState;

            // add current state to saves
            this.globalmigrationState.stateSaves.push({ ...newSystemState });

            // write state to disk
            this.coreModules.io.state.write(newSystemState, this.coreModules.paths.pathToNetworkDir);
        }

        // if the index of the latest migration is not equal to the length of the migrationsData array then an error occurred
        // and we should revert
        if (index !== this.globalmigrationState.migrationsData.length) {
            const migrationData = this.globalmigrationState.migrationsData[index];

            const migration: IMigration = importCsjOrEsModule(migrationData.fullPath);

            log.info(`Reverting ${migrationData.fileName}, timestamp: ${migrationData.migrationTimestamp}`);

            const newSystemState = await this.migrateOneDown(
                migration,
                this.globalmigrationState.stateSaves[index],
                this.globalmigrationState.state.networkState
            );

            // update migration state
            this.globalmigrationState.state = newSystemState;

            // write state to disk
            this.coreModules.io.state.write(this.globalmigrationState.state, this.coreModules.paths.pathToNetworkDir);

            // remove current migration deployment file
            fs.rmSync(
                path.join(
                    this.coreModules.paths.pathToNetworkDeploymentsDir,
                    this.globalmigrationState.currentMigrationData.fileName + '.json'
                ),
                { force: true }
            );

            log.success(`${this.globalmigrationState.currentMigrationData.fileName} reverted`);
        }

        log.done(`\nMigration(s) complete ⚡️`);
    };

    reset = () => {
        log.warning(`Resetting ${this.coreModules.network.networkName} migration directory`);

        fs.rmSync(this.coreModules.paths.pathToNetworkDir, {
            recursive: true,
            force: true
        });

        this.globalmigrationState = defaultEngineState;
    };

    initMigrationDefaultDir = () => {
        // init the network directory
        fs.mkdirSync(this.coreModules.paths.pathToNetworkDir, { recursive: true });

        // init the network deployment directory
        fs.mkdirSync(path.join(this.coreModules.paths.pathToNetworkDir, MIGRATION_DEPLOYMENTS_DIR));

        // initialize the first state to default
        this.coreModules.io.state.write(defaultEngineState.state, this.coreModules.paths.pathToNetworkDir);
    };

    loadEngineState = () => {
        // if network doesn't exist
        if (!fs.existsSync(this.coreModules.paths.pathToNetworkDir)) {
            if (this.coreModules.network.isFork) {
                // check if the original network directory is valid and copy it into the current network directory
                try {
                    const pathToOriginalNetworkDir = path.join(
                        this.coreModules.paths.pathToRoot,
                        MIGRATION_DATA_DIR,
                        this.coreModules.network.originalNetwork
                    );

                    if (!isMigrationDirValid(pathToOriginalNetworkDir)) {
                        throw Error('Invalid migration directory');
                    }

                    fs.copySync(pathToOriginalNetworkDir, this.coreModules.paths.pathToNetworkDir);
                } catch {
                    log.error(
                        `${this.coreModules.network.originalNetwork} doesn't have a correct config (needed if you want to fork it). Aborting`
                    );

                    process.exit();
                }
            } else {
                // if not a fork initialize the directory accordingly
                this.initMigrationDefaultDir();
            }
        }

        // if network directory does exist but isn't valid, resetting it
        if (!isMigrationDirValid(this.coreModules.paths.pathToNetworkDir)) {
            log.warning(`${this.coreModules.network.networkName} migration directory is invalid. Resetting...`);

            this.reset();
            this.initMigrationDefaultDir();
        }

        // update current state to the network directory
        this.globalmigrationState.state = this.coreModules.io.state.fetch(this.coreModules.paths.pathToNetworkDir);

        // create migrations dir if it doesn't exist
        if (!fs.existsSync(this.coreModules.paths.pathToMigrationFilesDir)) {
            fs.mkdirSync(this.coreModules.paths.pathToMigrationFilesDir);
        }

        // generate migration files
        const allMigrationFiles = fs.readdirSync(this.coreModules.paths.pathToMigrationFilesDir);
        const migrationFiles = allMigrationFiles.filter((fileName: string) => fileName.endsWith('.ts'));
        const migrationFilesPath = migrationFiles.map((fileName: string) =>
            path.join(this.coreModules.paths.pathToMigrationFilesDir, fileName)
        );

        for (const migrationFilePath of migrationFilesPath) {
            const fileName = path.basename(migrationFilePath);
            const migrationId = Number(fileName.split('_')[0]);

            // store migration that are only after the latest migration
            if (migrationId > this.globalmigrationState.state.migrationState.latestMigration) {
                this.globalmigrationState.migrationsData.push({
                    fullPath: migrationFilePath,
                    fileName: fileName,
                    migrationTimestamp: migrationId
                });
            }
        }

        // even if migrations should be automatically sorted by the directory fetching, sort again just in case
        this.globalmigrationState.migrationsData.sort((a: any, b: any) =>
            a.migrationTimestamp > b.migrationTimestamp ? 1 : b.migrationTimestamp > a.migrationTimestamp ? -1 : 0
        );
    };
}
