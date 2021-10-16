import { Signer } from '@ethersproject/abstract-signer';
import { initDeployOrAttach } from './deployOrAttach';

export type contracts = {
    [contractName: string]:
        | ReturnType<ReturnType<typeof initDeployOrAttach>['deployOrAttach']>
        | ReturnType<ReturnType<typeof initDeployOrAttach>['attachOnly']>;
};

export type contractsWithConnect = contracts & {
    connect: (signer: Signer) => contractsWithConnect;
};

export const buildContracts = <F extends { (signer?: Signer): contracts }>(funct: F) => {
    return {
        connect: (signer: Signer) => funct(signer),
        ...funct()
    } as ReturnType<F> & contractsWithConnect;
};
