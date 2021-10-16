import { Signer } from '@ethersproject/abstract-signer';
import { ethers } from 'hardhat';
import { initDeployOrAttach } from '../../../src/engine/contracts/deployOrAttach';
import { buildContracts } from '../../../src/engine/contracts/contracts';
import { MyContract__factory } from './typechain';

const { deployOrAttach, attachOnly } = initDeployOrAttach(ethers);

export default buildContracts((signer?: Signer) => {
    return {
        myContract: deployOrAttach('BancorNetwork', MyContract__factory, signer)
    };
});
