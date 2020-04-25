import { exec } from "../adapters/exec";
import { ESLintRuleSeverity } from "../rules/types";
import { TSLintToESLintSettings } from "../types";
import { uniqueFromSources } from "../utils";
import { findRawConfiguration } from "./findRawConfiguration";
import { findReportedConfiguration } from "./findReportedConfiguration";
import { OriginalConfigurations } from "./findOriginalConfigurations";
import { importer } from "./importer";
import { Inject } from "../inject";

export type ESLintConfiguration = {
    env: Record<string, boolean>;
    extends: string | string[];
    globals?: Record<string, boolean>;
    rules: ESLintConfigurationRules;
};

export type ESLintConfigurationRules = {
    [i: string]: ESLintConfigurationRuleValue;
};

export type ESLintConfigurationRuleValue =
    | 0
    | 1
    | 2
    | ESLintRuleSeverity
    | [ESLintRuleSeverity, any];

const defaultESLintConfiguration = {
    env: {},
    extends: [],
    rules: {},
};

export const findESLintConfiguration = async (
    inject: Inject,
    rawSettings: Pick<TSLintToESLintSettings, "config" | "eslint">,
): Promise<OriginalConfigurations<ESLintConfiguration> | Error> => {
    const filePath = rawSettings.eslint ?? rawSettings.config;
    const [rawConfiguration, reportedConfiguration] = await Promise.all([
        findRawConfiguration<ESLintConfiguration>(inject(importer), filePath, {
            extends: [],
        }),
        findReportedConfiguration<Partial<ESLintConfiguration>>(
            inject(exec),
            "eslint --print-config",
            filePath,
        ),
    ]);

    if (rawConfiguration instanceof Error) {
        return rawConfiguration;
    }

    if (reportedConfiguration instanceof Error) {
        return reportedConfiguration;
    }

    const extensions = uniqueFromSources(rawConfiguration.extends, reportedConfiguration.extends);

    return {
        full: {
            ...defaultESLintConfiguration,
            ...reportedConfiguration,
            extends: Array.from(new Set(extensions)),
        },
        raw: rawConfiguration,
    };
};
