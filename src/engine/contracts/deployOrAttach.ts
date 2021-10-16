import { Signer } from '@ethersproject/abstract-signer';
import { ContractFactory } from '@ethersproject/contracts';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractBuilder, Contract, FactoryConstructor } from '../../engine/contracts/contractBuilder';

export const initDeployOrAttach = (ethers: { getSigners(): Promise<SignerWithAddress[]> }) => {
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
