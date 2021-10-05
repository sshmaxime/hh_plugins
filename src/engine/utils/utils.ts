import {
  MIGRATION_DEPLOYMENTS_DIR,
  MIGRATION_STATE_FILE_NAME,
} from "../core/constants";
import fs from "fs-extra";
import path from "path";

export const isMigrationDirValid = (dir: string) =>
  fs.existsSync(dir) &&
  fs.readdirSync(dir).find((f: string) => f === MIGRATION_STATE_FILE_NAME) &&
  fs.existsSync(path.join(dir, MIGRATION_DEPLOYMENTS_DIR));
