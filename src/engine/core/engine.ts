import { defaultMigrationArgs } from "./types";
import { Signer } from "ethers";
import { MigrationConfig } from "../../type-extensions";
import log from "../utils/logger";
import { initSettings } from "./modules/core";
import { core } from "./modules/core";
import { initIo } from "./modules/io";
import { execution, initExecution } from "./modules/execution";
import { initMigration, migration } from "./modules/migration";

export class Engine {
  signer: Signer;
  signerAddress: string;

  migrate: typeof migration.migrate;
  functions: typeof execution.functions;

  constructor(
    signerInfo: { signer: Signer; address: string },
    migrationConfig: MigrationConfig,
    pathToRoot: string,
    hreNetworkName: string,
    args: defaultMigrationArgs
  ) {
    this.signer = signerInfo.signer;
    this.signerAddress = signerInfo.address;

    initSettings(migrationConfig, pathToRoot, hreNetworkName);
    initIo();
    initExecution(args);
    initMigration();

    this.migrate = migration.migrate;
    this.functions = execution.functions;

    log.migrationConfig(
      this.signerAddress,
      args.ledger,
      core.network,
      execution.settings,
      execution.overrides
    );
  }
}
