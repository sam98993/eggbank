"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAgent = void 0;
const node_dns_1 = __importDefault(require("node:dns"));
const node_net_1 = require("node:net");
const undici_1 = require("undici");
class IllegalAddressError extends Error {
    hostname;
    ip;
    family;
    constructor(hostname, ip, family) {
        const message = 'illegal address';
        super(message);
        this.name = this.constructor.name;
        this.hostname = hostname;
        this.ip = ip;
        this.family = family;
        Error.captureStackTrace(this, this.constructor);
    }
}
class HttpAgent extends undici_1.Agent {
    #checkAddress;
    constructor(options) {
        /* eslint node/prefer-promises/dns: off*/
        const _lookup = options.lookup ?? node_dns_1.default.lookup;
        const lookup = (hostname, dnsOptions, callback) => {
            _lookup(hostname, dnsOptions, (err, ...args) => {
                // address will be array on Node.js >= 20
                const address = args[0];
                const family = args[1];
                if (err)
                    return callback(err, address, family);
                if (options.checkAddress) {
                    // dnsOptions.all set to default on Node.js >= 20, dns.lookup will return address array object
                    if (typeof address === 'string') {
                        if (!options.checkAddress(address, family)) {
                            err = new IllegalAddressError(hostname, address, family);
                        }
                    }
                    else if (Array.isArray(address)) {
                        const addresses = address;
                        for (const addr of addresses) {
                            if (!options.checkAddress(addr.address, addr.family)) {
                                err = new IllegalAddressError(hostname, addr.address, addr.family);
                                break;
                            }
                        }
                    }
                }
                callback(err, address, family);
            });
        };
        super({
            connect: { ...options.connect, lookup },
        });
        this.#checkAddress = options.checkAddress;
    }
    dispatch(options, handler) {
        if (this.#checkAddress && options.origin) {
            const originUrl = typeof options.origin === 'string' ? new URL(options.origin) : options.origin;
            let hostname = originUrl.hostname;
            // [2001:db8:2de::e13] => 2001:db8:2de::e13
            if (hostname.startsWith('[') && hostname.endsWith(']')) {
                hostname = hostname.substring(1, hostname.length - 1);
            }
            const family = (0, node_net_1.isIP)(hostname);
            if (family === 4 || family === 6) {
                // if request hostname is ip, custom lookup won't execute
                if (!this.#checkAddress(hostname, family)) {
                    throw new IllegalAddressError(hostname, hostname, family);
                }
            }
        }
        return super.dispatch(options, handler);
    }
}
exports.HttpAgent = HttpAgent;
