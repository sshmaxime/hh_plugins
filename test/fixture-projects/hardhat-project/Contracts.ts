/* eslint-disable camelcase */
import { MyContract__factory } from "./typechain";
import { ethers } from "hardhat";

/* eslint-enable camelcase */
import { Signer } from "@ethersproject/abstract-signer";
import {
  Contract,
  ContractBuilder,
  FactoryConstructor,
} from "../../engine/contracts/contractBuilder";
import { ContractFactory } from "@ethersproject/contracts";

export const deployOrAttach = <F extends ContractFactory>(
  contractName: string,
  // @TODO: needs to replace with correctly typed params but it doesn't
  // work properly for some reason https://github.com/microsoft/TypeScript/issues/31278
  FactoryConstructor: FactoryConstructor<F>,
  initialSigner?: Signer
): ContractBuilder<F> => {
  return {
    metadata: {
      contractName: contractName,
      abi: FactoryConstructor.abi,
      bytecode: FactoryConstructor.bytecode,
    },
    deploy: async (...args: Parameters<F["deploy"]>): Promise<Contract<F>> => {
      const defaultSigner = initialSigner || (await ethers.getSigners())[0];

      return new FactoryConstructor(defaultSigner).deploy(
        ...(args || [])
      ) as Contract<F>;
    },
    attach: attachOnly<F>(FactoryConstructor, initialSigner).attach,
  };
};

export const attachOnly = <F extends ContractFactory>(
  FactoryConstructor: FactoryConstructor<F>,
  initialSigner?: Signer
) => {
  return {
    attach: async (address: string, signer?: Signer): Promise<Contract<F>> => {
      const defaultSigner = initialSigner || (await ethers.getSigners())[0];
      return new FactoryConstructor(signer || defaultSigner).attach(
        address
      ) as Contract<F>;
    },
  };
};

export const getContracts = (signer?: Signer) => ({
  connect: (signer: Signer) => getContracts(signer),

  MyContract: deployOrAttach("MyContract", MyContract__factory, signer),
});

export type ContractsType = ReturnType<typeof getContracts>;

export default getContracts();
