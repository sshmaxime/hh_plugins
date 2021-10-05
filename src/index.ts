// include your type extensions in npm package's types file
import "./type-extensions";

// extend capabilities
import "./extend.ts";

// import tasks
import "./tasks";

// exports
import { engine } from "./engine";
import {
  Migration,
  deployedContract,
  deployedProxy,
} from "./engine/core/types";

export { engine, Migration, deployedContract, deployedProxy };
