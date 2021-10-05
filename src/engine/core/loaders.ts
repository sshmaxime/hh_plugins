import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

export const importCsjOrEsModule = (filePath: string) => {
  const imported = require(filePath);
  return imported.default || imported;
};

export const basicTaskLoader = (pathToAction: string) => {
  return (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const actualPath = path.isAbsolute(pathToAction)
      ? pathToAction
      : path.join(hre.config.paths.root, pathToAction);
    const task = importCsjOrEsModule(actualPath);

    return task(taskArgs, hre);
  };
};

export const migrationLoader = (pathToAction: string) => {
  return (taskArgs: any, hre: any) => {
    const migrationTask = importCsjOrEsModule(
      path.join(__dirname, "..", process.env.DEV ? "index.ts" : "index.js")
    );

    return migrationTask(taskArgs, hre, basicTaskLoader(pathToAction));
  };
};
