// tslint:disable-next-line no-implicit-dependencies
import { useEnvironment } from './helpers';

describe('Integration tests examples', function () {
    describe('HardhatConfig extension', function () {
        useEnvironment('hardhat-project');

        it('Test population of HardhatConfig', async function async() {
            await this.hre.run('migrate', {
                reset: true
            });
        });
    });
});
