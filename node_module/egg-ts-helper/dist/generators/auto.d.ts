import { TsGenConfig, TsHelperConfig } from '..';
declare function AutoGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): {
    dist: string;
    content?: undefined;
} | {
    dist: string;
    content: string;
};
declare namespace AutoGenerator {
    var defaultConfig: {
        distName: string;
    };
}
export default AutoGenerator;
