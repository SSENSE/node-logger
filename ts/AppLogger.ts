import WritableStream = NodeJS.WritableStream;
import * as uuid from 'uuid';
import * as moment from 'moment';

export enum LogLevel {
    Silly = 0,
    Verbose = 1,
    Info = 2,
    Warn = 3,
    Error = 4
}

enum Color {
    red = 31,
    green = 32,
    yellow = 33,
    blue = 34,
    cyan = 36
}

export interface Logger {
    enable(enabled: boolean): void;
    setAppId(appId: string): void;
    setLevel(level: string): void;
    makePretty(pretty: Boolean): void;
    generateRequestId(): string;
    silly(message: string, id?: string, tags?: string[], details?: any): void;
    verbose(message: string, id?: string, tags?: string[], details?: any): void;
    info(message: string, id?: string, tags?: string[], details?: any): void;
    warn(message: string, id?: string, tags?: string[], details?: any): void;
    error(message: string, id?: string, tags?: string[], details?: any): void;
}

export interface RequestLogger {
    silly(message: string, tags?: string[], details?: any): void;
    verbose(message: string, tags?: string[], details?: any): void;
    info(message: string, tags?: string[], details?: any): void;
    warn(message: string, tags?: string[], details?: any): void;
    error(message: string, tags?: string[], details?: any): void;
}

export class AppLogger implements Logger {

    private stream: WritableStream;

    private writer: Function;

    private appId: string;

    private requestId: string;

    private level: LogLevel;

    private pretty: Boolean = false;

    constructor(level: LogLevel = LogLevel.Info, stream: WritableStream = process.stderr) {
        this.level = level;
        this.stream = stream;
    }

    private colorizeLevel(level: LogLevel): string {
        let color: Color = null;
        switch (level) {
            case LogLevel.Error : color = Color.red; break;
            case LogLevel.Warn : color = Color.yellow; break;
            case LogLevel.Info : color = Color.green; break;
            case LogLevel.Verbose : color = Color.blue; break;
            case LogLevel.Silly : color = Color.cyan; break;
            default: color = 0; break;
        }

        return `\x1B[${color}m${LogLevel[level].toLowerCase()}\x1B[0m`;
    }

    public enable(enabled: boolean): void {
        this.writer = () => {}; // tslint:disable-line no-empty
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    }

    public setAppId(appId: string): void {
        this.appId = appId;
    }

    public getAppId(): string {
        return this.appId;
    }

    public generateRequestId(): string {
        return this.appId + '/' + uuid.v4();
    }

    public setLevel(level: string): void {
        this.level = <LogLevel> (<any> LogLevel)[level || ''];
        if (this.level === undefined) {
            this.enable(false);
        }
    }

    public getLevel(): LogLevel {
        return this.level;
    }

    public makePretty(pretty: Boolean): void {
        this.pretty = pretty;
    }

    public log(level: LogLevel, message: string, id?: string, tags?: string[], details?: any): void {

        if (this.level === undefined || level < this.level) {
            return;
        }

        const logData: any = {
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
        } else {
            this.stream.write(JSON.stringify(logData) + '\n');
        }
    }

    public silly(message: string, id?: string, tags?: string[], details?: any): void {
        this.log(LogLevel.Silly, message, id, tags, details);
    }

    public verbose(message: string, id?: string, tags?: string[], details?: any): void {
        this.log(LogLevel.Verbose, message, id, tags, details);
    }

    public info(message: string, id?: string, tags?: string[], details?: any): void {
        this.log(LogLevel.Info, message, id, tags, details);
    }

    public warn(message: string, id?: string, tags?: string[], details?: any): void {
        this.log(LogLevel.Warn, message, id, tags, details);
    }

    public error(message: string, id?: string, tags?: string[], details?: any): void {
        this.log(LogLevel.Error, message, id, tags, details);
    }

    public getRequestLogger(requestId: string): RequestLogger {
        const logger: any = {};

        for (const logFunction of ['silly', 'verbose', 'info', 'warn', 'error']) {
            logger[logFunction] = (message: string, tags?: string[], details?: any) => {
                (<any> this)[logFunction].call(this, message, requestId, tags, details);
            };
        }

        return logger;
    }
}
