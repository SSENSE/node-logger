"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Common_1 = require("./Common");
const BaseLog_1 = require("./BaseLog");
class AccessLogger {
    constructor(appId) {
        this.enabled = true;
        this.pretty = false;
        this.stream = process.stdout;
        this.appId = appId;
    }
    enable(enabled) {
        this.enabled = enabled;
    }
    setPretty(pretty) {
        this.pretty = pretty;
    }
    setStream(stream) {
        this.stream = stream;
        this.enable(true);
    }
    setAppId(appId) {
        this.appId = appId;
    }
    setUserIdCallback(callback) {
        this.userIdCallback = callback;
    }
    logRequest(req, res) {
        if (this.enabled !== true) {
            return;
        }
        // Work in progress stuff to add request latency in express
        // if (req.on) {
        //     const start = process.hrtime();
        //     req.on('end', () => {
        //         const end = process.hrtime();
        //         const ms = (end[0] - start[0]) * 1e3 + (end[1] - start[1]) * 1e-6;
        //         console.log(ms.toFixed(3));
        //     });
        // }
        let line = null;
        if (this.pretty) {
            // tslint:disable-next-line:max-line-length
            const color = res.statusCode >= 500 ? Common_1.Color.red : res.statusCode >= 400 ? Common_1.Color.yellow : res.statusCode >= 300 ? Common_1.Color.cyan : Common_1.Color.green;
            const latency = req._time ? `${Date.now() - req._time} ms` : '-';
            const size = res.getHeader('content-length') || '-';
            line = `${req.method} ${req.url} \x1B[${color}m${res.statusCode}\x1B[0m ${latency} - ${size}`;
        }
        else {
            const log = new BaseLog_1.BaseLog(this.appId);
            log.reqId = req.xRequestId || Common_1.generateRequestId();
            log.userId = this.getUserId(req, res);
            log.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            log.method = req.method;
            log.route = req.url;
            log.httpVersion = `HTTP/${req.httpVersion}`;
            log.resCode = res.statusCode;
            log.resSize = res.getHeader('content-length');
            log.referer = req.header('referer');
            log.userAgent = req.header('user-agent');
            line = JSON.stringify(log);
        }
        this.stream.write(`${line}\n`);
    }
    getUserId(req, res) {
        let userId = null;
        if (typeof this.userIdCallback === 'function') {
            try {
                userId = this.userIdCallback(req, res);
            }
            catch (e) { } // tslint:disable-line:no-empty
        }
        return userId;
    }
}
exports.AccessLogger = AccessLogger;
//# sourceMappingURL=AccessLogger.js.map