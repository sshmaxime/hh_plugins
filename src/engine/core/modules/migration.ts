import { Migration, SystemState } from "../types";
import path from "path";
import fs from "fs";
import { importCsjOrEsModule } from "../loaders";
import log from "../../utils/logger";
import { core } from "./core";
import { io } from "./io";

export let migration: MigrationModule;

export class MigrationModule {
  constructor() {}

  migrateOneUp = async (
    migration: Migration,
    timestamp: number,
    oldNetworkState: any,
    currentNetworkState: any
  ) => {
    let newNetworkState: any;

    try {
      newNetworkState = await migration.up(currentNetworkState);

      try {
        await migration.healthCheck(oldNetworkState, newNetworkState);

        log.success("Health check success ✨ ");
      } catch (e) {
        log.error("Health check failed");
        log.error(e.stack);

        return undefined;
      }
    } catch (e) {
      log.error("Migration up failed");
      log.error(e.stack);
      log.error("Aborting.");

      process.exit(-1);
    }

    return {
      migrationState: { latestMigration: timestamp },
      networkState: newNetworkState,
    };
  };

  migrateOneDown = async (
    migration: Migration,
    oldNetworkSystemState: SystemState,
    currentNetworkState: any
  ) => {
    let newNetworkState: any;
    try {
      newNetworkState = await migration.down(
        oldNetworkSystemState.networkState,
        currentNetworkState
      );
    } catch (e) {
      log.error("Migration down failed");
      log.error(e.stack);
      log.error("Aborting.");

      process.exit(-1);
    }

    return {
      migrationState: {
        latestMigration: oldNetworkSystemState.migrationState.latestMigration,
      },
      networkState: newNetworkState,
    };
  };

  migrate = async () => {
    core.loadEngineState();

    // if there is no migration to run, exit
    if (core.engineState.migrationsData.length === 0) {
      log.done(`Nothing to migrate ⚡️`);

      return;
    }

    core.engineState.stateSaves.push({
      ...core.engineState.state,
    });

    let index = 0;
    for (; index < core.engineState.migrationsData.length; index++) {
      const migrationData = core.engineState.migrationsData[index];

      const migration: Migration = importCsjOrEsModule(migrationData.fullPath);

      log.info(
        `Executing ${migrationData.fileName}, timestamp: ${migrationData.migrationTimestamp}`
      );

      // save the current migration data
      core.engineState.currentMigrationData = migrationData;

      const newSystemState = await this.migrateOneUp(
        migration,
        migrationData.migrationTimestamp,
        core.engineState.stateSaves[index].networkState,
        core.engineState.state.networkState
      );

      if (!newSystemState) {
        break;
      }

      // update migration state
      core.engineState.state = newSystemState;

      // add current state to saves
      core.engineState.stateSaves.push({ ...newSystemState });

      // write state to disk
      io.state.write(newSystemState, core.paths.pathToNetworkDir);
    }

    // if the index of the latest migration is not equal to the length of the migrationsData array then an error occurred
    // and we should revert
    if (index !== core.engineState.migrationsData.length) {
      const migrationData = core.engineState.migrationsData[index];

      const migration: Migration = importCsjOrEsModule(migrationData.fullPath);

      log.info(
        `Reverting ${migrationData.fileName}, timestamp: ${migrationData.migrationTimestamp}`
      );

      const newSystemState = await this.migrateOneDown(
        migration,
        core.engineState.stateSaves[index],
        core.engineState.state.networkState
      );

      // update migration state
      core.engineState.state = newSystemState;

      // write state to disk
      io.state.write(core.engineState.state, core.paths.pathToNetworkDir);

      // remove current migration deployment file
      fs.rmSync(
        path.join(
          core.paths.pathToNetworkDeploymentsDir,
          core.engineState.currentMigrationData.fileName + ".json"
        ),
        { force: true }
      );

      log.success(`${core.engineState.currentMigrationData.fileName} reverted`);
    }

    log.done(`\nMigration(s) complete ⚡️`);
  };
}

export const initMigration = () => {
  migration = new MigrationModule();
};
