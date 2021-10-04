import fs from "fs";
import { NetworkUserConfig } from "hardhat/types";
import path from "path";

export const FORK_PREFIX = "fork-";

export type MigrationForkConfig = ReturnType<
  typeof loadMigrationNetworkConfig
>["hardhatForkConfig"];

const getEnvKey = <T>(envKeyName: string) => {
  return (process.env[envKeyName] as unknown) as T;
};

export const loadMigrationNetworkConfig = (pathToRoot: string) => {
  const configFilePath = path.join(pathToRoot, "config.json");
  const configFile: {
    keys: { [key: string]: string };
    networks: { [key: string]: { url: string; defaultAccount: string } };
  } = fs.existsSync(configFilePath)
    ? JSON.parse(fs.readFileSync(configFilePath, "utf8"))
    : { keys: {}, networks: {} };

  const loadConfigFileNetwork = (networkName: string) => {
    return configFile.networks[networkName] || undefined;
  };

  const migrationNetworks = (() => {
    const networks: {
      [networkName: string]: NetworkUserConfig | undefined;
    } = {};
    for (const networkName in configFile.networks) {
      const defaultAccount = configFile.networks[networkName].defaultAccount;
      const accounts = defaultAccount ? [defaultAccount] : [];

      networks[networkName] = {
        url: configFile.networks[networkName].url,
        accounts: accounts,
      };
    }
    return networks;
  })();

  const hardhatForkConfig = (() => {
    // if it's not a migration, return undefined
    if (!getEnvKey("MIGRATION")) return undefined;

    // check if it's a fork
    const networkToFork: string = getEnvKey("FORK");

    // if it's not a fork, returns
    if (!networkToFork) return undefined;

    // if it is a fork, populate with the proper fork config
    const networkConfig = loadConfigFileNetwork(networkToFork);

    // check the forked network url
    if (!networkConfig?.url) {
      console.log(
        `${networkToFork} config is not present in the config.json file, aborting.`
      );
      process.exit(-1);
    }

    // get the default account of the forked network
    const defaultAccount = (() => {
      const networkConfig = configFile.networks[networkToFork];
      if (!networkConfig) return undefined;

      if (!networkConfig.defaultAccount) return undefined;

      return [
        {
          privateKey: networkConfig.defaultAccount,
          balance: "10000000000000000000000000000",
        },
      ];
    })();

    return {
      hardhatConfig: {
        accounts: defaultAccount,
        forking: {
          url: networkConfig.url,
        },
      },
      networkName: FORK_PREFIX + networkToFork,
      originalNetworkName: networkToFork,
      isFork: true,
    };
  })();

  return {
    networks: migrationNetworks,
    hardhatForkConfig,
  };
};
