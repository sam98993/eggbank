import { TsGenConfig, TsHelperConfig } from '..';
declare function ExtendGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): {
    dist: string;
}[];
declare namespace ExtendGenerator {
    var defaultConfig: {
        interface: PlainObject<any>;
    };
}
export default ExtendGenerator;
