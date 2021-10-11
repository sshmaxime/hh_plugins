// We load the plugin here.
import { HardhatUserConfig } from 'hardhat/types';

import '../../../src/index';
import '@typechain/hardhat';

const config: HardhatUserConfig = {
    solidity: '0.8.0',

    networks: {
        hardhat: {
            accounts: {
                count: 10,
                accountsBalance: '10000000000000000000000000000'
            }
        },
        mainnet: {
            url: ''
        }
    }
};

export default config;
