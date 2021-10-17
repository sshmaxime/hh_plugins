/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { engine } from '../../../../../src/engine/bootloader';
import { IMigration } from '../../../../../src/engine/types/types';
import Contracts from '../../contracts';
import { NextState as InitialState } from './1633304151064_deploy_myContract';

const {
    signer,
    functions: { deploy, execute, deployProxy, upgradeProxy },
    contracts
} = engine.get(Contracts);

export type NextState = InitialState;

const migration: IMigration = {
    up: async (initialState: InitialState): Promise<NextState> => {
        const myContract = await contracts.myContract.attach(initialState.myContract);
        await execute('do something', myContract.setA, 'alpha');

        return initialState;
    },

    healthCheck: async (initialState: InitialState, state: NextState) => {
        const myContract = await contracts.myContract.attach(initialState.myContract);
        if ((await myContract.getA()) != 'alpha') {
            throw new Error('getA error');
        }
    },

    down: async (initialState: InitialState, newState: NextState): Promise<InitialState> => {
        return initialState;
    }
};

export default migration;
