/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { engine } from '../../../../../src/engine/bootloader';
import { IMigration } from '../../../../../src/engine/types/types';
import Contracts from '../../contracts';
import { NextState as InitialState } from './1633304151066_deploy_proxy';

const {
    signer,
    functions: { deploy, execute, deployProxy, upgradeProxy },
    contracts
} = engine.get(Contracts);

export type NextState = InitialState;

const migration: IMigration = {
    up: async (initialState: InitialState): Promise<NextState> => {
        const proxyAdmin = await contracts.proxyAdmin.attach(initialState.proxyAdmin);

        await upgradeProxy(
            proxyAdmin,
            contracts.myUpgradeableContract2,
            initialState.myUpgradeableContract,
            { params: [], initializeFunction: '' },
            [],
            true
        );

        return initialState;
    },

    healthCheck: async (initialState: InitialState, state: NextState) => {
        const myUpgradeableContract = await contracts.myUpgradeableContract.attach(state.myUpgradeableContract);
        if ((await myUpgradeableContract.returnMeSomething()) !== 'beta') {
            throw new Error("didn't return beta");
        }
    },

    down: async (initialState: InitialState, newState: NextState): Promise<InitialState> => {
        return initialState;
    }
};

export default migration;
