import { Inject } from "../inject";
import { TSLintToESLintSettings, ResultWithStatus } from "../types";
import { convertConfig } from "./convertConfig";
import { convertEditorConfig } from "./convertEditorConfig";

export const configurationConverters: ConfigConverter[] = [convertConfig, convertEditorConfig];

export type ConfigConverter = (
    inject: Inject,
    settings: TSLintToESLintSettings,
) => Promise<ResultWithStatus>;
