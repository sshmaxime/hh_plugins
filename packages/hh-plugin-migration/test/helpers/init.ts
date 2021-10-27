import { resetHardhatContext } from 'hardhat/plugins-testing';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import '../../src/type-extensions';

import path from 'path';
import fs from 'fs';

declare module 'mocha' {
    interface Context {
        hre: HardhatRuntimeEnvironment;
    }
}

const PROJECT_DIR = 'project-exemples';
const PATH_TO_PROJECTS_DIR = path.join(__dirname, '..', PROJECT_DIR);

export const init = (projectName: string, args: { MIGRATION?: 1; FORK?: string }) => {
    let env: any;

    const PATH_TO_PROJECT_DIR = path.join(PATH_TO_PROJECTS_DIR, projectName);

    // mocking environment
    before(async function () {
        env = process.env;
        path.join;
        process.env['DEV'] = Number(1).toString();

        if (args.MIGRATION) {
            process.env['MIGRATION'] = args.MIGRATION.toString();
        }

        if (args.FORK) {
            process.env['FORK'] = args.FORK.toString();
        }

        process.chdir(PATH_TO_PROJECT_DIR);
        this.hre = require('hardhat');
    });

    // restoring environment
    after(function () {
        process.env = env;

        fs.rmSync(path.join(PATH_TO_PROJECT_DIR, 'artifacts'), {
            recursive: true,
            force: true
        });

        fs.rmSync(path.join(PATH_TO_PROJECT_DIR, 'cache'), {
            recursive: true,
            force: true
        });

        resetHardhatContext();
    });

    return {
        PATH_TO_PROJECT_DIR
    };
};
