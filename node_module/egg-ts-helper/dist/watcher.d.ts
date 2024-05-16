/// <reference types="node" />
import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { TsGenerator, TsHelperConfig, default as TsHelper } from './core';
export interface BaseWatchItem {
    ref?: string;
    directory: string;
    generator?: string;
    enabled?: boolean;
    ignore?: string | string[];
    trigger?: Array<'add' | 'unlink' | 'change'>;
    pattern?: string | string[];
    watch?: boolean;
    execAtInit?: boolean;
}
export interface WatchItem extends PlainObject, BaseWatchItem {
}
interface WatcherOptions extends WatchItem {
    name: string;
}
export default class Watcher extends EventEmitter {
    helper: TsHelper;
    ref: string;
    name: string;
    dir: string;
    options: WatcherOptions;
    pattern: string[];
    dtsDir: string;
    config: TsHelperConfig;
    generator: TsGenerator;
    fsWatcher?: chokidar.FSWatcher;
    throttleTick: any;
    throttleStack: string[];
    constructor(helper: TsHelper);
    init(options: WatcherOptions): void;
    destroy(): void;
    watch(): void;
    execute(file?: string): any;
    private onChange;
}
export {};
