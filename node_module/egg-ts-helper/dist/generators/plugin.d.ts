import { TsGenConfig, TsHelperConfig } from '..';
import * as utils from '../utils';
declare function PluginGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): utils.EggInfoResult;
declare namespace PluginGenerator {
    var isPrivate: boolean;
    var defaultConfig: {
        pattern: string;
        interface: string;
        /** use path insteadof package while import plugins */
        usePath: boolean;
    };
}
export default PluginGenerator;
