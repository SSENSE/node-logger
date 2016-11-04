var uuid = require('uuid');
var moment = require('moment');
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
var AppLogger = (function () {
    function AppLogger() {
        this.stream = process.stderr;
        this.level = LogLevel.Info;
        if (!AppLogger.instance) {
            AppLogger.instance = this;
            this.writer = this.stream.write;
        }
    }
    AppLogger.GetInstance = function () {
        return AppLogger.instance;
    };
    AppLogger.prototype.colorizeLevel = function (level) {
        var color = null;
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
        return "\u001B[" + color + "m" + LogLevel[level].toLowerCase() + "\u001B[0m";
    };
    AppLogger.prototype.setStream = function (stream) {
        this.stream = stream;
        this.enable(true);
    };
    AppLogger.prototype.enable = function (enabled) {
        this.writer = function () { };
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    };
    AppLogger.prototype.setAppId = function (appId) {
        this.appId = appId;
    };
    AppLogger.prototype.getAppId = function () {
        return this.appId;
    };
    AppLogger.prototype.setRequestId = function (requestId) {
        this.requestId = requestId;
    };
    AppLogger.prototype.getRequestId = function () {
        return this.requestId;
    };
    AppLogger.prototype.generateRequestId = function () {
        return this.appId + '/' + uuid.v4();
    };
    AppLogger.prototype.setLevel = function (level) {
        this.level = LogLevel[level || ''];
        if (this.level === undefined) {
            this.enable(false);
        }
    };
    AppLogger.prototype.getLevel = function () {
        return this.level;
    };
    AppLogger.prototype.log = function (level, message, id, tags, details) {
        if (this.level === undefined || level < this.level) {
            return;
        }
        this.writer.call(this.stream, JSON.stringify({
            log_id: this.requestId,
            datetime: moment().format('DD/MM/YYYY:HH:mm:ss ZZ'),
            level: LogLevel[level].toLowerCase(),
            message: message,
            tags: tags || [],
            details: details || null
        }) + '\n');
    };
    AppLogger.prototype.silly = function (message, id, tags, details) {
        this.log(LogLevel.Silly, message, id, tags, details);
    };
    AppLogger.prototype.verbose = function (message, id, tags, details) {
        this.log(LogLevel.Verbose, message, id, tags, details);
    };
    AppLogger.prototype.info = function (message, id, tags, details) {
        this.log(LogLevel.Info, message, id, tags, details);
    };
    AppLogger.prototype.warn = function (message, id, tags, details) {
        this.log(LogLevel.Warn, message, id, tags, details);
    };
    AppLogger.prototype.error = function (message, id, tags, details) {
        this.log(LogLevel.Error, message, id, tags, details);
    };
    AppLogger.instance = new AppLogger();
    return AppLogger;
})();
exports.AppLogger = AppLogger;
//# sourceMappingURL=AppLogger.js.map