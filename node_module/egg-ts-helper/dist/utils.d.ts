import ts from 'typescript';
export declare const JS_CONFIG: {
    include: string[];
};
export declare const TS_CONFIG: Partial<TsConfigJson>;
export interface TsConfigJson {
    extends: string;
    compilerOptions: ts.CompilerOptions;
}
export interface GetEggInfoOpt {
    cwd: string;
    cacheIndex?: string;
    customLoader?: any;
    async?: boolean;
    env?: PlainObject<string>;
    callback?: (result: EggInfoResult) => any;
}
export interface EggPluginInfo {
    from: string;
    enable: boolean;
    package?: string;
    path: string;
    etsConfig?: PlainObject;
}
export interface EggInfoResult {
    eggPaths?: string[];
    plugins?: PlainObject<EggPluginInfo>;
    config?: PlainObject;
    timing?: number;
}
export declare function getEggInfo<T extends 'async' | 'sync' = 'sync'>(option: GetEggInfoOpt): T extends 'async' ? Promise<EggInfoResult> : EggInfoResult;
export declare function convertString<T>(val: string | undefined, defaultVal: T): T;
export declare function isIdentifierName(s: string): boolean;
export declare function loadFiles(cwd: string, pattern?: string | string[]): string[];
export declare function writeJsConfig(cwd: string): string | undefined;
export declare function writeTsConfig(cwd: string): string | undefined;
export declare function checkMaybeIsTsProj(cwd: string, pkgInfo?: any): any;
export declare function checkMaybeIsJsProj(cwd: string, pkgInfo?: any): boolean;
export declare function loadModules<T = any>(cwd: string, loadDefault?: boolean, preHandle?: (...args: any[]) => any): {
    [key: string]: T;
};
export declare function strToFn(fn: any): any;
export declare function pickFields<T extends string = string>(obj: PlainObject, fields: T[]): PlainObject<any>;
export declare function log(msg: string, prefix?: boolean): void;
export declare function getImportStr(from: string, to: string, moduleName?: string, importStar?: boolean): string;
export declare function writeFileSync(fileUrl: any, content: any): void;
export declare function cleanJs(cwd: string): void;
export declare function getModuleObjByPath(f: string): {
    props: string[];
    moduleName: string;
};
export declare function formatPath(str: string): string;
export declare function toArray(pattern?: string | string[]): string[];
export declare function removeSameNameJs(f: string): string | undefined;
export declare function resolveModule(url: any): string | undefined;
export declare function moduleExist(mod: string, cwd?: string): string | true | undefined;
export declare function requireFile(url: any): any;
export declare function extend<T = any>(obj: any, ...args: Array<Partial<T>>): T;
export declare function parseJson(jsonStr: string): any;
export declare function getPkgInfo(cwd: string): any;
export declare function readJson(jsonUrl: string): any;
export declare function readJson5(jsonUrl: string): any;
export declare function formatProp(prop: string): string;
export declare function camelProp(property: string, caseStyle: string | ((...args: any[]) => string)): string;
export declare function loadTsConfig(tsconfigPath: string): ts.CompilerOptions;
/**
 * ts ast utils
 */
export declare function findExportNode(code: string): {
    exportDefaultNode: ts.Node | undefined;
    exportNodeList: ts.Node[];
};
export declare function isClass(v: any): v is {
    new (...args: any[]): any;
};
export declare function modifierHas(node: any, kind: any): any;
export declare function cleanEmpty(data: any): {};
