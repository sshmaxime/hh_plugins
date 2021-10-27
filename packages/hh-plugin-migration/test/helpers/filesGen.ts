import { expect } from 'chai';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import path from 'path';
import {
    MIGRATION_DATA_DIR,
    MIGRATION_FILES_DIR,
    MIGRATION_STATE_FILE_NAME,
    MIGRATION_DEPLOYMENTS_DIR,
    MIGRATION_HISTORY_FILE_NAME
} from '../../src/engine/utils/constants';
import fs from 'fs';

export const testFilesGen = (pathToProject: string) => {
    let hre: HardhatRuntimeEnvironment;

    let pathToMigrationDir: string;

    let pathToMigrationFiles: string;
    let pathToMigrationData: string;

    let networkName: string;

    before(async function () {
        hre = this.hre;

        await this.hre.run('migrate');

        pathToMigrationDir = path.join(pathToProject, hre.config.migration.dir);

        pathToMigrationFiles = path.join(pathToMigrationDir, MIGRATION_FILES_DIR);
        pathToMigrationData = path.join(pathToMigrationDir, MIGRATION_DATA_DIR);

        networkName = hre.config.migration.forkNetworkConfig?.networkName || hre.network.name;
    });

    it('migration data should be generated in the proper folder', () => {
        expect(fs.existsSync(path.join(pathToMigrationData, networkName))).to.be.true;
    });

    context('deployments folder', () => {
        it('folder should be generated', () => {
            expect(fs.existsSync(path.join(pathToMigrationData, networkName, MIGRATION_DEPLOYMENTS_DIR))).to.be.true;
        });
    });

    context('history file', () => {
        it('file should be generated', () => {
            expect(fs.existsSync(path.join(pathToMigrationData, networkName, MIGRATION_HISTORY_FILE_NAME))).to.be.true;
        });
    });

    context('state file', () => {
        it('file should be generated', () => {
            expect(fs.existsSync(path.join(pathToMigrationData, networkName, MIGRATION_STATE_FILE_NAME))).to.be.true;
        });
    });
};
