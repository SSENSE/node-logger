var moment = require('moment');
var Color;
(function (Color) {
    Color[Color["red"] = 31] = "red";
    Color[Color["green"] = 32] = "green";
    Color[Color["yellow"] = 33] = "yellow";
    Color[Color["cyan"] = 36] = "cyan";
})(Color || (Color = {}));
var AccessLogger = (function () {
    function AccessLogger(liteMode) {
        if (liteMode === void 0) { liteMode = false; }
        this.stream = process.stdout;
        this.liteMode = liteMode;
        this.writer = this.stream.write;
    }
    AccessLogger.prototype.enable = function (enabled) {
        this.writer = function () { };
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    };
    AccessLogger.prototype.setStream = function (stream) {
        this.stream = stream;
        this.enable(true);
    };
    AccessLogger.prototype.logRequest = function (req, res) {
        var line = null;
        if (this.liteMode) {
            var color = res.statusCode >= 500 ? Color.red : res.statusCode >= 400 ? Color.yellow : res.statusCode >= 300 ? Color.cyan : Color.green;
            line = req.method + " " + req.url + " \u001B[" + color + "m" + res.statusCode + "\u001B[0m";
        }
        else {
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            var reqId = req.header('x-request-id') || '-';
            var userId = '-';
            var date = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
            var method = req.method;
            var query = req.url;
            var httpVersion = "HTTP/" + req.httpVersion;
            var code = res.statusCode;
            var size = res.header('content-length') || '-';
            var referer = req.header('referer') || '-';
            var browser = req.header('user-agent') || '-';
            line = ip + " " + reqId + " " + userId + " [" + date + "] \"" + method + " " + query + " " + httpVersion + "\" " + code + " " + size + " \"" + referer + "\" \"" + browser + "\"";
        }
        this.writer.call(this.stream, line + "\n");
    };
    return AccessLogger;
})();
exports.AccessLogger = AccessLogger;
//# sourceMappingURL=AccessLogger.js.map