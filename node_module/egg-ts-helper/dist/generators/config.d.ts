import { TsGenConfig } from '..';
import { BaseGenerator } from './base';
export interface ImportItem {
    import: string;
    declaration: string;
    moduleName: string;
}
export interface ConfigGeneratorParams {
    importList: string[];
    declarationList: string[];
    moduleList: string[];
}
export default class ConfigGenerator extends BaseGenerator<ConfigGeneratorParams | undefined> {
    static defaultConfig: {
        pattern: string;
        interface: string;
    };
    buildParams(config: TsGenConfig): {
        importList: string[];
        declarationList: string[];
        moduleList: string[];
    } | undefined;
    renderWithParams(config: TsGenConfig, params?: ConfigGeneratorParams): {
        dist: string;
        content?: undefined;
    } | {
        dist: string;
        content: string;
    };
}
export declare function checkConfigReturnType(f: string): {
    type: number | undefined;
    usePowerPartial: boolean;
};
