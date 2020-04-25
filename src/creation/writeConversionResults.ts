import { Inject } from "../inject";
import { fileSystem } from "../adapters/fileSystem";
import { AllOriginalConfigurations } from "../input/findOriginalConfigurations";
import { RuleConversionResults } from "../rules/convertRules";
import { createEnv } from "./eslint/createEnv";
import { formatConvertedRules } from "./formatConvertedRules";
import { formatOutput } from "./formatting/formatOutput";
import { SimplifiedRuleConversionResults } from "./simplification/simplifyPackageRules";

export const writeConversionResults = async (
    inject: Inject,
    outputPath: string,
    ruleConversionResults: RuleConversionResults & SimplifiedRuleConversionResults,
    originalConfigurations: AllOriginalConfigurations,
) => {
    const plugins = ["@typescript-eslint"];
    const { eslint, tslint } = originalConfigurations;

    if (ruleConversionResults.missing.length !== 0) {
        plugins.push("@typescript-eslint/tslint");
    }

    const output = {
        ...eslint?.full,
        env: createEnv(originalConfigurations),
        ...(eslint && { globals: eslint.raw.globals }),
        ...(ruleConversionResults.extends && { extends: ruleConversionResults.extends }),
        parser: "@typescript-eslint/parser",
        parserOptions: {
            project: "tsconfig.json",
            sourceType: "module",
        },
        plugins,
        rules: {
            ...eslint?.full.rules,
            ...formatConvertedRules(ruleConversionResults, tslint.full),
        },
    };

    return await inject(fileSystem).writeFile(outputPath, formatOutput(outputPath, output));
};
