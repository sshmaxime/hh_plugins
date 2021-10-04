import { createMigrationTaskArgs } from ".";
import fs from "fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import { MIGRATION_FILES_DIR } from "../engine/config";

const SAMPLE_MIGRATION_PATH = path.resolve(
  __dirname,
  process.env.DEV
    ? "../examples/0_deploy_my_token.test.ts"
    : "../examples/0_deploy_my_token.ts"
);

export default async (
  args: createMigrationTaskArgs,
  hre: HardhatRuntimeEnvironment
) => {
  // concatenate all words to form the migration file name
  const migrationFileName = args.wordList.join("_");

  const migrationFilesDir = path.join(
    hre.config.paths.root,
    hre.config.migration.dir,
    MIGRATION_FILES_DIR
  );

  // if migration folder doesn't exist yet, create it
  if (!fs.existsSync(migrationFilesDir)) {
    fs.mkdirSync(migrationFilesDir, { recursive: true });
  }

  const pathToNewMigrationFile = path.join(
    migrationFilesDir,
    `${Date.now()}_${migrationFileName}.ts`
  );

  fs.writeFileSync(
    pathToNewMigrationFile,
    fs.readFileSync(SAMPLE_MIGRATION_PATH, "utf-8")
  );

  console.log(`Migration file created ⚡️`);
};
