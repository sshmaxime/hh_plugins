import { ContractBuilder, Contract } from "./contractBuilder";
import { Engine } from "./engine";
import { log } from "./Logger";
import { ContractFactory, ContractReceipt, ContractTransaction } from "ethers";

type initializeArgs = Parameters<any>;
type proxy<F extends ContractFactory> = {
  proxy: Contract<F>;
  logicContractAddress: string;
};

export const initExecutionFunctions = (engine: Engine) => {
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
      ...([...args, engine.overrides] as any)
    );

    log.debug(`Deployment tx: `, contract.deployTransaction.hash);
    log.greyed(`Waiting to be mined...`);

    const receipt = await contract.deployTransaction.wait(
      engine.executionSettings.confirmationToWait
    );
    if (receipt.status !== 1) {
      throw new Error(
        `Error deploying, tx: ${contract.deployTransaction.hash}`
      );
    }

    engine.IO.deployment.writeOne(factory.metadata);
    engine.IO.history.writeOne({
      type: "DEPLOY",
      params: args,
      description: factory.metadata.contractName,
      tx: contract.deployTransaction.hash,
    });

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

    const tx = await func(...args, engine.overrides);

    log.debug(`Executing tx: `, tx.hash);

    const receipt = await tx.wait(engine.executionSettings.confirmationToWait);
    if (receipt.status !== 1) {
      throw new Error(`Error executing, tx: ${tx.hash}`);
    }

    engine.IO.history.writeOne({
      type: "EXECUTION",
      params: args,
      description: executionInstruction,
      tx: tx.hash,
    });

    log.success(`Executed ✨`);

    return receipt;
  };

  // const deployProxy = async <F extends ContractFactory>(
  //   admin: any,
  //   logicContractToDeploy: ContractBuilder<F>,
  //   initializeArgs: initializeArgs,
  //   ctorArgs: Parameters<F["deploy"]>,
  //   skipInitialization?: boolean
  // ): Promise<proxy<F>> => {
  //   log.debug("Deploying proxy");

  //   const logicContract = await deploy(logicContractToDeploy, ...ctorArgs);

  //   const data = skipInitialization
  //     ? []
  //     : logicContract.interface.encodeFunctionData(
  //         "initialize",
  //         initializeArgs
  //       );

  //   const proxy = await deploy(
  //     engine.contracts.TransparentUpgradeableProxy,
  //     logicContract.address,
  //     admin.address,
  //     data
  //   );

  //   log.success("Proxy deployed 🚀 ");

  //   return {
  //     proxy: await logicContractToDeploy.attach(proxy.address),
  //     logicContractAddress: logicContract.address,
  //   };
  // };

  // const upgradeProxy = async <F extends ContractFactory>(
  //   admin: any,
  //   logicContractToDeploy: ContractBuilder<F>,
  //   proxyAddress: string,
  //   initializeArgs: {
  //     params: Parameters<any>;
  //     initializeFunction: string;
  //   },
  //   ctorArgs: Parameters<F["deploy"]>,
  //   skipInitialization?: boolean
  // ): Promise<proxy<F>> => {
  //   log.debug("Upgrading proxy");

  //   const newLogicContract = await deploy(logicContractToDeploy, ...ctorArgs);

  //   if (skipInitialization) {
  //     await execute(
  //       "Upgrading proxy",
  //       admin.upgrade,
  //       proxyAddress,
  //       newLogicContract.address
  //     );
  //   } else {
  //     await execute(
  //       `Upgrading proxy and call ${initializeArgs.initializeFunction}`,
  //       admin.upgradeAndCall,
  //       proxyAddress,
  //       newLogicContract.address,
  //       newLogicContract.interface.encodeFunctionData(
  //         initializeArgs.initializeFunction,
  //         initializeArgs.params
  //       )
  //     );
  //   }

  //   log.success("Proxy upgraded 🚀 ");

  //   return {
  //     proxy: await logicContractToDeploy.attach(proxyAddress),
  //     logicContractAddress: newLogicContract.address,
  //   };
  // };

  return { deploy, execute };
  // return { deploy, execute, deployProxy, upgradeProxy };
};
