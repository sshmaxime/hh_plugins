import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

export const importCsjOrEsModule = (filePath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    const loader = importCsjOrEsModule(path.join(__dirname, "index.ts"));

    return loader(taskArgs, hre, basicTaskLoader(pathToAction));
  };
};
