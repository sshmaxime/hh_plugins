import { defaultMigrationArgs, ExecutionSettings, NetworkSettings } from '../types/types';
import { parseUnits } from '@ethersproject/units';
import { ContractBuilder, Contract } from '../contracts/contractBuilder';
import { ContractFactory, ContractReceipt, ContractTransaction, Overrides } from 'ethers';
import log from '../utils/logger';
import { Network } from './core/network';
import { Io } from './core/io';
import { Paths } from './core/paths';
import { CoreModules } from './core';
import { Migration } from './migration';

export let execution: Execution;

type initializeArgs = Parameters<any>;
type proxy<F extends ContractFactory> = {
    proxy: Contract<F>;
    logicContractAddress: string;
};

export type ExecutionsFunctions = ReturnType<typeof Execution.prototype.initFunctions>;
export class Execution {
    settings: ExecutionSettings;
    overrides: Overrides;
    functions: ExecutionsFunctions;

    constructor(args: defaultMigrationArgs, { io, network, paths }: CoreModules, migration: Migration) {
        this.settings = {
            confirmationToWait: args.minBlockConfirmations
        };

        this.overrides = {
            gasPrice: args.gasPrice === 0 ? undefined : parseUnits(args.gasPrice.toString(), 'gwei')
        };

        this.functions = this.initFunctions(io, paths, migration);

        this.healthcheck(network);
    }

    healthcheck = (network: Network) => {
        const isForkOrHardhat = network.isFork || network.networkName === 'hardhat';
        if (this.settings.confirmationToWait <= 1 && !isForkOrHardhat) {
            throw new Error(
                `Transaction confirmation should be higher than 1 for ${network.networkName} use. Aborting`
            );
        }

        if (!this.overrides.gasPrice && !isForkOrHardhat) {
            throw new Error(`Gas Price should be larger than 0 for ${network.networkName} use. Aborting`);
        }
    };

    initFunctions = (io: Io, paths: Paths, migration: Migration) => {
        const deploy = async <F extends ContractFactory>(
            factory: ContractBuilder<F>,
            ...args: Parameters<ContractBuilder<F>['deploy']>
        ): Promise<ReturnType<ContractBuilder<F>['deploy']>> => {
            log.basicExecutionHeader('Deploying', `${factory.metadata.contractName} 🚀 `, args);

            const contract = await factory.deploy(...([...args, this.overrides] as any));

            log.debug(`Deployment tx: `, contract.deployTransaction.hash);
            log.greyed(`Waiting to be mined...`);

            const receipt = await contract.deployTransaction.wait(this.settings.confirmationToWait);
            if (receipt.status !== 1) {
                throw new Error(`Error deploying, tx: ${contract.deployTransaction.hash}`);
            }

            io.deployment.writeOne(
                factory.metadata,
                paths.pathToNetworkDir,
                migration.globalmigrationState.currentMigrationData.fileName
            );
            io.history.writeOne(
                {
                    type: 'DEPLOY',
                    params: args,
                    description: factory.metadata.contractName,
                    tx: contract.deployTransaction.hash
                },
                paths.pathToNetworkDir,
                migration.globalmigrationState.currentMigrationData.fileName
            );

            log.success(`Deployed ${factory.metadata.contractName} at ${contract.address} 🚀 !`);

            return contract;
        };

        const execute = async <T extends (...args: any[]) => Promise<ContractTransaction>>(
            executionInstruction: string,
            func: T,
            ...args: Parameters<T>
        ): Promise<ContractReceipt> => {
            log.basicExecutionHeader('Executing', executionInstruction, args);

            const tx = await func(...args, this.overrides);

            log.debug(`Executing tx: `, tx.hash);

            const receipt = await tx.wait(this.settings.confirmationToWait);
            if (receipt.status !== 1) {
                throw new Error(`Error executing, tx: ${tx.hash}`);
            }

            io.history.writeOne(
                {
                    type: 'EXECUTION',
                    params: args,
                    description: executionInstruction,
                    tx: tx.hash
                },
                paths.pathToNetworkDir,
                migration.globalmigrationState.currentMigrationData.fileName
            );

            log.success(`Executed ✨`);

            return receipt;
        };

        const deployProxy = async <F extends ContractFactory, K extends ContractFactory>(
            admin: {
                address: string;
            },
            proxyContractToDeploy: ContractBuilder<F>,
            logicContractToDeploy: ContractBuilder<K>,
            initializeArgs: initializeArgs,
            ctorArgs: Parameters<K['deploy']>,
            skipInitialization?: boolean
        ): Promise<proxy<K>> => {
            log.debug('Deploying proxy');

            const logicContract = await this.functions.deploy(logicContractToDeploy, ...ctorArgs);

            const data = skipInitialization
                ? []
                : logicContract.interface.encodeFunctionData('initialize', initializeArgs);

            const proxy = await this.functions.deploy(
                proxyContractToDeploy as any,
                logicContract.address,
                admin.address,
                data
            );

            log.success('Proxy deployed 🚀 ');

            return {
                proxy: await logicContractToDeploy.attach(proxy.address),
                logicContractAddress: logicContract.address
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
            ctorArgs: Parameters<F['deploy']>,
            skipInitialization?: boolean
        ): Promise<proxy<F>> => {
            log.debug('Upgrading proxy');

            const newLogicContract = await this.functions.deploy(logicContractToDeploy, ...ctorArgs);

            if (skipInitialization) {
                await this.functions.execute('Upgrading proxy', admin.upgrade, proxyAddress, newLogicContract.address);
            } else {
                await this.functions.execute(
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

            log.success('Proxy upgraded 🚀 ');

            return {
                proxy: await logicContractToDeploy.attach(proxyAddress),
                logicContractAddress: newLogicContract.address
            };
        };

        return {
            deploy,
            execute,
            deployProxy,
            upgradeProxy
        };
    };
}
