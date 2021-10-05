import {
  defaultMigrationArgs,
  ExecutionSettings,
  NetworkSettings,
} from "../types";
import { parseUnits } from "@ethersproject/units";
import { ContractBuilder, Contract } from "../../contracts/contractBuilder";
import {
  ContractFactory,
  ContractReceipt,
  ContractTransaction,
  Overrides,
} from "ethers";
import log from "../../utils/logger";
import { io } from "./io";
import { core } from "./core";

export let execution: Execution;

type initializeArgs = Parameters<any>;
type proxy<F extends ContractFactory> = {
  proxy: Contract<F>;
  logicContractAddress: string;
};

export type executionFunctionsType = ReturnType<
  typeof Execution.prototype._initExecutionFunctions
>;
export class Execution {
  settings: ExecutionSettings;
  overrides: Overrides;
  functions: executionFunctionsType;

  constructor(args: defaultMigrationArgs) {
    this.settings = {
      confirmationToWait: args.minBlockConfirmations,
    };

    this.overrides = {
      gasPrice:
        args.gasPrice === 0
          ? undefined
          : parseUnits(args.gasPrice.toString(), "gwei"),
    };

    this.functions = this._initExecutionFunctions();

    const isForkOrHardhat =
      core.network.isFork || core.network.networkName === "hardhat";
    if (this.settings.confirmationToWait <= 1 && !isForkOrHardhat) {
      throw new Error(
        `Transaction confirmation should be higher than 1 for ${core.network.networkName} use. Aborting`
      );
    }

    if (!this.overrides.gasPrice && !isForkOrHardhat) {
      throw new Error(
        `Gas Price should be larger than 0 for ${core.network.networkName} use. Aborting`
      );
    }
  }

  _initExecutionFunctions = () => {
    const deploy = async <F extends ContractFactory>(
      factory: ContractBuilder<F>,
      ...args: Parameters<ContractBuilder<F>["deploy"]>
    ): Promise<ReturnType<ContractBuilder<F>["deploy"]>> => {
      log.basicExecutionHeader(
        "Deploying",
        `${factory.metadata.contractName} 🚀 `,
        args
      );

      const contract = await factory.deploy(
        ...([...args, this.overrides] as any)
      );

      log.debug(`Deployment tx: `, contract.deployTransaction.hash);
      log.greyed(`Waiting to be mined...`);

      const receipt = await contract.deployTransaction.wait(
        this.settings.confirmationToWait
      );
      if (receipt.status !== 1) {
        throw new Error(
          `Error deploying, tx: ${contract.deployTransaction.hash}`
        );
      }

      io.deployment.writeOne(
        factory.metadata,
        core.paths.pathToNetworkDir,
        core.engineState.currentMigrationData.fileName
      );
      io.history.writeOne(
        {
          type: "DEPLOY",
          params: args,
          description: factory.metadata.contractName,
          tx: contract.deployTransaction.hash,
        },
        core.paths.pathToNetworkDir,
        core.engineState.currentMigrationData.fileName
      );

      log.success(
        `Deployed ${factory.metadata.contractName} at ${contract.address} 🚀 !`
      );

      return contract;
    };

    const execute = async <
      T extends (...args: any[]) => Promise<ContractTransaction>
    >(
      executionInstruction: string,
      func: T,
      ...args: Parameters<T>
    ): Promise<ContractReceipt> => {
      log.basicExecutionHeader("Executing", executionInstruction, args);

      const tx = await func(...args, this.overrides);

      log.debug(`Executing tx: `, tx.hash);

      const receipt = await tx.wait(this.settings.confirmationToWait);
      if (receipt.status !== 1) {
        throw new Error(`Error executing, tx: ${tx.hash}`);
      }

      io.history.writeOne(
        {
          type: "EXECUTION",
          params: args,
          description: executionInstruction,
          tx: tx.hash,
        },
        core.paths.pathToNetworkDir,
        core.engineState.currentMigrationData.fileName
      );

      log.success(`Executed ✨`);

      return receipt;
    };

    const deployProxy = async <F extends ContractFactory>(
      admin: {
        address: string;
      },
      proxyContractToDeploy: ContractBuilder<F>,
      logicContractToDeploy: ContractBuilder<F>,
      initializeArgs: initializeArgs,
      ctorArgs: Parameters<F["deploy"]>,
      skipInitialization?: boolean
    ): Promise<proxy<F>> => {
      log.debug("Deploying proxy");

      const logicContract = await deploy(logicContractToDeploy, ...ctorArgs);

      const data = skipInitialization
        ? []
        : logicContract.interface.encodeFunctionData(
            "initialize",
            initializeArgs
          );

      const proxy = await deploy(
        proxyContractToDeploy as any,
        logicContract.address,
        admin.address,
        data
      );

      log.success("Proxy deployed 🚀 ");

      return {
        proxy: await logicContractToDeploy.attach(proxy.address),
        logicContractAddress: logicContract.address,
      };
    };

    const upgradeProxy = async <F extends ContractFactory>(
      admin: any,
      logicContractToDeploy: ContractBuilder<F>,
      proxyAddress: string,
      initializeArgs: {
        params: Parameters<any>;
        initializeFunction: string;
      },
      ctorArgs: Parameters<F["deploy"]>,
      skipInitialization?: boolean
    ): Promise<proxy<F>> => {
      log.debug("Upgrading proxy");

      const newLogicContract = await deploy(logicContractToDeploy, ...ctorArgs);

      if (skipInitialization) {
        await execute(
          "Upgrading proxy",
          admin.upgrade,
          proxyAddress,
          newLogicContract.address
        );
      } else {
        await execute(
          `Upgrading proxy and call ${initializeArgs.initializeFunction}`,
          admin.upgradeAndCall,
          proxyAddress,
          newLogicContract.address,
          newLogicContract.interface.encodeFunctionData(
            initializeArgs.initializeFunction,
            initializeArgs.params
          )
        );
      }

      log.success("Proxy upgraded 🚀 ");

      return {
        proxy: await logicContractToDeploy.attach(proxyAddress),
        logicContractAddress: newLogicContract.address,
      };
    };
    return { deploy, execute, deployProxy, upgradeProxy };
  };
}

export const initExecution = (args: defaultMigrationArgs) => {
  execution = new Execution(args);
};
