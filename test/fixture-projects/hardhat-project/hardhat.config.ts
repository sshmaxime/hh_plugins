// We load the plugin here.
import { HardhatUserConfig } from 'hardhat/types';

import '../../../src/index';
import 'hardhat-dependency-compiler';
import '@typechain/hardhat';

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.9',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                    metadata: {
                        bytecodeHash: 'none'
                    },
                    outputSelection: {
                        '*': {
                            '*': ['storageLayout'] // Enable slots, offsets and types of the contract's state variables
                        }
                    }
                }
            }
        ]
    },

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
    },

    dependencyCompiler: {
        paths: [
            '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol',
            '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol'
        ]
    }
};

export default config;
