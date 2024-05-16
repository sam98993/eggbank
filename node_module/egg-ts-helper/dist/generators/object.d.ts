import { TsGenConfig, TsHelperConfig } from '..';
declare function ObjectGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): {
    dist: string;
    content?: undefined;
} | {
    dist: string;
    content: string;
};
declare namespace ObjectGenerator {
    var defaultConfig: {
        distName: string;
    };
}
export default ObjectGenerator;
