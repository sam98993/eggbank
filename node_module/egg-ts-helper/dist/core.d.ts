/// <reference types="node" />
import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import * as generator from './generator';
import Watcher, { WatchItem } from './watcher';
import { BaseGenerator } from './generators/base';
import * as utils from './utils';
import { CompilerOptions } from 'typescript';
declare global {
    interface PlainObject<T = any> {
        [key: string]: T;
    }
}
export interface TsHelperOption {
    cwd?: string;
    framework?: string;
    typings?: string;
    generatorConfig?: {
        [key: string]: WatchItem | boolean;
    };
    /** @deprecated alias of generatorConfig, has been deprecated */
    watchDirs?: {
        [key: string]: WatchItem | boolean;
    };
    caseStyle?: string | ((...args: any[]) => string);
    watch?: boolean;
    watchOptions?: chokidar.WatchOptions;
    autoRemoveJs?: boolean;
    throttle?: number;
    execAtInit?: boolean;
    customLoader?: any;
    configFile?: string | string[];
    silent?: boolean;
}
export type TsHelperConfig = typeof defaultConfig & {
    id: string;
    eggInfo: utils.EggInfoResult;
    customLoader: any;
    tsConfig: CompilerOptions;
};
export type TsGenConfig = {
    name: string;
    dir: string;
    dtsDir: string;
    fileList: string[];
    file?: string;
} & WatchItem;
export interface GeneratorResult {
    dist: string;
    content?: string;
}
type GeneratorAllResult = GeneratorResult | GeneratorResult[];
type GeneratorCbResult<T> = T | Promise<T>;
export type TsGenerator<T = GeneratorAllResult | void> = ((config: TsGenConfig, baseConfig: TsHelperConfig, tsHelper: TsHelper) => GeneratorCbResult<T>) & {
    defaultConfig?: WatchItem;
};
export declare const defaultConfig: {
    cwd: string;
    framework: string;
    typings: string;
    caseStyle: string;
    autoRemoveJs: boolean;
    throttle: number;
    watch: boolean;
    watchOptions: undefined;
    execAtInit: boolean;
    silent: boolean;
    generatorConfig: PlainObject<WatchItem>;
    configFile: string[];
};
export declare function getDefaultGeneratorConfig(opt?: TsHelperConfig): PlainObject<any>;
export default class TsHelper extends EventEmitter {
    config: TsHelperConfig;
    watcherList: Watcher[];
    private cacheDist;
    private dtsFileList;
    utils: typeof utils;
    constructor(options: TsHelperOption);
    build(): this;
    destroy(): void;
    log(info: string, ignoreSilent?: boolean): void;
    warn(info: string): void;
    createOneForAll(dist?: string): void;
    private initWatcher;
    destroyWatcher(...refs: string[]): void;
    cleanFiles(): void;
    registerWatcher(name: string, watchConfig: WatchItem & {
        directory: string | string[];
    }, removeDuplicate?: boolean): Watcher[] | undefined;
    private loadWatcherConfig;
    private configure;
    private generateTs;
    private updateDistFiles;
    private isCached;
    private formatConfig;
    private mergeConfig;
}
export declare function createTsHelperInstance(options: TsHelperOption): TsHelper;
export { TsHelper, WatchItem, BaseGenerator, generator };
