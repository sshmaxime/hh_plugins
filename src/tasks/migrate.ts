import { migrateParamTaskArgs } from ".";
import { engine } from "../engine";
import { core } from "../engine/core/modules/core";

export default async (args: migrateParamTaskArgs) => {
  if (args.reset) {
    core.reset();
  }

  await engine.migrate();
};
