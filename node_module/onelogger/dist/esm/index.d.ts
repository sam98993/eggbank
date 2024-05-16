import { Logger } from './Logger.js';
import type { ILogger } from './ILogger.js';
export type * from './ILogger.js';
export * from './Logger.js';
export declare function setCustomLogger(loggerName: string, realLogger: ILogger | undefined): void;
export declare function setLogger(realLogger: ILogger): void;
export declare function setCoreLogger(realLogger: ILogger): void;
export declare function getCustomLogger(loggerName: string, prefix?: string): Logger;
export declare function getLogger(prefix?: string): Logger;
export declare function getCoreLogger(prefix?: string): Logger;
