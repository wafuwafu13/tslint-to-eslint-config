import { fileSystem } from "../adapters/fileSystem";
import { EditorConfiguration } from "./editorConfiguration";
import { findRawConfiguration } from "./findRawConfiguration";
import { DeepPartial } from "./findReportedConfiguration";
import { importer } from "./importer";
import { DEFAULT_VSCODE_SETTINGS_PATH } from "./vsCodeSettings";
import { Inject } from "../inject";

export const findEditorConfiguration = async (
    inject: Inject,
    specifiedConfigPath: string | undefined,
) => {
    const attemptingConfigPath = specifiedConfigPath ?? DEFAULT_VSCODE_SETTINGS_PATH;

    if (!(await inject(fileSystem).fileExists(attemptingConfigPath))) {
        return specifiedConfigPath === undefined
            ? undefined
            : {
                  configPath: attemptingConfigPath,
                  result: new Error(
                      `Could not find editor configuration under '${attemptingConfigPath}'.`,
                  ),
              };
    }

    const result = await findRawConfiguration<DeepPartial<EditorConfiguration>>(
        inject(importer),
        attemptingConfigPath,
    );

    return {
        configPath: attemptingConfigPath,
        result,
    };
};
