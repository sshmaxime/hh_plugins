import { Signer } from '@ethersproject/abstract-signer';
import { ethers } from 'hardhat';
import { initDeployOrAttach, buildContracts } from 'hh-plugin-contracts';
import { MyContract__factory } from './typechain';
import { ProxyAdmin__factory } from './typechain/factories/ProxyAdmin__factory';
import { TransparentUpgradeableProxy__factory } from './typechain/factories/TransparentUpgradeableProxy__factory';
import { MyUpgradeableContract__factory } from './typechain/factories/MyUpgradeableContract__factory';
import { MyUpgradeableContract2__factory } from './typechain/factories/MyUpgradeableContract2__factory';

const { deployOrAttach, attachOnly } = initDeployOrAttach(ethers);

export default buildContracts((signer?: Signer) => {
    return {
        myContract: deployOrAttach('MyContract', MyContract__factory, signer),
        myUpgradeableContract: deployOrAttach('MyUpgradeableContract', MyUpgradeableContract__factory, signer),
        myUpgradeableContract2: deployOrAttach('MyUpgradeableContract2', MyUpgradeableContract2__factory, signer),
        proxyAdmin: deployOrAttach('ProxyAdmin', ProxyAdmin__factory, signer),
        transparentUpgradeableProxy: deployOrAttach(
            'TransparentUpgradeableProxy',
            TransparentUpgradeableProxy__factory,
            signer
        )
    };
});
