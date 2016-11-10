/// <reference types="node" />
import WritableStream = NodeJS.WritableStream;
export declare enum LogLevel {
    Silly = 0,
    Verbose = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}
export interface Logger {
    enable(enabled: boolean): void;
    setAppId(appId: string): void;
    setLevel(level: string): void;
    makePretty(pretty: Boolean): void;
}
export declare class AppLogger implements Logger {
    private stream;
    private writer;
    private appId;
    private requestId;
    private level;
    private pretty;
    constructor(level?: LogLevel, stream?: WritableStream);
    private colorizeLevel(level);
    enable(enabled: boolean): void;
    setAppId(appId: string): void;
    getAppId(): string;
    setRequestId(requestId: string): void;
    getRequestId(): string;
    generateRequestId(): string;
    setLevel(level: string): void;
    getLevel(): LogLevel;
    makePretty(pretty: Boolean): void;
    log(level: LogLevel, message: string, id?: string, tags?: string[], details?: any): void;
    silly(message: string, id?: string, tags?: string[], details?: any): void;
    verbose(message: string, id?: string, tags?: string[], details?: any): void;
    info(message: string, id?: string, tags?: string[], details?: any): void;
    warn(message: string, id?: string, tags?: string[], details?: any): void;
    error(message: string, id?: string, tags?: string[], details?: any): void;
}
