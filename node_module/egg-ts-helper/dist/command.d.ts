import { Command } from 'commander';
import TsHelper from './core';
export interface CommandOption {
    version?: string;
    tsHelperClazz?: typeof TsHelper;
}
export default class Commander {
    program: Command;
    commands: Record<string, SubCommand>;
    tsHelperClazz: typeof TsHelper;
    constructor(options?: CommandOption);
    init(argv: string[]): void;
    execute(): void;
}
export { Command };
