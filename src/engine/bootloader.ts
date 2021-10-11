import { Engine } from './engine';
import { defaultMigrationArgs } from './types/types';
import { HardhatRuntimeEnvironment as hre } from 'hardhat/types';
import { LedgerSigner } from '@ethersproject/hardware-wallets';

export let engine: Engine;

export default async (args: defaultMigrationArgs, hre: hre, task: (a: any, b: hre) => any) => {
    const signer = args.ledger
        ? new LedgerSigner(hre.ethers.provider, 'hid', args.ledgerPath)
        : (await hre.ethers.getSigners())[0];
    const address = await signer.getAddress();

    engine = new Engine(hre.config.migration, { signer, address }, hre.config.paths.root, hre.network.name, args);

    // go to actual task
    await task(args, hre);
};
