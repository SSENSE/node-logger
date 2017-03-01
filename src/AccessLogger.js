"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const Common_1 = require("./Common");
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
    makePretty(pretty) {
        this.pretty = pretty;
    }
    setStream(stream) {
        this.stream = stream;
        this.enable(true);
    }
    setAppId(appId) {
        this.appId = appId;
    }
    logRequest(req, res) {
        if (this.enabled !== true) {
            return;
        }
        let line = null;
        if (this.pretty) {
            // tslint:disable-next-line:max-line-length
            const color = res.statusCode >= 500 ? Common_1.Color.red : res.statusCode >= 400 ? Common_1.Color.yellow : res.statusCode >= 300 ? Common_1.Color.cyan : Common_1.Color.green;
            const latency = req._time ? `${Date.now() - req._time} ms` : '-';
            const size = res.header('content-length') || '-';
            line = `${req.method} ${req.url} \x1B[${color}m${res.statusCode}\x1B[0m ${latency} - ${size}`;
        }
        else {
            // SSENSE Standardized Access Logs
            const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            const reqId = req.xRequestId || Common_1.generateRequestId(this.appId);
            const userId = '-'; // TODO: Implement it for your application
            const date = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
            const method = req.method;
            const query = req.url;
            const httpVersion = `HTTP/${req.httpVersion}`;
            const code = res.statusCode;
            const size = res.header('content-length') || '-';
            const referer = req.header('referer') || '-';
            const browser = req.header('user-agent') || '-';
            line = `${ip} ${reqId} ${userId} [${date}] "${method} ${query} ${httpVersion}" ${code} ${size} "${referer}" "${browser}"`;
        }
        this.stream.write(`${line}\n`);
    }
}
exports.AccessLogger = AccessLogger;
//# sourceMappingURL=AccessLogger.js.map