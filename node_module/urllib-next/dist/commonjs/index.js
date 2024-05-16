"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_AGENT = exports.HttpClient2 = exports.HttpClient = exports.getGlobalDispatcher = exports.setGlobalDispatcher = exports.Dispatcher = exports.Agent = exports.ProxyAgent = exports.MockAgent = exports.curl = exports.request = exports.getDefaultHttpClient = void 0;
const ylru_1 = __importDefault(require("ylru"));
const HttpClient_js_1 = require("./HttpClient.js");
let httpClient;
const domainSocketHttpClients = new ylru_1.default(50);
function getDefaultHttpClient() {
    if (!httpClient) {
        httpClient = new HttpClient_js_1.HttpClient();
    }
    return httpClient;
}
exports.getDefaultHttpClient = getDefaultHttpClient;
async function request(url, options) {
    if (options?.socketPath) {
        let domainSocketHttpclient = domainSocketHttpClients.get(options.socketPath);
        if (!domainSocketHttpclient) {
            domainSocketHttpclient = new HttpClient_js_1.HttpClient({
                connect: { socketPath: options.socketPath },
            });
            domainSocketHttpClients.set(options.socketPath, domainSocketHttpclient);
        }
        return await domainSocketHttpclient.request(url, options);
    }
    return await getDefaultHttpClient().request(url, options);
}
exports.request = request;
// export curl method is keep compatible with urllib.curl()
// ```ts
// import * as urllib from 'urllib';
// urllib.curl(url);
// ```
async function curl(url, options) {
    return await request(url, options);
}
exports.curl = curl;
var undici_1 = require("undici");
Object.defineProperty(exports, "MockAgent", { enumerable: true, get: function () { return undici_1.MockAgent; } });
Object.defineProperty(exports, "ProxyAgent", { enumerable: true, get: function () { return undici_1.ProxyAgent; } });
Object.defineProperty(exports, "Agent", { enumerable: true, get: function () { return undici_1.Agent; } });
Object.defineProperty(exports, "Dispatcher", { enumerable: true, get: function () { return undici_1.Dispatcher; } });
Object.defineProperty(exports, "setGlobalDispatcher", { enumerable: true, get: function () { return undici_1.setGlobalDispatcher; } });
Object.defineProperty(exports, "getGlobalDispatcher", { enumerable: true, get: function () { return undici_1.getGlobalDispatcher; } });
// HttpClient2 is keep compatible with urllib@2 HttpClient2
var HttpClient_js_2 = require("./HttpClient.js");
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return HttpClient_js_2.HttpClient; } });
Object.defineProperty(exports, "HttpClient2", { enumerable: true, get: function () { return HttpClient_js_2.HttpClient; } });
Object.defineProperty(exports, "USER_AGENT", { enumerable: true, get: function () { return HttpClient_js_2.HEADER_USER_AGENT; } });
__exportStar(require("./HttpClientError.js"), exports);
exports.default = {
    request,
    curl,
    USER_AGENT: HttpClient_js_1.HEADER_USER_AGENT,
};
