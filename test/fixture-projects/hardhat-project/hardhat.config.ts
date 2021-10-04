// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.8.0",

  networks: {
    hardhat: {
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000000000",
      },
    },
  },

  migration: {
    dir: "migration",
  },
};

export default config;
