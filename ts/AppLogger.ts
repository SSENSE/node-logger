import * as uuid from 'uuid';
import * as moment from 'moment';

export enum LogLevel {
    Silly = 0,
    Verbose = 1,
    Info = 2,
    Warn = 4,
    Error = 5
}

enum Color {
    red = 31,
    green = 32,
    yellow = 33,
    blue = 34,
    cyan = 36
}

export class AppLogger {

    private stream: {write: Function} = process.stderr;

    private writer: Function;

    private appId: string;

    private requestId: string;

    private level: LogLevel = LogLevel.Info;

    private static instance: AppLogger = new AppLogger();

    private pretty: Boolean = false;

    constructor() {
        if (!AppLogger.instance) {
            AppLogger.instance = this;
            this.writer = this.stream.write;
        }
    }

    public static GetInstance(): AppLogger {
        return AppLogger.instance;
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

    /**
     * @TODO - this could be used for tests, since 'sinon' is used for tests maybe this could be removed
     */
    public setStream(stream: {write: Function}): void {
        this.stream = stream;
        this.enable(true);
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

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public getRequestId(): string {
        return this.requestId;
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

    public getLevel(): LogLevel  {
        return this.level;
    }

    public makePretty(pretty: Boolean): void{
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
}
