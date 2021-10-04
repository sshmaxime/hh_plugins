/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { engine } from "hh_migration";
import { deployedContract, Migration } from "../engine/types";
import { utils } from "ethers";

const { signer } = engine;
const { deploy, execute } = engine.executionFunctions;

export type InitialState = unknown;

export type NextState = InitialState & {};

const TOTAL_SUPPLY = utils.parseEther("100000000");

const migration: Migration = {
  up: async (initialState: InitialState): Promise<NextState> => {
    return {};
  },

  healthCheck: async (initialState: InitialState, state: NextState) => {},

  down: async (
    initialState: InitialState,
    newState: NextState
  ): Promise<InitialState> => {
    return initialState;
  },
};

export default migration;
