import { TsGenConfig, TsHelperConfig } from '..';
declare function EggGenerator(config: TsGenConfig, baseConfig: TsHelperConfig): {
    dist: string;
    content: string;
};
declare namespace EggGenerator {
    var isPrivate: boolean;
}
export default EggGenerator;
