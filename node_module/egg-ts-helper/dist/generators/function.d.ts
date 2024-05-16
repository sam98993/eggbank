import { TsGenConfig, TsHelperConfig } from '..';
declare function FunctionGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): {
    dist: string;
    content?: undefined;
} | {
    dist: string;
    content: string;
};
declare namespace FunctionGenerator {
    var defaultConfig: {
        distName: string;
    };
}
export default FunctionGenerator;
