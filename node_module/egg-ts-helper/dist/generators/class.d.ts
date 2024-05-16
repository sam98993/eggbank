import { TsGenConfig, TsHelperConfig } from '..';
declare function ClassGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): {
    dist: string;
    content?: undefined;
} | {
    dist: string;
    content: string;
};
declare namespace ClassGenerator {
    var defaultConfig: {
        distName: string;
    };
}
export default ClassGenerator;
