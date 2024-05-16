import { default as TsHelper, TsGenConfig, TsHelperConfig } from '../core';
export interface GeneratorResult {
    dist: string;
    content?: string;
}
export declare abstract class BaseGenerator<T = any> {
    baseConfig: TsHelperConfig;
    tsHelper: TsHelper;
    constructor(baseConfig: TsHelperConfig, tsHelper: TsHelper);
    render(config: TsGenConfig): GeneratorResult;
    abstract buildParams(config: TsGenConfig): T;
    abstract renderWithParams(config: TsGenConfig, params: T): GeneratorResult;
}
