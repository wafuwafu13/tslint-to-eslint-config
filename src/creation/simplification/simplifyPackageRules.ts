import { Inject } from "../../inject";
import { ESLintConfiguration } from "../../input/findESLintConfiguration";
import { OriginalConfigurations } from "../../input/findOriginalConfigurations";
import { TSLintConfiguration } from "../../input/findTSLintConfiguration";
import { RuleConversionResults } from "../../rules/convertRules";
import { uniqueFromSources } from "../../utils";
import { collectTSLintRulesets } from "./collectTSLintRulesets";
import { removeExtendsDuplicatedRules } from "./removeExtendsDuplicatedRules";
import { retrieveExtendsValues } from "./retrieveExtendsValues";

export type SimplifiedRuleConversionResults = Pick<
    RuleConversionResults,
    "converted" | "failed"
> & {
    extends?: string[];
};

/**
 * Given an initial set of rule conversion results and original configurations,
 * determines which ESLint rulesets to extend from and removes redundant rule values.
 */
export const simplifyPackageRules = async (
    inject: Inject,
    eslint: Pick<OriginalConfigurations<ESLintConfiguration>, "full"> | undefined,
    tslint: OriginalConfigurations<Pick<TSLintConfiguration, "extends">>,
    ruleConversionResults: SimplifiedRuleConversionResults,
): Promise<SimplifiedRuleConversionResults> => {
    const extendedESLintRulesets = eslint?.full.extends ?? [];
    const extendedTSLintRulesets = collectTSLintRulesets(tslint);
    const allExtensions = uniqueFromSources(extendedESLintRulesets, extendedTSLintRulesets);
    if (allExtensions.length === 0) {
        return ruleConversionResults;
    }

    const { configurationErrors, importedExtensions } = await inject(retrieveExtendsValues)(
        uniqueFromSources(extendedESLintRulesets, extendedTSLintRulesets),
    );

    const converted = inject(removeExtendsDuplicatedRules)(
        ruleConversionResults.converted,
        importedExtensions,
    );

    return {
        converted,
        extends: allExtensions,
        failed: [...ruleConversionResults.failed, ...configurationErrors],
    };
};
