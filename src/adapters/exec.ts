import { exec as nativeExec } from "child_process";
import { promisify } from "util";

export type Exec = (command: string) => Promise<{ stderr: string; stdout: string }>;

export const exec: Exec = promisify(nativeExec);
