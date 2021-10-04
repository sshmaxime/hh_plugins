import { Engine } from "./Engine";
import { defaultArgs } from "./Types";
import { Signer } from "@ethersproject/abstract-signer";
import { LedgerSigner } from "@ethersproject/hardware-wallets";
import { ethers } from "hardhat";

export const initSigner = async (args: defaultArgs) => {
  const signer = args.ledger
    ? new LedgerSigner(ethers.provider, "hid", args.ledgerPath)
    : (await ethers.getSigners())[0];

  if (!signer) {
    throw new Error("Signer must be defined");
  }

  const signerAddress = await signer.getAddress();

  return { signer, signerAddress };
};
