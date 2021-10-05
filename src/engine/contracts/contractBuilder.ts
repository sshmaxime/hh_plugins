/* eslint-enable camelcase */
import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory } from "@ethersproject/contracts";

export type AsyncReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any;

export type Contract<F extends ContractFactory> = AsyncReturnType<F["deploy"]>;

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
