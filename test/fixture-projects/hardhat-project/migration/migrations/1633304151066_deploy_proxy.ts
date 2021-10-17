/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { engine } from '../../../../../src/engine/bootloader';
import { IMigration, deployedContract } from '../../../../../src/engine/types/types';
import Contracts from '../../contracts';
import { NextState as InitialState } from './1633304151065_execute_myContract';

const {
    signer,
    functions: { deploy, execute, deployProxy, upgradeProxy },
    contracts
} = engine.get(Contracts);

export type NextState = InitialState & {
    proxyAdmin: deployedContract;
    myUpgradeableContract: deployedContract;
};

const migration: IMigration = {
    up: async (initialState: InitialState): Promise<NextState> => {
        const proxyAdmin = await contracts.proxyAdmin.deploy();

        const myUpgradeableContract = await deployProxy(
            proxyAdmin,
            contracts.transparentUpgradeableProxy,
            contracts.myUpgradeableContract,
            [],
            [],
            true
        );

        return {
            ...initialState,
            proxyAdmin: proxyAdmin.address,
            myUpgradeableContract: myUpgradeableContract.proxy.address
        };
    },

    healthCheck: async (initialState: InitialState, state: NextState) => {
        const myUpgradeableContract = await contracts.myUpgradeableContract.attach(state.myUpgradeableContract);
        if ((await myUpgradeableContract.returnMeSomething()) != 'alpha') {
            throw new Error("didn't return alpha");
        }
    },

    down: async (initialState: InitialState, newState: NextState): Promise<InitialState> => {
        return initialState;
    }
};

export default migration;
