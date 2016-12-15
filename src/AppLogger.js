"use strict";
const uuid = require("uuid");
const moment = require("moment");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Silly"] = 0] = "Silly";
    LogLevel[LogLevel["Verbose"] = 1] = "Verbose";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Warn"] = 3] = "Warn";
    LogLevel[LogLevel["Error"] = 4] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Color;
(function (Color) {
    Color[Color["red"] = 31] = "red";
    Color[Color["green"] = 32] = "green";
    Color[Color["yellow"] = 33] = "yellow";
    Color[Color["blue"] = 34] = "blue";
    Color[Color["cyan"] = 36] = "cyan";
})(Color || (Color = {}));
class AppLogger {
    constructor(level = LogLevel.Info, stream = process.stderr) {
        this.pretty = false;
        this.level = level;
        this.stream = stream;
    }
    colorizeLevel(level) {
        let color = null;
        switch (level) {
            case LogLevel.Error:
                color = Color.red;
                break;
            case LogLevel.Warn:
                color = Color.yellow;
                break;
            case LogLevel.Info:
                color = Color.green;
                break;
            case LogLevel.Verbose:
                color = Color.blue;
                break;
            case LogLevel.Silly:
                color = Color.cyan;
                break;
            default:
                color = 0;
                break;
        }
        return `\x1B[${color}m${LogLevel[level].toLowerCase()}\x1B[0m`;
    }
    enable(enabled) {
        this.writer = () => { };
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    }
    setAppId(appId) {
        this.appId = appId;
    }
    getAppId() {
        return this.appId;
    }
    generateRequestId() {
        return this.appId + '/' + uuid.v4();
    }
    setLevel(level) {
        this.level = LogLevel[level || ''];
        if (this.level === undefined) {
            this.enable(false);
        }
    }
    getLevel() {
        return this.level;
    }
    makePretty(pretty) {
        this.pretty = pretty;
    }
    log(level, message, id, tags, details) {
        if (this.level === undefined || level < this.level) {
            return;
        }
        const logData = {
            log_id: id || this.requestId,
            datetime: moment().format('DD/MM/YYYY:HH:mm:ss ZZ'),
            level: LogLevel[level].toLowerCase(),
            message: message,
            tags: tags || [],
            details: details || null
        };
        if (this.pretty) {
            let result = JSON.stringify(logData, null, 4).replace(/"level": "([^"]*)"/g, `"level": "${this.colorizeLevel(level)}"`);
            if (typeof logData.details === 'string') {
                result = result.replace(/"details": ".*"/g, `"details": "${logData.details.replace(/\n/g, `\n${' '.repeat(12)}`)}"`);
            }
            this.stream.write(`${result}\n`);
        }
        else {
            this.stream.write(JSON.stringify(logData) + '\n');
        }
    }
    silly(message, id, tags, details) {
        this.log(LogLevel.Silly, message, id, tags, details);
    }
    verbose(message, id, tags, details) {
        this.log(LogLevel.Verbose, message, id, tags, details);
    }
    info(message, id, tags, details) {
        this.log(LogLevel.Info, message, id, tags, details);
    }
    warn(message, id, tags, details) {
        this.log(LogLevel.Warn, message, id, tags, details);
    }
    error(message, id, tags, details) {
        this.log(LogLevel.Error, message, id, tags, details);
    }
    getRequestLogger(requestId) {
        const logger = {};
        for (const logFunction of ['silly', 'verbose', 'info', 'warn', 'error']) {
            logger[logFunction] = (message, tags, details) => {
                this[logFunction].call(this, message, requestId, tags, details);
            };
        }
        return logger;
    }
}
exports.AppLogger = AppLogger;
//# sourceMappingURL=AppLogger.js.map