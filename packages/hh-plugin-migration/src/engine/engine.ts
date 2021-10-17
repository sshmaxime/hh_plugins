import { defaultMigrationArgs } from './types/types';
import { Signer } from 'ethers';
import { MigrationConfig } from '../type-extensions';
import log from './utils/logger';
import { Io } from './modules/core/io';
import { Execution, ExecutionsFunctions } from './modules/execution';
import { Migration } from './modules/migration';
import { Network } from './modules/core/network';
import { Paths } from './modules/core/paths';
import { outputContracts } from 'hh-plugin-contracts';

export class Engine {
    private signer: Signer;
    private signerAddress: string;

    private modules: {
        core: {
            io: Io;
            network: Network;
            paths: Paths;
        };
        migration: Migration;
        execution: Execution;
    };

    constructor(
        migrationConfig: MigrationConfig,
        signerInfo: { signer: Signer; address: string },
        pathToRoot: string,
        hreNetworkName: string,
        args: defaultMigrationArgs
    ) {
        this.signer = signerInfo.signer;
        this.signerAddress = signerInfo.address;

        // module core
        const io = new Io();
        const network = new Network(migrationConfig, hreNetworkName);
        const paths = new Paths(migrationConfig, pathToRoot, network.networkName);

        // module
        const migration = new Migration({ io, network, paths });
        const execution = new Execution(args, { io, network, paths }, migration);

        this.modules = {
            core: {
                io,
                network,
                paths
            },
            migration,
            execution
        };

        log.migrationConfig(this.signerAddress, args.ledger, network, execution.settings, execution.overrides);
    }

    getCommands = () => {
        return {
            migrate: this.modules.migration.migrate,
            reset: this.modules.migration.reset
        };
    };

    get<F extends outputContracts>(
        Contracts: F
    ): {
        signer: Signer;
        signerAddress: string;
        functions: ExecutionsFunctions;
        contracts: F;
    };
    get(): {
        signer: Signer;
        signerAddress: string;
        functions: ExecutionsFunctions;
    };

    get<F extends outputContracts>(Contracts?: F) {
        if (Contracts) {
            const contracts = Contracts.connect(this.signer) as F;

            return {
                signer: this.signer,
                signerAddress: this.signerAddress,
                functions: this.modules.execution.functions,
                contracts: contracts
            };
        }

        return {
            signer: this.signer,
            signerAddress: this.signerAddress,
            functions: this.modules.execution.functions
        };
    }
}
