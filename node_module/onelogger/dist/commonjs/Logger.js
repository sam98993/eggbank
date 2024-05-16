"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const node_assert_1 = require("node:assert");
const node_util_1 = require("node:util");
globalThis.__ONE_LOGGER_INSTANCES__ = new Map();
class Logger {
    #loggerName;
    #prefix;
    constructor(options) {
        this.#loggerName = options.loggerName;
        this.#prefix = options.prefix;
    }
    info(message, ...optionalParams) {
        this.#log('info', message, ...optionalParams);
    }
    warn(message, ...optionalParams) {
        this.#log('warn', message, ...optionalParams);
    }
    error(message, ...optionalParams) {
        this.#log('error', message, ...optionalParams);
    }
    #log(level, message, ...optionalParams) {
        const realLogger = this._getRealLogger();
        if (this.#prefix) {
            const log = (0, node_util_1.format)(message, ...optionalParams);
            realLogger[level](`[${this.#prefix}] ${log}`);
        }
        else {
            realLogger[level](message, ...optionalParams);
        }
    }
    _getRealLogger() {
        return globalThis.__ONE_LOGGER_INSTANCES__.get(this.#loggerName) ?? globalThis.console;
    }
    static setRealLogger(loggerName, realLogger) {
        if (!realLogger) {
            globalThis.__ONE_LOGGER_INSTANCES__.delete(loggerName);
        }
        else {
            (0, node_assert_1.strict)(!(realLogger instanceof Logger), 'can\'t set realLogger to Logger instance');
            globalThis.__ONE_LOGGER_INSTANCES__.set(loggerName, realLogger);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBK0M7QUFDL0MseUNBQW1DO0FBUW5DLFVBQVUsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztBQU9qRSxNQUFhLE1BQU07SUFDakIsV0FBVyxDQUFTO0lBQ3BCLE9BQU8sQ0FBVTtJQUVqQixZQUFZLE9BQXNCO1FBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDaEMsQ0FBQztJQUNELElBQUksQ0FBQyxPQUFhLEVBQUUsR0FBRyxjQUFxQjtRQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQ0QsSUFBSSxDQUFDLE9BQWEsRUFBRSxHQUFHLGNBQXFCO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLGNBQWMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxLQUFLLENBQUMsT0FBYSxFQUFFLEdBQUcsY0FBcUI7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELElBQUksQ0FBQyxLQUFnQyxFQUFFLE9BQWEsRUFBRSxHQUFHLGNBQXFCO1FBQzVFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixNQUFNLEdBQUcsR0FBRyxJQUFBLGtCQUFNLEVBQUMsT0FBTyxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDL0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7YUFBTSxDQUFDO1lBQ04sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDO0lBRVMsY0FBYztRQUN0QixPQUFPLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFDekYsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBa0IsRUFBRSxVQUErQjtRQUN0RSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDaEIsVUFBVSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUEsb0JBQU0sRUFBQyxDQUFDLENBQUMsVUFBVSxZQUFZLE1BQU0sQ0FBQyxFQUFFLDBDQUEwQyxDQUFDLENBQUM7WUFDcEYsVUFBVSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEUsQ0FBQztJQUNILENBQUM7Q0FDRjtBQXhDRCx3QkF3Q0MifQ==