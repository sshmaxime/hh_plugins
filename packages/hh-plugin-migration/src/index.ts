// If your plugin extends types from another plugin, you should import the plugin here.
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import 'hardhat/types/config';
import 'hardhat/types/runtime';

// include your type extensions in npm package's types file
import './type-extensions';

// extend capabilities
import './extend.ts';

// import tasks
import './tasks';

// exports
import { engine } from './engine/bootloader';
import { IMigration, deployedContract, deployedProxy } from './engine/types/types';

export { engine, IMigration, deployedContract, deployedProxy };
