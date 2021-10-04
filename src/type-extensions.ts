// If your plugin extends types from another plugin, you should import the plugin here.
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import "hardhat/types/config";
import "hardhat/types/runtime";
import { MigrationForkConfig } from "./setup";

export interface MigrationUserConfig {
  dir: string;
}

export interface MigrationConfig {
  dir: string;
}

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    migration: MigrationUserConfig;
  }

  export interface HardhatConfig {
    migration: {
      dir: string;
      forkConfig: MigrationForkConfig;
    };
  }
}

declare module "hardhat/types/runtime" {}
