import {
  MIGRATION_HISTORY_FILE_NAME,
  MIGRATION_STATE_FILE_NAME,
  MIGRATION_DEPLOYMENTS_DIR,
} from "./config";
import { Engine } from "./engine";
import {
  Deployment,
  History,
  HistoryExecution,
  SystemDeployments,
  SystemState,
} from "./Types";
import { BigNumber } from "ethers";
import fs from "fs";
import path from "path";

const replacer = (_: any, value: any) => {
  const { type, hex } = value;
  if (type === "BigNumber") {
    return BigNumber.from(hex).toString();
  }

  return value;
};

export const initIO = (engine: Engine) => {
  return {
    state: {
      write: (state: SystemState) => {
        fs.writeFileSync(
          path.join(engine.pathToNetworkDir, MIGRATION_STATE_FILE_NAME),
          JSON.stringify(state, replacer, 4) + `\n`
        );

        return state;
      },

      fetch: (pathToState: string) => {
        return JSON.parse(
          fs.readFileSync(
            path.join(pathToState, MIGRATION_STATE_FILE_NAME),
            "utf-8"
          )
        ) as SystemState;
      },
    },

    history: {
      write: (history: History) => {
        fs.writeFileSync(
          path.join(engine.pathToNetworkDir, MIGRATION_HISTORY_FILE_NAME),
          JSON.stringify(history, replacer, 4) + `\n`
        );
        return history;
      },
      writeOne: (historyExecution: HistoryExecution) => {
        const migrationHistoryFileName = MIGRATION_HISTORY_FILE_NAME;

        // find the history file in the network directory
        const pathToNetworkDirFiles = fs.readdirSync(engine.pathToNetworkDir);
        const pathToMigrationDeploymentFile = pathToNetworkDirFiles.find(
          (f: string) => f === migrationHistoryFileName
        );

        // if file not found create an empty one
        if (!pathToMigrationDeploymentFile) {
          engine.IO.history.write({});
        }

        const currentHistory = engine.IO.history.fetch(engine.pathToNetworkDir);
        if (!currentHistory[engine.migration.currentMigrationData.fileName]) {
          currentHistory[engine.migration.currentMigrationData.fileName] = {
            executions: [],
          };
        }
        currentHistory[
          engine.migration.currentMigrationData.fileName
        ].executions.push(historyExecution);
        engine.IO.history.write(currentHistory);
      },
      fetch: (pathToHistory: string) => {
        return JSON.parse(
          fs.readFileSync(
            path.join(pathToHistory, MIGRATION_HISTORY_FILE_NAME),
            "utf-8"
          )
        ) as History;
      },
    },
    deployment: {
      write: (pathToWrite: string, deployments: SystemDeployments) => {
        fs.writeFileSync(
          pathToWrite,
          JSON.stringify(deployments, null, 4) + `\n`
        );

        return deployments;
      },
      writeOne: (deployment: Deployment) => {
        const currentMigrationDeploymentFileName =
          engine.migration.currentMigrationData.fileName + ".json";

        // find the migration file in the network deployments directory
        const pathToNetworkMigrationDeploymentDir = path.join(
          engine.pathToNetworkDir,
          MIGRATION_DEPLOYMENTS_DIR
        );

        // read all files into the directory and fetch needed file
        const pathToMigrationDeploymentFiles = fs.readdirSync(
          pathToNetworkMigrationDeploymentDir
        );
        const pathToMigrationDeploymentFile = pathToMigrationDeploymentFiles.find(
          (f: string) => f === currentMigrationDeploymentFileName
        );

        const pathToNetworkMigrationDeploymentFile = path.join(
          pathToNetworkMigrationDeploymentDir,
          currentMigrationDeploymentFileName
        );

        // if file not found create an empty one
        if (!pathToMigrationDeploymentFile) {
          engine.IO.deployment.write(pathToNetworkMigrationDeploymentFile, {});
        }

        const currentDeployments = engine.IO.deployment.fetch(
          path.join(pathToNetworkMigrationDeploymentFile)
        );

        // if the metadata of the current contract is not already stored, store it
        if (!currentDeployments[deployment.contractName]) {
          currentDeployments[deployment.contractName] = deployment;
          engine.IO.deployment.write(
            pathToNetworkMigrationDeploymentFile,
            currentDeployments
          );
        }
      },
      fetch: (pathToDeployments: string) => {
        return JSON.parse(
          fs.readFileSync(pathToDeployments, "utf-8")
        ) as SystemDeployments;
      },
    },
  };
};
