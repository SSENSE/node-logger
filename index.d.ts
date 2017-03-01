import {Request, Response} from 'restify';

// AccessLogger
export class AccessLogger {
    constructor(applicationId: string);
    public enable(enabled: boolean): void;
    public makePretty(pretty: boolean): void;
    public setStream(stream: {write: Function}): void;
    public setAppId(appId: string): void;
    public logRequest(req: Request, res: Response): void;
}

// AppLogger related interfaces and data
export enum LogLevel {
    Silly = 0,
    Verbose = 1,
    Info = 2,
    Warn = 3,
    Error = 4
}

export interface Logger {
    enable(enabled: boolean): void;
    setAppId(appId: string): void;
    getAppId(): string;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    makePretty(pretty: boolean): void;
    setStream(stream: {write: Function}): void;
    generateRequestId(): string;

    log(level: LogLevel, message: string, id?: string, tags?: string[], details?: any): void;
    silly(message: string, id?: string, tags?: string[], details?: any): void;
    verbose(message: string, id?: string, tags?: string[], details?: any): void;
    info(message: string, id?: string, tags?: string[], details?: any): void;
    warn(message: string, id?: string, tags?: string[], details?: any): void;
    error(message: string, id?: string, tags?: string[], details?: any): void;

    getRequestLogger(requestId: string): RequestLogger;
}

export interface RequestLogger {
    silly(message: string, tags?: string[], details?: any): void;
    verbose(message: string, tags?: string[], details?: any): void;
    info(message: string, tags?: string[], details?: any): void;
    warn(message: string, tags?: string[], details?: any): void;
    error(message: string, tags?: string[], details?: any): void;
}

// AppLogger
export class AppLogger implements Logger {
    constructor(appId: string, level?: LogLevel, stream?: {write: Function});

    public enable(enabled: boolean): void;
    public setAppId(appId: string): void;
    public getAppId(): string;
    public setLevel(level: LogLevel): void;
    public getLevel(): LogLevel;
    public makePretty(pretty: boolean): void;
    public setStream(stream: {write: Function}): void;
    public generateRequestId(): string;

    public log(level: LogLevel, message: string, id?: string, tags?: string[], details?: any): void;
    public silly(message: string, id?: string, tags?: string[], details?: any): void;
    public verbose(message: string, id?: string, tags?: string[], details?: any): void;
    public info(message: string, id?: string, tags?: string[], details?: any): void;
    public warn(message: string, id?: string, tags?: string[], details?: any): void;
    public error(message: string, id?: string, tags?: string[], details?: any): void;

    public getRequestLogger(requestId: string): RequestLogger;
}

// We augment the restify module to expose our custom Request.logger? type.
declare module 'restify' {
    interface Request {
        xRequestId: string;
        logger: RequestLogger;
    }
}
