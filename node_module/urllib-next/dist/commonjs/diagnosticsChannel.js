"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDiagnosticsChannel = void 0;
const node_diagnostics_channel_1 = __importDefault(require("node:diagnostics_channel"));
const node_perf_hooks_1 = require("node:perf_hooks");
const node_util_1 = require("node:util");
const node_net_1 = require("node:net");
const symbols_js_1 = __importDefault(require("./symbols.js"));
const utils_js_1 = require("./utils.js");
const debug = (0, node_util_1.debuglog)('urllib:DiagnosticsChannel');
let initedDiagnosticsChannel = false;
// https://undici.nodejs.org/#/docs/api/DiagnosticsChannel
// client --> server
// undici:request:create => { request }
//   -> [optional] undici:client:connected => { socket } [first request will create socket]
//   -> undici:client:sendHeaders => { socket, request }
//     -> undici:request:bodySent => { request }
//
// server --> client
// undici:request:headers => { request, response }
//   -> undici:request:trailers => { request, trailers }
function subscribe(name, listener) {
    if (typeof node_diagnostics_channel_1.default.subscribe === 'function') {
        node_diagnostics_channel_1.default.subscribe(name, listener);
    }
    else {
        // TODO: support Node.js 14, will be removed on the next major version
        node_diagnostics_channel_1.default.channel(name).subscribe(listener);
    }
}
function formatSocket(socket) {
    if (!socket)
        return socket;
    return {
        localAddress: socket[symbols_js_1.default.kSocketLocalAddress],
        localPort: socket[symbols_js_1.default.kSocketLocalPort],
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort,
        attemptedAddresses: socket.autoSelectFamilyAttemptedAddresses,
        connecting: socket.connecting,
    };
}
// make sure error contains socket info
const kDestroy = Symbol('kDestroy');
node_net_1.Socket.prototype[kDestroy] = node_net_1.Socket.prototype.destroy;
node_net_1.Socket.prototype.destroy = function (err) {
    if (err) {
        Object.defineProperty(err, symbols_js_1.default.kErrorSocket, {
            // don't show on console log
            enumerable: false,
            value: this,
        });
    }
    return this[kDestroy](err);
};
function getRequestOpaque(request, kHandler) {
    if (!kHandler)
        return;
    const handler = request[kHandler];
    // maxRedirects = 0 will get [Symbol(handler)]: RequestHandler {
    // responseHeaders: null,
    // opaque: {
    //   [Symbol(request id)]: 1,
    //   [Symbol(request start time)]: 465.0712921619415,
    //   [Symbol(enable request timing or not)]: true,
    //   [Symbol(request timing)]: [Object],
    //   [Symbol(request original opaque)]: undefined
    // }
    return handler?.opts?.opaque ?? handler?.opaque;
}
function initDiagnosticsChannel() {
    // makre sure init global DiagnosticsChannel once
    if (initedDiagnosticsChannel)
        return;
    initedDiagnosticsChannel = true;
    let kHandler;
    // This message is published when a new outgoing request is created.
    // Note: a request is only loosely completed to a given socket.
    subscribe('undici:request:create', (message, name) => {
        const { request } = message;
        if (!kHandler) {
            const symbols = Object.getOwnPropertySymbols(request);
            for (const symbol of symbols) {
                if (symbol.description === 'handler') {
                    kHandler = symbol;
                    break;
                }
            }
        }
        const opaque = getRequestOpaque(request, kHandler);
        // ignore non HttpClient Request
        if (!opaque || !opaque[symbols_js_1.default.kRequestId])
            return;
        debug('[%s] Request#%d %s %s, path: %s, headers: %o', name, opaque[symbols_js_1.default.kRequestId], request.method, request.origin, request.path, request.headers);
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].queuing = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // diagnosticsChannel.channel('undici:client:beforeConnect')
    subscribe('undici:client:connectError', (message, name) => {
        const { error, connectParams } = message;
        let { socket } = message;
        if (!socket && error[symbols_js_1.default.kErrorSocket]) {
            socket = error[symbols_js_1.default.kErrorSocket];
        }
        if (socket) {
            socket[symbols_js_1.default.kSocketId] = (0, utils_js_1.globalId)('UndiciSocket');
            socket[symbols_js_1.default.kSocketConnectErrorTime] = new Date();
            socket[symbols_js_1.default.kHandledRequests] = 0;
            socket[symbols_js_1.default.kHandledResponses] = 0;
            // copy local address to symbol, avoid them be reset after request error throw
            if (socket.localAddress) {
                socket[symbols_js_1.default.kSocketLocalAddress] = socket.localAddress;
                socket[symbols_js_1.default.kSocketLocalPort] = socket.localPort;
            }
            socket[symbols_js_1.default.kSocketConnectProtocol] = connectParams.protocol;
            socket[symbols_js_1.default.kSocketConnectHost] = connectParams.host;
            socket[symbols_js_1.default.kSocketConnectPort] = connectParams.port;
            debug('[%s] Socket#%d connectError, connectParams: %o, error: %s, (sock: %o)', name, socket[symbols_js_1.default.kSocketId], connectParams, error.message, formatSocket(socket));
        }
        else {
            debug('[%s] connectError, connectParams: %o, error: %o', name, connectParams, error);
        }
    });
    // This message is published after a connection is established.
    subscribe('undici:client:connected', (message, name) => {
        const { socket, connectParams } = message;
        socket[symbols_js_1.default.kSocketId] = (0, utils_js_1.globalId)('UndiciSocket');
        socket[symbols_js_1.default.kSocketStartTime] = node_perf_hooks_1.performance.now();
        socket[symbols_js_1.default.kSocketConnectedTime] = new Date();
        socket[symbols_js_1.default.kHandledRequests] = 0;
        socket[symbols_js_1.default.kHandledResponses] = 0;
        // copy local address to symbol, avoid them be reset after request error throw
        socket[symbols_js_1.default.kSocketLocalAddress] = socket.localAddress;
        socket[symbols_js_1.default.kSocketLocalPort] = socket.localPort;
        socket[symbols_js_1.default.kSocketConnectProtocol] = connectParams.protocol;
        socket[symbols_js_1.default.kSocketConnectHost] = connectParams.host;
        socket[symbols_js_1.default.kSocketConnectPort] = connectParams.port;
        debug('[%s] Socket#%d connected (sock: %o)', name, socket[symbols_js_1.default.kSocketId], formatSocket(socket));
    });
    // This message is published right before the first byte of the request is written to the socket.
    subscribe('undici:client:sendHeaders', (message, name) => {
        const { request, socket } = message;
        const opaque = getRequestOpaque(request, kHandler);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId])
            return;
        socket[symbols_js_1.default.kHandledRequests]++;
        // attach socket to opaque
        opaque[symbols_js_1.default.kRequestSocket] = socket;
        debug('[%s] Request#%d send headers on Socket#%d (handled %d requests, sock: %o)', name, opaque[symbols_js_1.default.kRequestId], socket[symbols_js_1.default.kSocketId], socket[symbols_js_1.default.kHandledRequests], formatSocket(socket));
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].requestHeadersSent = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
        // first socket need to caculate the connected time
        if (socket[symbols_js_1.default.kHandledRequests] === 1) {
            // kSocketStartTime - kRequestStartTime = connected time
            opaque[symbols_js_1.default.kRequestTiming].connected =
                (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime], socket[symbols_js_1.default.kSocketStartTime]);
        }
    });
    subscribe('undici:request:bodySent', (message, name) => {
        const { request } = message;
        const opaque = getRequestOpaque(request, kHandler);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId])
            return;
        debug('[%s] Request#%d send body', name, opaque[symbols_js_1.default.kRequestId]);
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].requestSent = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // This message is published after the response headers have been received, i.e. the response has been completed.
    subscribe('undici:request:headers', (message, name) => {
        const { request, response } = message;
        const opaque = getRequestOpaque(request, kHandler);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId])
            return;
        // get socket from opaque
        const socket = opaque[symbols_js_1.default.kRequestSocket];
        socket[symbols_js_1.default.kHandledResponses]++;
        debug('[%s] Request#%d get %s response headers on Socket#%d (handled %d responses, sock: %o)', name, opaque[symbols_js_1.default.kRequestId], response.statusCode, socket[symbols_js_1.default.kSocketId], socket[symbols_js_1.default.kHandledResponses], formatSocket(socket));
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].waiting = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // This message is published after the response body and trailers have been received, i.e. the response has been completed.
    subscribe('undici:request:trailers', (message, name) => {
        const { request } = message;
        const opaque = getRequestOpaque(request, kHandler);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId])
            return;
        debug('[%s] Request#%d get response body and trailers', name, opaque[symbols_js_1.default.kRequestId]);
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].contentDownload = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // This message is published if the request is going to error, but it has not errored yet.
    // subscribe('undici:request:error', (message, name) => {
    //   const { request, error } = message as DiagnosticsChannel.RequestErrorMessage;
    //   const opaque = request[kHandler]?.opts?.opaque;
    //   if (!opaque || !opaque[symbols.kRequestId]) return;
    //   const socket = opaque[symbols.kRequestSocket];
    //   debug('[%s] Request#%d error on Socket#%d (handled %d responses, sock: %o), error: %o',
    //     name, opaque[symbols.kRequestId], socket[symbols.kSocketId], socket[symbols.kHandledResponses],
    //     formatSocket(socket), error);
    // });
}
exports.initDiagnosticsChannel = initDiagnosticsChannel;
