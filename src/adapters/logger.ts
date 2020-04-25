import * as fs from "fs";

/**
 * Wraps process outputs and a debug file.
 */
export type Logger = {
    readonly debugFileName: string;
    readonly info: NodeJS.WritableStream;
    readonly stderr: NodeJS.WritableStream;
    readonly stdout: NodeJS.WritableStream;
};

const debugFileName = "./tslint-to-eslint-config.log";

export const logger = {
    debugFileName,
    info: fs.createWriteStream(debugFileName),
    stderr: process.stderr,
    stdout: process.stdout,
};
