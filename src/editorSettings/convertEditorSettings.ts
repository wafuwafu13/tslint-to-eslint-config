import { ConversionError } from "../errors/conversionError";
import { ErrorSummary } from "../errors/errorSummary";
import { Inject } from "../inject";
import { convertEditorSetting } from "./convertEditorSetting";
import { EditorSetting } from "./types";
import { editorSettingsConverters } from "./editorSettingsConverters";

const EDITOR_SETTINGS_PREFIX = "editor.";

export type EditorSettingConversionResults = {
    converted: Map<string, EditorSetting>;
    failed: ErrorSummary[];
    missing: Pick<EditorSetting, "editorSettingName">[];
};

// The entire editor configuration of any keys and values.
export type EditorConfiguration = Record<string, any>;

export const convertEditorSettings = (
    inject: Inject,
    rawEditorConfiguration: EditorConfiguration,
): EditorSettingConversionResults => {
    const converted = new Map<string, EditorSetting>();
    const failed: ConversionError[] = [];
    const missing: Pick<EditorSetting, "editorSettingName">[] = [];

    for (const [configurationName, value] of Object.entries(rawEditorConfiguration)) {
        // Configurations other than editor settings will be ignored.
        // See: https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin#configuration
        if (!configurationName.startsWith(EDITOR_SETTINGS_PREFIX)) {
            continue;
        }

        const editorSetting = { editorSettingName: configurationName, value };
        const conversion = convertEditorSetting(editorSetting, inject(editorSettingsConverters));

        if (conversion === undefined) {
            const { editorSettingName } = editorSetting;
            missing.push({ editorSettingName });
            continue;
        }

        if (conversion instanceof ConversionError) {
            failed.push(conversion);
            continue;
        }

        for (const changes of conversion.settings) {
            converted.set(changes.editorSettingName, { ...changes });
        }
    }

    return { converted, failed, missing };
};
