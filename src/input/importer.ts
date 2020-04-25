import * as path from "path";
import stripJsonComments from "strip-json-comments";

import { fileSystem } from "../adapters/fileSystem";
import { getCwd } from "../adapters/getCwd";
import { nativeImporter } from "../adapters/nativeImporter";
import { Inject } from "../inject";

export const importer = async (inject: Inject, moduleName: string): Promise<any | Error> => {
    const pathAttempts = [path.join(inject(getCwd)(), moduleName), moduleName];

    const importFile = async (filePath: string) => {
        if (!filePath.endsWith(".json")) {
            return await inject(nativeImporter)(filePath);
        }

        if (!(await inject(fileSystem).fileExists(filePath))) {
            return undefined;
        }

        const rawJsonContents = await inject(fileSystem).readFile(filePath);
        if (rawJsonContents instanceof Error) {
            return rawJsonContents;
        }

        try {
            return JSON.parse(stripJsonComments(rawJsonContents));
        } catch (error) {
            return error;
        }
    };

    for (const pathAttempt of pathAttempts) {
        try {
            const result = await importFile(pathAttempt);
            if (result) {
                return result;
            }
        } catch {}
    }

    return new Error(
        `Could not find '${moduleName}' after trying: ${pathAttempts
            .map((attempt) => `'${attempt}'`)
            .join(", ")}`,
    );
};
