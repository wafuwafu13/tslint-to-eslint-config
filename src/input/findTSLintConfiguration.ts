import { exec } from "../adapters/exec";
import { Inject } from "../inject";
import { uniqueFromSources } from "../utils";
import { findRawConfiguration } from "./findRawConfiguration";
import { findReportedConfiguration } from "./findReportedConfiguration";
import { importer } from "./importer";

export type TSLintConfiguration = {
    extends?: string[];
    rulesDirectory?: string[];
    rules: TSLintConfigurationRules;
};

export type TSLintConfigurationRules = Record<string, any>;

export const findTSLintConfiguration = async (inject: Inject, config: string | undefined) => {
    const filePath = config ?? "./tslint.json";
    const [rawConfiguration, reportedConfiguration] = await Promise.all([
        findRawConfiguration<Partial<TSLintConfiguration>>(inject(importer), filePath),
        findReportedConfiguration<TSLintConfiguration>(
            inject(exec),
            "tslint --print-config",
            filePath,
        ),
    ]);

    if (reportedConfiguration instanceof Error) {
        if (reportedConfiguration.message.includes("unknown option `--print-config")) {
            return new Error("TSLint v5.18 required. Please update your version.");
        }

        return reportedConfiguration;
    }

    if (rawConfiguration instanceof Error) {
        return rawConfiguration;
    }

    const extensions = uniqueFromSources(rawConfiguration.extends, reportedConfiguration.extends);

    const rules = {
        ...rawConfiguration.rules,
        ...reportedConfiguration.rules,
    };

    return {
        full: {
            ...(extensions.length !== 0 && { extends: extensions }),
            rules,
        },
        raw: rawConfiguration,
    };
};
