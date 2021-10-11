import { migrateParamTaskArgs } from '.';
import { engine } from '../engine/bootloader';

export default async (args: migrateParamTaskArgs) => {
    const { reset, migrate } = engine.getCommands();

    if (args.reset) {
        reset();
    }

    await migrate();
};
