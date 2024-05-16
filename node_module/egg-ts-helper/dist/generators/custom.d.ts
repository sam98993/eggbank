import { default as TsHelper, TsGenConfig, TsHelperConfig } from '../core';
import * as utils from '../utils';
declare function CustomGenerator(config: TsGenConfig, baseConfig: TsHelperConfig, tsHelper: TsHelper): utils.EggInfoResult;
declare namespace CustomGenerator {
    var isPrivate: boolean;
    var defaultConfig: {
        directory: string;
        execAtInit: boolean;
        pattern: string[];
    };
}
export default CustomGenerator;
