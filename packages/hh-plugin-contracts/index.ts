import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory } from "@ethersproject/contracts";

// utils
type AsyncReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any;

// custom Contract type
export type Contract<F extends ContractFactory> = AsyncReturnType<F["deploy"]>;

type inputContracts = {
  [contractName: string]:
    | ReturnType<ReturnType<typeof initDeployOrAttach>["deployOrAttach"]>
    | ReturnType<ReturnType<typeof initDeployOrAttach>["attachOnly"]>;
};

export type outputContracts = inputContracts & {
  connect: (signer: Signer) => outputContracts;
};

export interface ContractBuilder<F extends ContractFactory> {
  metadata: {
    contractName: string;
    abi: unknown;
    bytecode: string;
  };
  deploy(...args: Parameters<F["deploy"]>): Promise<Contract<F>>;
  attach(address: string, signer?: Signer): Promise<Contract<F>>;
}

export type FactoryConstructor<F extends ContractFactory> = {
  new (signer?: Signer): F;
  abi: unknown;
  bytecode: string;
};

export const buildContracts = <F extends { (signer?: Signer): inputContracts }>(
  funct: F
) => {
  return {
    connect: (signer: Signer) => funct(signer),
    ...funct(),
  } as ReturnType<F> & outputContracts;
};

export const initDeployOrAttach = (ethers: {
  getSigners(): Promise<any[]>;
}) => {
  const attachOnly = <F extends ContractFactory>(
    FactoryConstructor: FactoryConstructor<F>,
    initialSigner?: Signer
  ) => {
    return {
      attach: async (
        address: string,
        signer?: Signer
      ): Promise<Contract<F>> => {
        const defaultSigner = initialSigner || (await ethers.getSigners())[0];
        return new FactoryConstructor(signer || defaultSigner).attach(
          address
        ) as Contract<F>;
      },
    };
  };

  const deployOrAttach = <F extends ContractFactory>(
    contractName: string,
    FactoryConstructor: FactoryConstructor<F>,
    initialSigner?: Signer
  ): ContractBuilder<F> => {
    return {
      metadata: {
        contractName: contractName,
        abi: FactoryConstructor.abi,
        bytecode: FactoryConstructor.bytecode,
      },
      deploy: async (
        ...args: Parameters<F["deploy"]>
      ): Promise<Contract<F>> => {
        const defaultSigner = initialSigner || (await ethers.getSigners())[0];

        return new FactoryConstructor(defaultSigner).deploy(
          ...(args || [])
        ) as Contract<F>;
      },
      attach: attachOnly<F>(FactoryConstructor, initialSigner).attach,
    };
  };

  return {
    deployOrAttach,
    attachOnly,
  };
};
