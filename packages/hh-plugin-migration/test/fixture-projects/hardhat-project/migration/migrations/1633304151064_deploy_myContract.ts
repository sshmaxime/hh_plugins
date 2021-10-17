/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { engine } from '../../../../../src/engine/bootloader';
import { IMigration, deployedContract } from '../../../../../src/engine/types/types';
import Contracts from '../../contracts';

const {
    signer,
    functions: { deploy, execute, deployProxy, upgradeProxy },
    contracts
} = engine.get(Contracts);

export type InitialState = unknown;

export type NextState = InitialState & {
    myContract: deployedContract;
};

const migration: IMigration = {
    up: async (initialState: InitialState): Promise<NextState> => {
        const myContract = await deploy(contracts.myContract);

        return {
            myContract: myContract.address
        };
    },

    healthCheck: async (initialState: InitialState, state: NextState) => {},

    down: async (initialState: InitialState, newState: NextState): Promise<InitialState> => {
        return initialState;
    }
};

export default migration;
