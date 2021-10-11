import { Signer } from '@ethersproject/abstract-signer';
import { ContractFactory } from '@ethersproject/contracts';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractBuilder, Contract, FactoryConstructor } from '../../engine/contracts/contractBuilder';

export type contracts = {
    [contractName: string]:
        | ReturnType<ReturnType<typeof initDeployOrAttach>['deployOrAttach']>
        | ReturnType<ReturnType<typeof initDeployOrAttach>['attachOnly']>;
};

export type contractsWithConnect = {
    connect: (signer: Signer) => contractsWithConnect;
} & contracts;

export type contractsFunction = (signer?: Signer) => contracts;
export const getContracts = <F extends contractsFunction>(funct: F) => {
    const contracts = funct();

    return {
        connect: (signer: Signer) => funct(signer),

        ...contracts
    } as ReturnType<F> & contractsWithConnect;
};

type ethersPlaceholder = {
    getSigners(): Promise<SignerWithAddress[]>;
};

export const initDeployOrAttach = (ethers: ethersPlaceholder) => {
    const attachOnly = <F extends ContractFactory>(
        FactoryConstructor: FactoryConstructor<F>,
        initialSigner?: Signer
    ) => {
        return {
            attach: async (address: string, signer?: Signer): Promise<Contract<F>> => {
                const defaultSigner = initialSigner || (await ethers.getSigners())[0];
                return new FactoryConstructor(signer || defaultSigner).attach(address) as Contract<F>;
            }
        };
    };

    const deployOrAttach = <F extends ContractFactory>(
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
                bytecode: FactoryConstructor.bytecode
            },
            deploy: async (...args: Parameters<F['deploy']>): Promise<Contract<F>> => {
                const defaultSigner = initialSigner || (await ethers.getSigners())[0];

                return new FactoryConstructor(defaultSigner).deploy(...(args || [])) as Contract<F>;
            },
            attach: attachOnly<F>(FactoryConstructor, initialSigner).attach
        };
    };

    return {
        deployOrAttach,
        attachOnly
    };
};
