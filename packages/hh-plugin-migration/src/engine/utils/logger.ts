import chalk from 'chalk';

const customConsole = {
    log: (text: any) => {
        if (!process.env['DEV']) {
            console.log(text);
        }
    }
};

class Logger {
    private palette = {
        white: (...str: string[]) => customConsole.log(`${str}`),
        magenta: (...str: string[]) => customConsole.log(chalk.magenta(`${str}`)),
        yellow: (...str: string[]) => customConsole.log(chalk.yellow(`${str}`))
    };

    warning = (...str: string[]) => customConsole.log(chalk.cyanBright(`⚠️  ${str}`));
    info = (...str: string[]) => customConsole.log(chalk.rgb(0, 0, 0).bgWhiteBright(`\n${str}`));
    done = (...str: string[]) => customConsole.log(chalk.yellowBright(...str));
    debug = (...str: string[]) => customConsole.log(chalk.rgb(123, 104, 238).italic(...str));

    basicExecutionHeader = (head: string, body: string, args: any[]) => {
        let space = '  ';
        for (let i = 0; i < head.length; i++) space += ' ';

        return customConsole.log(
            chalk.underline.rgb(
                255,
                165,
                51
            )(
                `${head}:` +
                    chalk.reset(` `) +
                    chalk.reset.bold.rgb(255, 215, 51)(`${body}` + `\n${space}Params: [${args}]`)
            )
        );
    };

    greyed = (...str: string[]) => customConsole.log(chalk.grey(...str));
    success = (...str: string[]) => customConsole.log(chalk.greenBright(...str));
    error = (...str: string[]) => customConsole.log(chalk.red(`⛔️ ${str}`));

    migrationConfig = (
        signerAddress: string,
        isLedger: boolean,
        networkConfig: any,
        executionSettings: any,
        overrides: any
    ) => {
        this.palette.yellow(`**********************`);
        this.palette.yellow(`** Migration Config **`);
        this.palette.yellow(`**********************`);

        this.palette.yellow(`Basic info`);
        this.palette.white(`        Signer: ${signerAddress} ${isLedger ? '(ledger)' : '(default account)'}`);
        this.palette.yellow(`Network info`);
        this.palette.white(`        Network: ${networkConfig.networkName}`);
        this.palette.yellow(`Overrides:`);
        this.palette.white(`        GasPrice: ${overrides.gasPrice} (gwei)`);
        this.palette.yellow(`Execution Setting:`);
        this.palette.white(`        Confirmation to wait: ${executionSettings.confirmationToWait}`);
        this.palette.yellow(`********************`);
    };
}

export default new Logger();
