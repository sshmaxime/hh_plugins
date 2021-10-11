import { Signer } from '@ethersproject/abstract-signer';
import { ethers } from 'hardhat';
import { getContracts, initDeployOrAttach } from '../../../src/engine/contracts/deployOrAttach';
import { MyContract__factory } from './typechain';

const { deployOrAttach, attachOnly } = initDeployOrAttach(ethers);

const contractsFct = (signer?: Signer) => {
    return {
        myContract: deployOrAttach('BancorNetwork', MyContract__factory, signer)
    };
};

export default getContracts(contractsFct);
