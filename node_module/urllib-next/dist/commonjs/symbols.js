"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    kSocketId: Symbol('socket id'),
    kSocketStartTime: Symbol('socket start time'),
    kSocketConnectedTime: Symbol('socket connected time'),
    kSocketConnectErrorTime: Symbol('socket connectError time'),
    kSocketRequestEndTime: Symbol('socket request end time'),
    kSocketLocalAddress: Symbol('socket local address'),
    kSocketLocalPort: Symbol('socket local port'),
    kSocketConnectHost: Symbol('socket connect params: host'),
    kSocketConnectPort: Symbol('socket connect params: port'),
    kSocketConnectProtocol: Symbol('socket connect params: protocol'),
    kHandledRequests: Symbol('handled requests per socket'),
    kHandledResponses: Symbol('handled responses per socket'),
    kRequestSocket: Symbol('request on the socket'),
    kRequestId: Symbol('request id'),
    kRequestStartTime: Symbol('request start time'),
    kEnableRequestTiming: Symbol('enable request timing or not'),
    kRequestTiming: Symbol('request timing'),
    kRequestOriginalOpaque: Symbol('request original opaque'),
    kErrorSocket: Symbol('socket of error'),
};
