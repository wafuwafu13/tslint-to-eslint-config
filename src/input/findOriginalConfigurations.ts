import { ResultStatus, TSLintToESLintSettings, ResultWithDataStatus } from "../types";
import { ESLintConfiguration, findESLintConfiguration } from "./findESLintConfiguration";
import { findPackagesConfiguration, PackagesConfiguration } from "./findPackagesConfiguration";
import {
    findTypeScriptConfiguration,
    TypeScriptConfiguration,
} from "./findTypeScriptConfiguration";
import { findTSLintConfiguration, TSLintConfiguration } from "./findTSLintConfiguration";
import { Inject } from "../inject";
import { mergeLintConfigurations } from "./mergeLintConfigurations";

/**
 * Both found configurations for a particular linter.
 */
export type OriginalConfigurations<Configuration> = {
    /**
     * Settings reported by the linter's native --print-config equivalent.
     */
    full: Configuration;

    /**
     * Raw import results from `import`ing the configuration file.
     */
    raw: Partial<Configuration>;
};

export type AllOriginalConfigurations = {
    eslint?: OriginalConfigurations<ESLintConfiguration>;
    packages?: PackagesConfiguration;
    tslint: OriginalConfigurations<TSLintConfiguration>;
    typescript?: TypeScriptConfiguration;
};

export const findOriginalConfigurations = async (
    inject: Inject,
    rawSettings: TSLintToESLintSettings,
): Promise<ResultWithDataStatus<AllOriginalConfigurations>> => {
    // Simultaneously search for all required configuration types
    const [eslint, packages, tslint, typescript] = await Promise.all([
        inject(findESLintConfiguration)(rawSettings),
        inject(findPackagesConfiguration)(rawSettings.package),
        inject(findTSLintConfiguration)(rawSettings.tslint),
        inject(findTypeScriptConfiguration)(rawSettings.typescript),
    ]);

    // Out of those configurations, only TSLint's is always required to run
    if (tslint instanceof Error) {
        return {
            complaints: [tslint.message],
            status: ResultStatus.ConfigurationError,
        };
    }

    // Other configuration errors only halt the program if the user asked for them
    const configurationErrors = [
        [eslint, rawSettings.eslint],
        [packages, rawSettings.package],
        [typescript, rawSettings.typescript],
    ].filter(configurationResultIsError);
    if (configurationErrors.length !== 0) {
        return {
            complaints: configurationErrors.map(([configuration]) => configuration.message),
            status: ResultStatus.ConfigurationError,
        };
    }

    return {
        data: {
            ...(!(eslint instanceof Error) && { eslint }),
            ...(!(packages instanceof Error) && { packages }),
            tslint: inject(mergeLintConfigurations)(eslint, tslint),
            ...(!(typescript instanceof Error) && { typescript }),
        },
        status: ResultStatus.Succeeded,
    };
};

const configurationResultIsError = (result: unknown[]): result is [Error, string] => {
    return result[0] instanceof Error && typeof result[1] === "string";
};
