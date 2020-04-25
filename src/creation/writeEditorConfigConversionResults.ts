import { fileSystem } from "../adapters/fileSystem";
import { EditorSettingConversionResults } from "../editorSettings/convertEditorSettings";
import { Inject } from "../inject";
import { EditorConfiguration } from "../input/editorConfiguration";
import { DeepPartial } from "../input/findReportedConfiguration";
import { formatOutput } from "./formatting/formatOutput";

export const writeConversionResults = async (
    inject: Inject,
    outputPath: string,
    conversionResults: EditorSettingConversionResults,
    originalConfiguration: DeepPartial<EditorConfiguration>,
) => {
    const output = {
        ...originalConfiguration,
        ...formatConvertedSettings(conversionResults),
    };

    return await inject(fileSystem).writeFile(outputPath, formatOutput(outputPath, output));
};

export const formatConvertedSettings = (conversionResults: EditorSettingConversionResults) => {
    const output: { [i: string]: string | any[] } = {};
    const sortedEntries = Array.from(conversionResults.converted).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB),
    );

    for (const [name, setting] of sortedEntries) {
        output[name] = setting.value;
    }

    return output;
};
