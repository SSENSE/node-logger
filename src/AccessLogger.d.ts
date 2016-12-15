import { Request, Response } from 'restify';
export declare class AccessLogger {
    private stream;
    private writer;
    private pretty;
    constructor();
    enable(enabled: Boolean): void;
    makePretty(pretty: Boolean): void;
    setStream(stream: {
        write: Function;
    }): void;
    logRequest(req: Request, res: Response): void;
}
