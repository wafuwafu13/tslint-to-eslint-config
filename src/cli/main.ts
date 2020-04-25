import { EOL } from "os";

import { logger } from "../adapters/logger";
import { createInject } from "../inject";
import { runCli } from "./runCli";

export const main = async (argv: string[]) => {
    try {
        const resultStatus = await runCli(createInject(), argv);
        logger.info.close();

        if (resultStatus !== 0) {
            process.exitCode = 1;
        }
    } catch (error) {
        logger.info.close();
        logger.stdout.write(`Error in tslint-to-eslint-config: ${error.stack}${EOL}`);
        process.exitCode = 1;
    }
};
