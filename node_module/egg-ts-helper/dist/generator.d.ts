import ConfigGenerator from './generators/config';
import AutoGenerator from './generators/auto';
import ClassGenerator from './generators/class';
import CustomGenerator from './generators/custom';
import EggGenerator from './generators/egg';
import ExtendGenerator from './generators/extend';
import FunctionGenerator from './generators/function';
import ObjectGenerator from './generators/object';
import PluginGenerator from './generators/plugin';
import { BaseGenerator } from './generators/base';
type GeneratorKlass = {
    new (...args: any[]): BaseGenerator;
};
export declare const generators: {
    auto: typeof AutoGenerator;
    config: typeof ConfigGenerator;
    class: typeof ClassGenerator;
    custom: typeof CustomGenerator;
    egg: typeof EggGenerator;
    extend: typeof ExtendGenerator;
    function: typeof FunctionGenerator;
    object: typeof ObjectGenerator;
    plugin: typeof PluginGenerator;
};
export declare function registerGenerator(name: string, generator: GeneratorKlass): void;
export declare function isPrivateGenerator(name: string): boolean;
export declare function getGenerator(name: string): any;
export declare function loadGenerator(name: any, option: {
    cwd: string;
}): any;
export declare function formatGenerator(generator: any): any;
export { BaseGenerator, AutoGenerator, ConfigGenerator, ClassGenerator, CustomGenerator, EggGenerator, ExtendGenerator, FunctionGenerator, ObjectGenerator, PluginGenerator, };
