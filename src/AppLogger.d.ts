export declare enum LogLevel {
    Silly = 0,
    Verbose = 1,
    Info = 2,
    Warn = 4,
    Error = 5,
}
export declare class AppLogger {
    private stream;
    private writer;
    private appId;
    private requestId;
    private level;
    private static instance;
    private pretty;
    constructor();
    static GetInstance(): AppLogger;
    private colorizeLevel(level);
    setStream(stream: {
        write: Function;
    }): void;
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
