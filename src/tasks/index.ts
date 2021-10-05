import { basicTaskLoader, migrationLoader } from "../engine/core/loaders";
import { task, types } from "hardhat/config";
import path from "path";
import { defaultMigrationArgs } from "../engine/core/types";

// create-migration
export type createMigrationTaskArgs = {
  wordList: string[];
};

const CREATE_MIGRATION_SCRIPT = "create-migration";
task("create-migration", "Create a migration file")
  .addVariadicPositionalParam("wordList", "Name of the migration")
  .setAction(basicTaskLoader(path.join(__dirname, CREATE_MIGRATION_SCRIPT)));

export type migrateParamTaskArgs = {
  reset: boolean;
} & defaultMigrationArgs;

// migrate
const MIGRATE_SCRIPT = "migrate";
task("migrate", "Migrate the network")
  .addFlag("reset", "Reset the migration data")
  .addFlag("ledger", "Signing from a ledger")
  .addParam("ledgerPath", "Ledger path", "m/44'/60'/0'/0", types.string)
  .addParam("gasPrice", "GasPrice in gwei", 0, types.int)
  .addParam(
    "minBlockConfirmations",
    "Number of confirmation to wait",
    1,
    types.int
  )
  .setAction(migrationLoader(path.join(__dirname, MIGRATE_SCRIPT)));
