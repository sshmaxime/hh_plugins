import chalk from "chalk";

class Logger {
  private palette = {
    white: (...str: string[]) => console.log(`${str}`),
    magenta: (...str: string[]) => console.log(chalk.magenta(`${str}`)),
    yellow: (...str: string[]) => console.log(chalk.yellow(`${str}`)),
  };

  warning = (...str: string[]) => console.log(chalk.cyanBright(`⚠️  ${str}`));
  info = (...str: string[]) =>
    console.log(chalk.rgb(0, 0, 0).bgWhiteBright(`\n${str}`));
  done = (...str: string[]) => console.log(chalk.yellowBright(...str));
  debug = (...str: string[]) =>
    console.log(chalk.rgb(123, 104, 238).italic(...str));

  basicExecutionHeader = (head: string, body: string, args: any[]) => {
    let space = "  ";
    for (let i = 0; i < head.length; i++) space += " ";

    return console.log(
      chalk.underline.rgb(
        255,
        165,
        51
      )(
        `${head}:` +
          chalk.reset(` `) +
          chalk.reset.bold.rgb(
            255,
            215,
            51
          )(`${body}` + `\n${space}Params: [${args}]`)
      )
    );
  };

  greyed = (...str: string[]) => console.log(chalk.grey(...str));
  success = (...str: string[]) => console.log(chalk.greenBright(...str));
  error = (...str: string[]) => console.log(chalk.red(`⛔️ ${str}`));

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
    this.palette.white(
      `        Signer: ${signerAddress} ${
        isLedger ? "(ledger)" : "(default account)"
      }`
    );
    this.palette.yellow(`Network info`);
    this.palette.white(`        Network: ${networkConfig.networkName}`);
    this.palette.yellow(`Overrides:`);
    this.palette.white(`        GasPrice: ${overrides.gasPrice} (gwei)`);
    this.palette.yellow(`Execution Setting:`);
    this.palette.white(
      `        Confirmation to wait: ${executionSettings.confirmationToWait}`
    );
    this.palette.yellow(`********************`);
  };
}

export default new Logger();
