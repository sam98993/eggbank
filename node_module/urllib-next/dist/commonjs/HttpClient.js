"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.HEADER_USER_AGENT = void 0;
const node_diagnostics_channel_1 = __importDefault(require("node:diagnostics_channel"));
const node_events_1 = require("node:events");
const node_http_1 = require("node:http");
const node_util_1 = require("node:util");
const node_zlib_1 = require("node:zlib");
const node_buffer_1 = require("node:buffer");
const node_stream_1 = require("node:stream");
const node_stream_2 = __importDefault(require("node:stream"));
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const node_url_1 = require("node:url");
const node_perf_hooks_1 = require("node:perf_hooks");
const node_querystring_1 = __importDefault(require("node:querystring"));
const undici_1 = require("undici");
const symbols_js_1 = __importDefault(require("undici/lib/core/symbols.js"));
const formdata_node_1 = require("formdata-node");
const form_data_encoder_1 = require("form-data-encoder");
const default_user_agent_1 = __importDefault(require("default-user-agent"));
const mime_types_1 = __importDefault(require("mime-types"));
const qs_1 = __importDefault(require("qs"));
const pump_1 = __importDefault(require("pump"));
// Compatible with old style formstream
const formstream_1 = __importDefault(require("formstream"));
const HttpAgent_js_1 = require("./HttpAgent.js");
const utils_js_1 = require("./utils.js");
const symbols_js_2 = __importDefault(require("./symbols.js"));
const diagnosticsChannel_js_1 = require("./diagnosticsChannel.js");
const HttpClientError_js_1 = require("./HttpClientError.js");
const PROTO_RE = /^https?:\/\//i;
const FormData = undici_1.FormData ?? formdata_node_1.FormData;
// impl promise pipeline on Node.js 14
const pipelinePromise = node_stream_2.default.promises?.pipeline ?? function pipeline(...args) {
    return new Promise((resolve, reject) => {
        (0, pump_1.default)(...args, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
function noop() {
    // noop
}
const debug = (0, node_util_1.debuglog)('urllib:HttpClient');
// Node.js 14 or 16
const isNode14Or16 = /v1[46]\./.test(process.version);
// https://github.com/octet-stream/form-data
class BlobFromStream {
    #stream;
    #type;
    constructor(stream, type) {
        this.#stream = stream;
        this.#type = type;
    }
    stream() {
        return this.#stream;
    }
    get type() {
        return this.#type;
    }
    get [Symbol.toStringTag]() {
        return 'Blob';
    }
}
exports.HEADER_USER_AGENT = (0, default_user_agent_1.default)('node-urllib', '3.25.0');
function getFileName(stream) {
    const filePath = stream.path;
    if (filePath) {
        return (0, node_path_1.basename)(filePath);
    }
    return '';
}
function defaultIsRetry(response) {
    return response.status >= 500;
}
const channels = {
    request: node_diagnostics_channel_1.default.channel('urllib:request'),
    response: node_diagnostics_channel_1.default.channel('urllib:response'),
};
class HttpClient extends node_events_1.EventEmitter {
    #defaultArgs;
    #dispatcher;
    constructor(clientOptions) {
        super();
        this.#defaultArgs = clientOptions?.defaultArgs;
        if (clientOptions?.lookup || clientOptions?.checkAddress) {
            this.#dispatcher = new HttpAgent_js_1.HttpAgent({
                lookup: clientOptions.lookup,
                checkAddress: clientOptions.checkAddress,
                connect: clientOptions.connect,
            });
        }
        else if (clientOptions?.connect) {
            this.#dispatcher = new undici_1.Agent({
                connect: clientOptions.connect,
            });
        }
        (0, diagnosticsChannel_js_1.initDiagnosticsChannel)();
    }
    getDispatcher() {
        return this.#dispatcher ?? (0, undici_1.getGlobalDispatcher)();
    }
    setDispatcher(dispatcher) {
        this.#dispatcher = dispatcher;
    }
    getDispatcherPoolStats() {
        const agent = this.getDispatcher();
        // origin => Pool Instance
        const clients = agent[symbols_js_1.default.kClients];
        const poolStatsMap = {};
        if (!clients) {
            return poolStatsMap;
        }
        for (const [key, ref] of clients) {
            const pool = ref.deref();
            const stats = pool?.stats;
            if (!stats)
                continue;
            poolStatsMap[key] = {
                connected: stats.connected,
                free: stats.free,
                pending: stats.pending,
                queued: stats.queued,
                running: stats.running,
                size: stats.size,
            };
        }
        return poolStatsMap;
    }
    async request(url, options) {
        return await this.#requestInternal(url, options);
    }
    // alias to request, keep compatible with urllib@2 HttpClient.curl
    async curl(url, options) {
        return await this.request(url, options);
    }
    async #requestInternal(url, options, requestContext) {
        const requestId = (0, utils_js_1.globalId)('HttpClientRequest');
        let requestUrl;
        if (typeof url === 'string') {
            if (!PROTO_RE.test(url)) {
                // Support `request('www.server.com')`
                url = 'http://' + url;
            }
            requestUrl = new URL(url);
        }
        else {
            if (!url.searchParams) {
                // url maybe url.parse(url) object in urllib2
                requestUrl = new URL((0, node_url_1.format)(url));
            }
            else {
                // or even if not, we clone to avoid mutating it
                requestUrl = new URL(url.toString());
            }
        }
        const method = (options?.type || options?.method || 'GET').toUpperCase();
        const originalHeaders = options?.headers;
        const headers = {};
        const args = {
            retry: 0,
            socketErrorRetry: 1,
            timing: true,
            ...this.#defaultArgs,
            ...options,
            // keep method and headers exists on args for request event handler to easy use
            method,
            headers,
        };
        requestContext = {
            retries: 0,
            socketErrorRetries: 0,
            ...requestContext,
        };
        if (!requestContext.requestStartTime) {
            requestContext.requestStartTime = node_perf_hooks_1.performance.now();
        }
        const requestStartTime = requestContext.requestStartTime;
        // https://developer.chrome.com/docs/devtools/network/reference/?utm_source=devtools#timing-explanation
        const timing = {
            // socket assigned
            queuing: 0,
            // dns lookup time
            // dnslookup: 0,
            // socket connected
            connected: 0,
            // request headers sent
            requestHeadersSent: 0,
            // request sent, including headers and body
            requestSent: 0,
            // Time to first byte (TTFB), the response headers have been received
            waiting: 0,
            // the response body and trailers have been received
            contentDownload: 0,
        };
        const originalOpaque = args.opaque;
        // using opaque to diagnostics channel, binding request and socket
        const internalOpaque = {
            [symbols_js_2.default.kRequestId]: requestId,
            [symbols_js_2.default.kRequestStartTime]: requestStartTime,
            [symbols_js_2.default.kEnableRequestTiming]: !!args.timing,
            [symbols_js_2.default.kRequestTiming]: timing,
            [symbols_js_2.default.kRequestOriginalOpaque]: originalOpaque,
        };
        const reqMeta = {
            requestId,
            url: requestUrl.href,
            args,
            ctx: args.ctx,
            retries: requestContext.retries,
        };
        const socketInfo = {
            id: 0,
            localAddress: '',
            localPort: 0,
            remoteAddress: '',
            remotePort: 0,
            remoteFamily: '',
            bytesWritten: 0,
            bytesRead: 0,
            handledRequests: 0,
            handledResponses: 0,
        };
        // keep urllib createCallbackResponse style
        const resHeaders = {};
        let res = {
            status: -1,
            statusCode: -1,
            statusText: '',
            statusMessage: '',
            headers: resHeaders,
            size: 0,
            aborted: false,
            rt: 0,
            keepAliveSocket: true,
            requestUrls: [],
            timing,
            socket: socketInfo,
            retries: requestContext.retries,
            socketErrorRetries: requestContext.socketErrorRetries,
        };
        let headersTimeout = 5000;
        let bodyTimeout = 5000;
        if (args.timeout) {
            if (Array.isArray(args.timeout)) {
                headersTimeout = args.timeout[0] ?? headersTimeout;
                bodyTimeout = args.timeout[1] ?? bodyTimeout;
            }
            else {
                headersTimeout = bodyTimeout = args.timeout;
            }
        }
        if (originalHeaders) {
            // convert headers to lower-case
            for (const name in originalHeaders) {
                headers[name.toLowerCase()] = originalHeaders[name];
            }
        }
        // hidden user-agent
        const hiddenUserAgent = 'user-agent' in headers && !headers['user-agent'];
        if (hiddenUserAgent) {
            delete headers['user-agent'];
        }
        else if (!headers['user-agent']) {
            // need to set user-agent
            headers['user-agent'] = exports.HEADER_USER_AGENT;
        }
        // Alias to dataType = 'stream'
        if (args.streaming || args.customResponse) {
            args.dataType = 'stream';
        }
        if (args.dataType === 'json' && !headers.accept) {
            headers.accept = 'application/json';
        }
        // gzip alias to compressed
        if (args.gzip && args.compressed !== false) {
            args.compressed = true;
        }
        if (args.compressed && !headers['accept-encoding']) {
            headers['accept-encoding'] = 'gzip, br';
        }
        if (requestContext.retries > 0) {
            headers['x-urllib-retry'] = `${requestContext.retries}/${args.retry}`;
        }
        if (requestContext.socketErrorRetries > 0) {
            headers['x-urllib-retry-on-socket-error'] = `${requestContext.socketErrorRetries}/${args.socketErrorRetry}`;
        }
        if (args.auth && !headers.authorization) {
            headers.authorization = `Basic ${Buffer.from(args.auth).toString('base64')}`;
        }
        // streaming request should disable socketErrorRetry and retry
        let isStreamingRequest = false;
        if (args.dataType === 'stream' || args.writeStream) {
            isStreamingRequest = true;
        }
        try {
            const requestOptions = {
                method,
                maxRedirections: args.maxRedirects ?? 10,
                headersTimeout,
                headers,
                bodyTimeout,
                opaque: internalOpaque,
                dispatcher: args.dispatcher ?? this.#dispatcher,
                signal: args.signal,
            };
            if (typeof args.highWaterMark === 'number') {
                requestOptions.highWaterMark = args.highWaterMark;
            }
            if (typeof args.reset === 'boolean') {
                requestOptions.reset = args.reset;
            }
            if (args.followRedirect === false) {
                requestOptions.maxRedirections = 0;
            }
            const isGETOrHEAD = requestOptions.method === 'GET' || requestOptions.method === 'HEAD';
            // alias to args.content
            if (args.stream && !args.content) {
                // convert old style stream to new stream
                // https://nodejs.org/dist/latest-v18.x/docs/api/stream.html#readablewrapstream
                if ((0, utils_js_1.isReadable)(args.stream) && !(args.stream instanceof node_stream_1.Readable)) {
                    debug('Request#%d convert old style stream to Readable', requestId);
                    args.stream = new node_stream_1.Readable().wrap(args.stream);
                    isStreamingRequest = true;
                }
                else if (args.stream instanceof formstream_1.default) {
                    debug('Request#%d convert formstream to Readable', requestId);
                    args.stream = new node_stream_1.Readable().wrap(args.stream);
                    isStreamingRequest = true;
                }
                args.content = args.stream;
            }
            if (args.files) {
                if (isGETOrHEAD) {
                    requestOptions.method = 'POST';
                }
                const formData = new FormData();
                const uploadFiles = [];
                if (Array.isArray(args.files)) {
                    for (const [index, file] of args.files.entries()) {
                        const field = index === 0 ? 'file' : `file${index}`;
                        uploadFiles.push([field, file]);
                    }
                }
                else if (args.files instanceof node_stream_1.Readable || (0, utils_js_1.isReadable)(args.files)) {
                    uploadFiles.push(['file', args.files]);
                }
                else if (typeof args.files === 'string' || Buffer.isBuffer(args.files)) {
                    uploadFiles.push(['file', args.files]);
                }
                else if (typeof args.files === 'object') {
                    for (const field in args.files) {
                        // set custom fileName
                        uploadFiles.push([field, args.files[field], field]);
                    }
                }
                // set normal fields first
                if (args.data) {
                    for (const field in args.data) {
                        formData.append(field, args.data[field]);
                    }
                }
                for (const [index, [field, file, customFileName]] of uploadFiles.entries()) {
                    if (typeof file === 'string') {
                        // FIXME: support non-ascii filename
                        // const fileName = encodeURIComponent(basename(file));
                        // formData.append(field, await fileFromPath(file, `utf-8''${fileName}`, { type: mime.lookup(fileName) || '' }));
                        const fileName = (0, node_path_1.basename)(file);
                        const fileReadable = (0, node_fs_1.createReadStream)(file);
                        formData.append(field, new BlobFromStream(fileReadable, mime_types_1.default.lookup(fileName) || ''), fileName);
                    }
                    else if (Buffer.isBuffer(file)) {
                        formData.append(field, new node_buffer_1.Blob([file]), customFileName || `bufferfile${index}`);
                    }
                    else if (file instanceof node_stream_1.Readable || (0, utils_js_1.isReadable)(file)) {
                        const fileName = getFileName(file) || customFileName || `streamfile${index}`;
                        formData.append(field, new BlobFromStream(file, mime_types_1.default.lookup(fileName) || ''), fileName);
                        isStreamingRequest = true;
                    }
                }
                if (undici_1.FormData) {
                    requestOptions.body = formData;
                }
                else {
                    // Node.js 14 does not support spec-compliant FormData
                    // https://github.com/octet-stream/form-data#usage
                    const encoder = new form_data_encoder_1.FormDataEncoder(formData);
                    Object.assign(headers, encoder.headers);
                    // fix "Content-Length":"NaN"
                    delete headers['Content-Length'];
                    requestOptions.body = node_stream_1.Readable.from(encoder);
                }
            }
            else if (args.content) {
                if (!isGETOrHEAD) {
                    // handle content
                    requestOptions.body = args.content;
                    if (args.contentType) {
                        headers['content-type'] = args.contentType;
                    }
                    else if (typeof args.content === 'string' && !headers['content-type']) {
                        headers['content-type'] = 'text/plain;charset=UTF-8';
                    }
                    isStreamingRequest = (0, utils_js_1.isReadable)(args.content);
                }
            }
            else if (args.data) {
                const isStringOrBufferOrReadable = typeof args.data === 'string'
                    || Buffer.isBuffer(args.data)
                    || (0, utils_js_1.isReadable)(args.data);
                if (isGETOrHEAD) {
                    if (!isStringOrBufferOrReadable) {
                        let query;
                        if (args.nestedQuerystring) {
                            query = qs_1.default.stringify(args.data);
                        }
                        else {
                            query = node_querystring_1.default.stringify(args.data);
                        }
                        // reset the requestUrl
                        const href = requestUrl.href;
                        requestUrl = new URL(href + (href.includes('?') ? '&' : '?') + query);
                    }
                }
                else {
                    if (isStringOrBufferOrReadable) {
                        requestOptions.body = args.data;
                        isStreamingRequest = (0, utils_js_1.isReadable)(args.data);
                    }
                    else {
                        if (args.contentType === 'json'
                            || args.contentType === 'application/json'
                            || headers['content-type']?.startsWith('application/json')) {
                            requestOptions.body = JSON.stringify(args.data);
                            if (!headers['content-type']) {
                                headers['content-type'] = 'application/json';
                            }
                        }
                        else {
                            headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
                            if (args.nestedQuerystring) {
                                requestOptions.body = qs_1.default.stringify(args.data);
                            }
                            else {
                                requestOptions.body = new URLSearchParams(args.data).toString();
                            }
                        }
                    }
                }
            }
            if (isStreamingRequest) {
                args.retry = 0;
                args.socketErrorRetry = 0;
            }
            debug('Request#%d %s %s, headers: %j, headersTimeout: %s, bodyTimeout: %s, isStreamingRequest: %s', requestId, requestOptions.method, requestUrl.href, headers, headersTimeout, bodyTimeout, isStreamingRequest);
            requestOptions.headers = headers;
            channels.request.publish({
                request: reqMeta,
            });
            if (this.listenerCount('request') > 0) {
                this.emit('request', reqMeta);
            }
            let response = await (0, undici_1.request)(requestUrl, requestOptions);
            if (response.statusCode === 401 && response.headers['www-authenticate'] &&
                !requestOptions.headers.authorization && args.digestAuth) {
                // handle digest auth
                const authenticateHeaders = response.headers['www-authenticate'];
                const authenticate = Array.isArray(authenticateHeaders)
                    ? authenticateHeaders.find(authHeader => authHeader.startsWith('Digest '))
                    : authenticateHeaders;
                if (authenticate && authenticate.startsWith('Digest ')) {
                    debug('Request#%d %s: got digest auth header WWW-Authenticate: %s', requestId, requestUrl.href, authenticate);
                    requestOptions.headers.authorization = (0, utils_js_1.digestAuthHeader)(requestOptions.method, `${requestUrl.pathname}${requestUrl.search}`, authenticate, args.digestAuth);
                    debug('Request#%d %s: auth with digest header: %s', requestId, url, requestOptions.headers.authorization);
                    if (Array.isArray(response.headers['set-cookie'])) {
                        // FIXME: merge exists cookie header
                        requestOptions.headers.cookie = response.headers['set-cookie'].join(';');
                    }
                    response = await (0, undici_1.request)(requestUrl, requestOptions);
                }
            }
            const context = response.context;
            let lastUrl = '';
            if (context?.history) {
                for (const urlObject of context?.history) {
                    res.requestUrls.push(urlObject.href);
                    lastUrl = urlObject.href;
                }
            }
            else {
                res.requestUrls.push(requestUrl.href);
                lastUrl = requestUrl.href;
            }
            const contentEncoding = response.headers['content-encoding'];
            const isCompressedContent = contentEncoding === 'gzip' || contentEncoding === 'br';
            res.headers = response.headers;
            res.status = res.statusCode = response.statusCode;
            res.statusMessage = res.statusText = node_http_1.STATUS_CODES[res.status] || '';
            if (res.headers['content-length']) {
                res.size = parseInt(res.headers['content-length']);
            }
            let data = null;
            if (args.dataType === 'stream') {
                // only auto decompress on request args.compressed = true
                if (args.compressed === true && isCompressedContent) {
                    // gzip or br
                    const decoder = contentEncoding === 'gzip' ? (0, node_zlib_1.createGunzip)() : (0, node_zlib_1.createBrotliDecompress)();
                    res = Object.assign((0, node_stream_1.pipeline)(response.body, decoder, noop), res);
                }
                else {
                    res = Object.assign(response.body, res);
                }
            }
            else if (args.writeStream) {
                if (isNode14Or16 && args.writeStream.destroyed) {
                    throw new Error('writeStream is destroyed');
                }
                if (args.compressed === true && isCompressedContent) {
                    const decoder = contentEncoding === 'gzip' ? (0, node_zlib_1.createGunzip)() : (0, node_zlib_1.createBrotliDecompress)();
                    await pipelinePromise(response.body, decoder, args.writeStream);
                }
                else {
                    await pipelinePromise(response.body, args.writeStream);
                }
            }
            else {
                // buffer
                data = Buffer.from(await response.body.arrayBuffer());
                if (isCompressedContent && data.length > 0) {
                    try {
                        data = contentEncoding === 'gzip' ? (0, node_zlib_1.gunzipSync)(data) : (0, node_zlib_1.brotliDecompressSync)(data);
                    }
                    catch (err) {
                        if (err.name === 'Error') {
                            err.name = 'UnzipError';
                        }
                        throw err;
                    }
                }
                if (args.dataType === 'text' || args.dataType === 'html') {
                    data = data.toString();
                }
                else if (args.dataType === 'json') {
                    if (data.length === 0) {
                        data = null;
                    }
                    else {
                        data = (0, utils_js_1.parseJSON)(data.toString(), args.fixJSONCtlChars);
                    }
                }
            }
            res.rt = (0, utils_js_1.performanceTime)(requestStartTime);
            // get real socket info from internalOpaque
            this.#updateSocketInfo(socketInfo, internalOpaque);
            const clientResponse = {
                opaque: originalOpaque,
                data,
                status: res.status,
                statusCode: res.status,
                statusText: res.statusText,
                headers: res.headers,
                url: lastUrl,
                redirected: res.requestUrls.length > 1,
                requestUrls: res.requestUrls,
                res,
            };
            if (args.retry > 0 && requestContext.retries < args.retry) {
                const isRetry = args.isRetry ?? defaultIsRetry;
                if (isRetry(clientResponse)) {
                    if (args.retryDelay) {
                        await (0, utils_js_1.sleep)(args.retryDelay);
                    }
                    requestContext.retries++;
                    return await this.#requestInternal(url, options, requestContext);
                }
            }
            debug('Request#%d got response, status: %s, headers: %j, timing: %j', requestId, res.status, res.headers, res.timing);
            channels.response.publish({
                request: reqMeta,
                response: res,
            });
            if (this.listenerCount('response') > 0) {
                this.emit('response', {
                    requestId,
                    error: null,
                    ctx: args.ctx,
                    req: {
                        ...reqMeta,
                        options: args,
                    },
                    res,
                });
            }
            return clientResponse;
        }
        catch (rawError) {
            debug('Request#%d throw error: %s', requestId, rawError);
            let err = rawError;
            if (err.name === 'HeadersTimeoutError') {
                err = new HttpClientError_js_1.HttpClientRequestTimeoutError(headersTimeout, { cause: err });
            }
            else if (err.name === 'BodyTimeoutError') {
                err = new HttpClientError_js_1.HttpClientRequestTimeoutError(bodyTimeout, { cause: err });
            }
            else if (err.code === 'UND_ERR_CONNECT_TIMEOUT') {
                err = new HttpClientError_js_1.HttpClientConnectTimeoutError(err.message, err.code, { cause: err });
            }
            else if (err.code === 'UND_ERR_SOCKET' || err.code === 'ECONNRESET') {
                // auto retry on socket error, https://github.com/node-modules/urllib/issues/454
                if (args.socketErrorRetry > 0 && requestContext.socketErrorRetries < args.socketErrorRetry) {
                    requestContext.socketErrorRetries++;
                    return await this.#requestInternal(url, options, requestContext);
                }
            }
            err.opaque = originalOpaque;
            err.status = res.status;
            err.headers = res.headers;
            err.res = res;
            if (err.socket) {
                // store rawSocket
                err._rawSocket = err.socket;
            }
            err.socket = socketInfo;
            // make sure requestUrls not empty
            if (res.requestUrls.length === 0) {
                res.requestUrls.push(requestUrl.href);
            }
            res.rt = (0, utils_js_1.performanceTime)(requestStartTime);
            this.#updateSocketInfo(socketInfo, internalOpaque, rawError);
            channels.response.publish({
                request: reqMeta,
                response: res,
                error: err,
            });
            if (this.listenerCount('response') > 0) {
                this.emit('response', {
                    requestId,
                    error: err,
                    ctx: args.ctx,
                    req: {
                        ...reqMeta,
                        options: args,
                    },
                    res,
                });
            }
            throw err;
        }
    }
    #updateSocketInfo(socketInfo, internalOpaque, err) {
        const socket = internalOpaque[symbols_js_2.default.kRequestSocket] ?? err?.[symbols_js_2.default.kErrorSocket];
        if (socket) {
            socketInfo.id = socket[symbols_js_2.default.kSocketId];
            socketInfo.handledRequests = socket[symbols_js_2.default.kHandledRequests];
            socketInfo.handledResponses = socket[symbols_js_2.default.kHandledResponses];
            if (socket[symbols_js_2.default.kSocketLocalAddress]) {
                socketInfo.localAddress = socket[symbols_js_2.default.kSocketLocalAddress];
                socketInfo.localPort = socket[symbols_js_2.default.kSocketLocalPort];
            }
            if (socket.remoteAddress) {
                socketInfo.remoteAddress = socket.remoteAddress;
                socketInfo.remotePort = socket.remotePort;
                socketInfo.remoteFamily = socket.remoteFamily;
            }
            socketInfo.bytesRead = socket.bytesRead;
            socketInfo.bytesWritten = socket.bytesWritten;
            if (socket[symbols_js_2.default.kSocketConnectErrorTime]) {
                socketInfo.connectErrorTime = socket[symbols_js_2.default.kSocketConnectErrorTime];
                if (Array.isArray(socket.autoSelectFamilyAttemptedAddresses)) {
                    socketInfo.attemptedRemoteAddresses = socket.autoSelectFamilyAttemptedAddresses;
                }
                socketInfo.connectProtocol = socket[symbols_js_2.default.kSocketConnectProtocol];
                socketInfo.connectHost = socket[symbols_js_2.default.kSocketConnectHost];
                socketInfo.connectPort = socket[symbols_js_2.default.kSocketConnectPort];
            }
            if (socket[symbols_js_2.default.kSocketConnectedTime]) {
                socketInfo.connectedTime = socket[symbols_js_2.default.kSocketConnectedTime];
            }
            if (socket[symbols_js_2.default.kSocketRequestEndTime]) {
                socketInfo.lastRequestEndTime = socket[symbols_js_2.default.kSocketRequestEndTime];
            }
            socket[symbols_js_2.default.kSocketRequestEndTime] = new Date();
        }
    }
}
exports.HttpClient = HttpClient;
