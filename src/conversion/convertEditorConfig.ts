import { writeConversionResults } from "../creation/writeEditorConfigConversionResults";
import { convertEditorSettings } from "../editorSettings/convertEditorSettings";
import { findEditorConfiguration } from "../input/findEditorConfiguration";
import { reportEditorSettingConversionResults } from "../reporting/reportEditorSettingConversionResults";
import { ResultStatus, ResultWithStatus, TSLintToESLintSettings } from "../types";
import { Inject } from "../inject";

/**
 * Root-level driver to convert an editor configuration.
 */
export const convertEditorConfig = async (
    inject: Inject,
    settings: TSLintToESLintSettings,
): Promise<ResultWithStatus> => {
    const conversion = await inject(findEditorConfiguration)(settings.editor);
    if (conversion === undefined) {
        return {
            status: ResultStatus.Succeeded,
        };
    }

    if (conversion.result instanceof Error) {
        return {
            errors: [conversion.result],
            status: ResultStatus.Failed,
        };
    }

    const settingConversionResults = inject(convertEditorSettings)(conversion.result);

    const fileWriteError = await inject(writeConversionResults)(
        conversion.configPath,
        settingConversionResults,
        conversion.result,
    );
    if (fileWriteError !== undefined) {
        return {
            errors: [fileWriteError],
            status: ResultStatus.Failed,
        };
    }

    inject(reportEditorSettingConversionResults)(settingConversionResults);

    return {
        status: ResultStatus.Succeeded,
    };
};
