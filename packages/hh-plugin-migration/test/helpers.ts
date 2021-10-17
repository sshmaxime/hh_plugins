import { resetHardhatContext } from 'hardhat/plugins-testing';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import path from 'path';
import fs from 'fs';

declare module 'mocha' {
    interface Context {
        hre: HardhatRuntimeEnvironment;
    }
}

export function useEnvironment(fixtureProjectName: string, args = { MIGRATION: 1, DEV: 1, FORK: '' }) {
    var env: any;

    // mocking environment
    before(async function () {
        env = process.env;

        process.env['MIGRATION'] = args.MIGRATION.toString();
        process.env['DEV'] = args.DEV.toString();
        process.env['FORK'] = args.FORK.toString();

        process.chdir(path.join(__dirname, 'fixture-projects', fixtureProjectName));
        this.hre = require('hardhat');

        await this.hre.run('compile');
    });

    // restoring environment
    after(function () {
        process.env = env;

        fs.rmSync(path.join(__dirname, 'fixture-projects', fixtureProjectName, 'artifacts'), {
            recursive: true,
            force: true
        });

        fs.rmSync(path.join(__dirname, 'fixture-projects', fixtureProjectName, 'cache'), {
            recursive: true,
            force: true
        });

        resetHardhatContext();
    });
}
