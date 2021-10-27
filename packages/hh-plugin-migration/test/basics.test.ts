import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { testHre } from './helpers/hre';
import { init } from './helpers/init';

import { DEFAULT_MIGRATION_DIR } from '../src/constants';
import { testFilesGen } from './helpers/filesGen';

const PROJECT_NAME = 'hardhat-default-migration';

describe(PROJECT_NAME, function () {
    const { PATH_TO_PROJECT_DIR } = init(PROJECT_NAME, { MIGRATION: 1 });

    let hre: HardhatRuntimeEnvironment;

    before(function () {
        hre = this.hre;
    });

    testHre({ dir: DEFAULT_MIGRATION_DIR, forkNetworkConfig: undefined });
    testFilesGen(PATH_TO_PROJECT_DIR);
});
