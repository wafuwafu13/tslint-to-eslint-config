import { exec } from "../adapters/exec";
import { Inject } from "../inject";
import { findReportedConfiguration } from "./findReportedConfiguration";

export type PackagesConfiguration = {
    dependencies: {
        [i: string]: string;
    };
    devDependencies: {
        [i: string]: string;
    };
};

const defaultPackagesConfiguration = {
    dependencies: {},
    devDependencies: {},
};

export const findPackagesConfiguration = async (
    inject: Inject,
    config: string | undefined,
): Promise<PackagesConfiguration | Error> => {
    const rawConfiguration = await findReportedConfiguration<PackagesConfiguration>(
        inject(exec),
        "cat",
        config ?? "./package.json",
    );

    return rawConfiguration instanceof Error
        ? rawConfiguration
        : {
              dependencies: {
                  ...rawConfiguration.dependencies,
                  ...defaultPackagesConfiguration.dependencies,
              },
              devDependencies: {
                  ...rawConfiguration.devDependencies,
                  ...defaultPackagesConfiguration.devDependencies,
              },
          };
};
