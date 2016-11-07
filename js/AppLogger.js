"use strict";
const uuid = require('uuid');
const moment = require('moment');
(function (LogLevel) {
    LogLevel[LogLevel["Silly"] = 0] = "Silly";
    LogLevel[LogLevel["Verbose"] = 1] = "Verbose";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Warn"] = 4] = "Warn";
    LogLevel[LogLevel["Error"] = 5] = "Error";
})(exports.LogLevel || (exports.LogLevel = {}));
var LogLevel = exports.LogLevel;
var Color;
(function (Color) {
    Color[Color["red"] = 31] = "red";
    Color[Color["green"] = 32] = "green";
    Color[Color["yellow"] = 33] = "yellow";
    Color[Color["blue"] = 34] = "blue";
    Color[Color["cyan"] = 36] = "cyan";
})(Color || (Color = {}));
class AppLogger {
    constructor() {
        this.stream = process.stderr;
        this.level = LogLevel.Info;
        if (!AppLogger.instance) {
            AppLogger.instance = this;
            this.writer = this.stream.write;
        }
    }
    static GetInstance() {
        return AppLogger.instance;
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
        console.log(color);
        return `\x1B[${color}m${LogLevel[level].toLowerCase()}\x1B[0m`;
    }
    setStream(stream) {
        this.stream = stream;
        this.enable(true);
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
    setRequestId(requestId) {
        this.requestId = requestId;
    }
    getRequestId() {
        return this.requestId;
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
        let result = JSON.stringify(logData, null, 4).replace(/"level": "([^"]*)"/g, `"level": "${this.colorizeLevel(level)}"`);
        if (typeof logData.details === 'string') {
            result = result.replace(/"details": ".*"/g, `"details": "${logData.details.replace(/\n/g, `\n${' '.repeat(12)}`)}"`);
        }
        this.stream.write(`${result}\n`);
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
}
AppLogger.instance = new AppLogger();
exports.AppLogger = AppLogger;
//# sourceMappingURL=AppLogger.js.map