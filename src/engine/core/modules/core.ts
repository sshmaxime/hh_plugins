import { MigrationConfig } from "../../../type-extensions";
import {
  defaultEngineState,
  MIGRATION_DATA_DIR,
  MIGRATION_DEPLOYMENTS_DIR,
  MIGRATION_FILES_DIR,
} from "../constants";
import fs from "fs-extra";
import path from "path";

import { NetworkSettings } from "../types";
import { isMigrationDirValid } from "../../utils/utils";
import { io } from "./io";
import log from "../../utils/logger";

export let core: Core;

export class Core {
  engineState = defaultEngineState;
  network: NetworkSettings;
  paths: {
    pathToRoot: string;
    pathToMigrationDir: string;
    pathToMigrationFilesDir: string;
    pathToNetworkDir: string;
    pathToNetworkDeploymentsDir: string;
  };

  constructor(
    migrationConfig: MigrationConfig,
    root: string,
    hreNetworkName: string
  ) {
    // network
    const forkConfig = migrationConfig.forkConfig;
    const networkName = forkConfig?.networkName || hreNetworkName;

    // paths
    const pathToRoot = root;
    const pathToMigrationDir = path.join(pathToRoot, migrationConfig.dir);
    const pathToMigrationFilesDir = path.join(
      pathToMigrationDir,
      MIGRATION_FILES_DIR
    );
    const pathToNetworkDir = path.join(
      pathToMigrationDir,
      MIGRATION_DATA_DIR,
      networkName
    );
    const pathToNetworkDeploymentsDir = path.join(
      pathToMigrationDir,
      MIGRATION_DEPLOYMENTS_DIR
    );

    this.network = {
      networkName: networkName,
      originalNetwork: forkConfig?.originalNetworkName || networkName,
      isFork: forkConfig?.isFork || false,
    };

    this.paths = {
      pathToRoot,
      pathToMigrationDir,
      pathToMigrationFilesDir,
      pathToNetworkDir,
      pathToNetworkDeploymentsDir,
    };
  }

  reset = () => {
    log.warning(`Resetting ${core.network.networkName} migration directory`);

    fs.rmSync(this.paths.pathToNetworkDir, {
      recursive: true,
      force: true,
    });

    this.engineState = defaultEngineState;
  };

  initMigrationDefaultDir = () => {
    // init the network directory
    fs.mkdirSync(this.paths.pathToNetworkDir, { recursive: true });

    // init the network deployment directory
    fs.mkdirSync(
      path.join(this.paths.pathToNetworkDir, MIGRATION_DEPLOYMENTS_DIR)
    );

    // initialize the first state to default
    io.state.write(defaultEngineState.state, this.paths.pathToNetworkDir);
  };

  loadEngineState = () => {
    // if network doesn't exist
    if (!fs.existsSync(this.paths.pathToNetworkDir)) {
      if (this.network.isFork) {
        // check if the original network directory is valid and copy it into the current network directory
        try {
          const pathToOriginalNetworkDir = path.join(
            this.paths.pathToRoot,
            MIGRATION_DATA_DIR,
            this.network.originalNetwork
          );

          if (!isMigrationDirValid(pathToOriginalNetworkDir)) {
            throw Error("Invalid migration directory");
          }

          fs.copySync(pathToOriginalNetworkDir, this.paths.pathToNetworkDir);
        } catch {
          log.error(
            `${this.network.originalNetwork} doesn't have a correct config (needed if you want to fork it). Aborting`
          );

          process.exit();
        }
      } else {
        // if not a fork initialize the directory accordingly
        this.initMigrationDefaultDir();
      }
    }

    // if network directory does exist but isn't valid, resetting it
    if (!isMigrationDirValid(this.paths.pathToNetworkDir)) {
      log.warning(
        `${this.network.networkName} migration directory is invalid. Resetting...`
      );

      this.reset();
      this.initMigrationDefaultDir();
    }

    // update current state to the network directory
    this.engineState.state = io.state.fetch(this.paths.pathToNetworkDir);

    // create migrations dir if it doesn't exist
    if (!fs.existsSync(this.paths.pathToMigrationFilesDir)) {
      fs.mkdirSync(this.paths.pathToMigrationFilesDir);
    }

    // generate migration files
    const allMigrationFiles = fs.readdirSync(
      this.paths.pathToMigrationFilesDir
    );
    const migrationFiles = allMigrationFiles.filter((fileName: string) =>
      fileName.endsWith(".ts")
    );
    const migrationFilesPath = migrationFiles.map((fileName: string) =>
      path.join(this.paths.pathToMigrationFilesDir, fileName)
    );

    for (const migrationFilePath of migrationFilesPath) {
      const fileName = path.basename(migrationFilePath);
      const migrationId = Number(fileName.split("_")[0]);

      // store migration that are only after the latest migration
      if (migrationId > this.engineState.state.migrationState.latestMigration) {
        this.engineState.migrationsData.push({
          fullPath: migrationFilePath,
          fileName: fileName,
          migrationTimestamp: migrationId,
        });
      }
    }

    // even if migrations should be automatically sorted by the directory fetching, sort again just in case
    this.engineState.migrationsData.sort((a: any, b: any) =>
      a.migrationTimestamp > b.migrationTimestamp
        ? 1
        : b.migrationTimestamp > a.migrationTimestamp
        ? -1
        : 0
    );
  };
}

export const initSettings = (
  migrationConfig: MigrationConfig,
  root: string,
  hreNetworkName: string
) => {
  core = new Core(migrationConfig, root, hreNetworkName);
};
