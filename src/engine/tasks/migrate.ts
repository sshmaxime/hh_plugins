import { engine } from "../";

export default async () => {
  await engine.migrate();
};
