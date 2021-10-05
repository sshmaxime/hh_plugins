import { HttpNetworkConfig, NetworksUserConfig } from "hardhat/types";
import { MigrationUserConfig } from "./type-extensions";

export const FORK_PREFIX = "fork-";

const getEnvKey = <T>(envKeyName: string) => {
  return (process.env[envKeyName] as unknown) as T;
};

export type ForkMigrationNetworkConfig = ReturnType<
  typeof loadMigrationForkNetworkConfig
>;
export const loadMigrationForkNetworkConfig = (
  hardhatNetworkUserConfig: NetworksUserConfig | undefined,
  _: MigrationUserConfig | undefined
) => {
  // if it's not a migration, return undefined
  if (!getEnvKey("MIGRATION")) return undefined;

  // check if it's a fork
  const networkToFork: string = getEnvKey("FORK");

  // if it's not a fork, returns
  if (!networkToFork) return undefined;

  if (!hardhatNetworkUserConfig) {
    console.log(
      `no networks field present in hardhat.config.ts file, aborting.`
    );
    process.exit(-1);
  }

  // if it is a fork, populate with the proper config
  const networkConfig = hardhatNetworkUserConfig[
    networkToFork
  ] as HttpNetworkConfig;

  // check the forked network url
  if (!networkConfig?.url) {
    console.log(
      `${networkToFork}'s url is not present in hardhat.config.ts file, aborting.`
    );
    process.exit(-1);
  }

  return {
    hardhatConfig: {
      accounts: undefined,
      forking: {
        url: networkConfig.url,
      },
    },
    networkName: FORK_PREFIX + networkToFork,
    originalNetworkName: networkToFork,
    isFork: true,
  };
};
