import chalk from "chalk";
import { Command } from "commander";
import { EOL } from "os";

import { version } from "../../package.json";
import { logger, Logger } from "../adapters/logger";
import { configurationConverters, ConfigConverter } from "../conversion/configurationConverters";
import { Inject } from "../inject";
import { ResultStatus, ResultWithStatus, TSLintToESLintSettings } from "../types";

export const runCli = async (inject: Inject, rawArgv: string[]): Promise<ResultStatus> => {
    const command = new Command()
        .usage("[options] <file ...> --language [language]")
        .option("--config [config]", "eslint configuration file to output to")
        .option("--eslint [eslint]", "eslint configuration file to convert using")
        .option("--package [package]", "package configuration file to convert using")
        .option("--tslint [tslint]", "tslint configuration file to convert using")
        .option("--typescript [typescript]", "typescript configuration file to convert using")
        .option("--editor [editor]", "editor configuration file to convert")
        .option("-V --version", "output the package version");

    const parsedArgv: TSLintToESLintSettings = {
        config: "./.eslintrc.js",
        ...(command.parse(rawArgv) as Partial<TSLintToESLintSettings>),
    };

    if ({}.hasOwnProperty.call(parsedArgv, "version")) {
        inject(logger).stdout.write(`${version}${EOL}`);
        return ResultStatus.Succeeded;
    }

    for (const configConverter of inject(configurationConverters)) {
        const result = await tryConvertConfig(inject, configConverter, parsedArgv);
        if (result.status !== ResultStatus.Succeeded) {
            logErrorResult(inject(logger), result);
            return result.status;
        }
    }

    inject(logger).stdout.write(chalk.greenBright("✅ All is well! ✅\n"));
    return ResultStatus.Succeeded;
};

const tryConvertConfig = async (
    inject: Inject,
    configConverter: ConfigConverter,
    argv: TSLintToESLintSettings,
): Promise<ResultWithStatus> => {
    let result: ResultWithStatus;

    try {
        result = await configConverter(inject, argv);
    } catch (error) {
        result = {
            errors: [error as Error],
            status: ResultStatus.Failed,
        };
    }

    return result;
};

const logErrorResult = (logger: Logger, result: ResultWithStatus) => {
    switch (result.status) {
        case ResultStatus.ConfigurationError:
            logger.stderr.write(chalk.redBright("❌ "));
            logger.stderr.write(chalk.red("Could not start tslint-to-eslint:"));
            logger.stderr.write(chalk.redBright(` ❌${EOL}`));
            for (const complaint of result.complaints) {
                logger.stderr.write(chalk.yellowBright(`  ${complaint}${EOL}`));
            }
            break;

        case ResultStatus.Failed:
            logger.stderr.write(chalk.redBright("❌ "));
            logger.stderr.write(chalk.red(`${result.errors.length} error`));
            logger.stderr.write(chalk.red(result.errors.length === 1 ? "" : "s"));
            logger.stderr.write(chalk.red(" running tslint-to-eslint:"));
            logger.stderr.write(chalk.redBright(` ❌${EOL}`));
            for (const error of result.errors) {
                logger.stderr.write(chalk.gray(`  ${error.stack}${EOL}`));
            }
            break;
    }
};
