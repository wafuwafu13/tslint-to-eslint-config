import * as fs from "fs";
import { promisify } from "util";

export type FileSystem = {
    fileExists: (filePath: string) => Promise<boolean>;
    readFile: (filePath: string) => Promise<Error | string>;
    writeFile: (filePath: string, contents: string) => Promise<Error | undefined>;
};

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export const fileSystem: FileSystem = {
    fileExists: async (filePath: string) => {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    },
    readFile: async (filePath: string) => {
        try {
            return (await readFile(filePath)).toString();
        } catch (error) {
            return error;
        }
    },
    writeFile: async (filePath: string, contents: string) => {
        try {
            return writeFile(filePath, contents);
        } catch (error) {
            return error;
        }
    },
};
