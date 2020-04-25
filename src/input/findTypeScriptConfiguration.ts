import { exec } from "../adapters/exec";
import { Inject } from "../inject";
import { findReportedConfiguration } from "./findReportedConfiguration";

export type TypeScriptConfiguration = {
    compilerOptions: {
        lib?: string[];
        target: string;
    };
};

const defaultTypeScriptConfiguration = {
    compilerOptions: {
        target: "es3",
    },
};

export const findTypeScriptConfiguration = async (
    inject: Inject,
    config: string | undefined,
): Promise<TypeScriptConfiguration | Error> => {
    const rawConfiguration = await findReportedConfiguration<TypeScriptConfiguration>(
        inject(exec),
        "tsc --showConfig -p",
        config ?? "./tsconfig.json",
    );

    return rawConfiguration instanceof Error
        ? rawConfiguration
        : {
              compilerOptions: {
                  ...defaultTypeScriptConfiguration.compilerOptions,
                  ...rawConfiguration.compilerOptions,
              },
          };
};
