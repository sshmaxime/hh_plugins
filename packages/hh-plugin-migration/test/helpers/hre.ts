import { expect } from 'chai';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { MigrationConfig } from '../../src/types';

export const testHre = (migrationConfig: MigrationConfig) => {
    let hre: HardhatRuntimeEnvironment;

    before(function () {
        hre = this.hre;
    });

    it('hre migration config should be correctly instantiated', () => {
        expect(hre.config.migration.dir).to.equal(migrationConfig.dir);
        expect(hre.config.migration.forkNetworkConfig).to.equal(migrationConfig.forkNetworkConfig);
    });
};
