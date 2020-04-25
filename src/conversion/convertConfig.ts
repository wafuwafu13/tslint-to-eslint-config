import { simplifyPackageRules } from "../creation/simplification/simplifyPackageRules";
import { writeConversionResults } from "../creation/writeConversionResults";
import { Inject } from "../inject";
import { findOriginalConfigurations } from "../input/findOriginalConfigurations";
import { reportConversionResults } from "../reporting/reportConversionResults";
import { convertRules } from "../rules/convertRules";
import { ResultStatus, ResultWithStatus, TSLintToESLintSettings } from "../types";

/**
 * Root-level driver to convert a TSLint configuration to ESLint.
 * @see `Architecture.md` for documentation.
 */
export const convertConfig = async (
    inject: Inject,
    settings: TSLintToESLintSettings,
): Promise<ResultWithStatus> => {
    // 1. Existing configurations are read
    const originalConfigurations = await inject(findOriginalConfigurations)(settings);
    if (originalConfigurations.status !== ResultStatus.Succeeded) {
        return originalConfigurations;
    }

    // 2. TSLint rules are converted into their ESLint configurations
    const ruleConversionResults = inject(convertRules)(
        originalConfigurations.data.tslint.full.rules,
    );

    // 3. ESLint configurations are simplified based on extended ESLint and TSLint presets
    const simplifiedConfiguration = {
        ...ruleConversionResults,
        ...(await inject(simplifyPackageRules)(
            originalConfigurations.data.eslint,
            originalConfigurations.data.tslint,
            ruleConversionResults,
        )),
    };

    // 4. The simplified configuration is written to the output config file
    const fileWriteError = await inject(writeConversionResults)(
        settings.config,
        simplifiedConfiguration,
        originalConfigurations.data,
    );
    if (fileWriteError !== undefined) {
        return {
            errors: [fileWriteError],
            status: ResultStatus.Failed,
        };
    }

    // 5. A summary of the results is printed to the user's console
    inject(reportConversionResults)(simplifiedConfiguration);

    return {
        status: ResultStatus.Succeeded,
    };
};
