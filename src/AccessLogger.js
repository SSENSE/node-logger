"use strict";
const moment = require('moment');
var Color;
(function (Color) {
    Color[Color["red"] = 31] = "red";
    Color[Color["green"] = 32] = "green";
    Color[Color["yellow"] = 33] = "yellow";
    Color[Color["cyan"] = 36] = "cyan";
})(Color || (Color = {}));
class AccessLogger {
    constructor(liteMode = false) {
        this.stream = process.stdout;
        this.pretty = false;
        this.writer = this.stream.write;
    }
    enable(enabled) {
        this.writer = () => { };
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    }
    makePretty(pretty) {
        this.pretty = pretty;
    }
    setStream(stream) {
        this.stream = stream;
        this.enable(true);
    }
    logRequest(req, res) {
        let line = null;
        if (this.pretty) {
            const color = res.statusCode >= 500 ? Color.red : res.statusCode >= 400 ? Color.yellow : res.statusCode >= 300 ? Color.cyan : Color.green;
            line = `${req.method} ${req.url} \x1B[${color}m${res.statusCode}\x1B[0m`;
        }
        else {
            const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            const reqId = req.header('x-request-id') || '-';
            const userId = '-';
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
        this.writer.call(this.stream, `${line}\n`);
    }
}
exports.AccessLogger = AccessLogger;
//# sourceMappingURL=AccessLogger.js.map