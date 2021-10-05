import {
  MIGRATION_HISTORY_FILE_NAME,
  MIGRATION_STATE_FILE_NAME,
  MIGRATION_DEPLOYMENTS_DIR,
} from "../constants";
import {
  Deployment,
  History,
  HistoryExecution,
  SystemDeployments,
  SystemState,
} from "../types";
import { BigNumber } from "ethers";
import fs from "fs";
import path from "path";

export let io: Io;

const replacer = (_: any, value: any) => {
  const { type, hex } = value;
  if (type === "BigNumber") {
    return BigNumber.from(hex).toString();
  }

  return value;
};

export class Io {
  state;
  history;
  deployment;

  constructor() {
    this.state = {
      write: (state: SystemState, pathToNetworkDir: string) => {
        fs.writeFileSync(
          path.join(pathToNetworkDir, MIGRATION_STATE_FILE_NAME),
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
    };

    this.history = {
      write: (history: History, pathToNetworkDir: string) => {
        fs.writeFileSync(
          path.join(pathToNetworkDir, MIGRATION_HISTORY_FILE_NAME),
          JSON.stringify(history, replacer, 4) + `\n`
        );
        return history;
      },
      writeOne: (
        historyExecution: HistoryExecution,
        pathToNetworkDir: string,
        currentMigrationDataFilename: string
      ) => {
        const migrationHistoryFileName = MIGRATION_HISTORY_FILE_NAME;

        // find the history file in the network directory
        const pathToNetworkDirFiles = fs.readdirSync(pathToNetworkDir);
        const pathToMigrationDeploymentFile = pathToNetworkDirFiles.find(
          (f: string) => f === migrationHistoryFileName
        );

        // if file not found create an empty one
        if (!pathToMigrationDeploymentFile) {
          this.history.write({}, pathToNetworkDir);
        }

        const currentHistory = this.history.fetch(pathToNetworkDir);
        if (!currentHistory[currentMigrationDataFilename]) {
          currentHistory[currentMigrationDataFilename] = {
            executions: [],
          };
        }
        currentHistory[currentMigrationDataFilename].executions.push(
          historyExecution
        );
        this.history.write(currentHistory, pathToNetworkDir);
      },
      fetch: (pathToHistory: string) => {
        return JSON.parse(
          fs.readFileSync(
            path.join(pathToHistory, MIGRATION_HISTORY_FILE_NAME),
            "utf-8"
          )
        ) as History;
      },
    };

    this.deployment = {
      write: (pathToWrite: string, deployments: SystemDeployments) => {
        fs.writeFileSync(
          pathToWrite,
          JSON.stringify(deployments, null, 4) + `\n`
        );

        return deployments;
      },
      writeOne: (
        deployment: Deployment,
        pathToNetworkDir: string,
        currentMigrationDataFileName: string
      ) => {
        const currentMigrationDeploymentFileName =
          currentMigrationDataFileName + ".json";

        // find the migration file in the network deployments directory
        const pathToNetworkMigrationDeploymentDir = path.join(
          pathToNetworkDir,
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
          this.deployment.write(pathToNetworkMigrationDeploymentFile, {});
        }

        const currentDeployments = this.deployment.fetch(
          path.join(pathToNetworkMigrationDeploymentFile)
        );

        // if the metadata of the current contract is not already stored, store it
        if (!currentDeployments[deployment.contractName]) {
          currentDeployments[deployment.contractName] = deployment;
          this.deployment.write(
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
    };
  }
}

export const initIo = () => {
  io = new Io();
};
