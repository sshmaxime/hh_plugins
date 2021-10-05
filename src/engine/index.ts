import { Engine } from "./core/engine";
import { defaultMigrationArgs } from "./core/types";
import { HardhatRuntimeEnvironment as hre } from "hardhat/types";
import { LedgerSigner } from "@ethersproject/hardware-wallets";
import { Wallet } from "@ethersproject/wallet";

export let engine: Engine;

export default async (
  args: defaultMigrationArgs,
  hre: hre,
  task: (a: any, b: hre) => any
) => {
  const signer = args.ledger
    ? new LedgerSigner(hre.ethers.provider, "hid", args.ledgerPath)
    : new Wallet(hre.config.migration.defaultSigner, hre.ethers.provider);
  const address = await signer.getAddress();

  engine = new Engine(
    { signer, address },
    hre.config.migration,
    hre.config.paths.root,
    hre.network.name,
    args
  );

  // go to actual task
  await task(args, hre);
};
