import {Request, Response} from 'restify';
import * as moment from 'moment';

enum Color {
    red = 31,
    green = 32,
    yellow = 33,
    cyan = 36
}

export class AccessLogger {

    private stream: {write: Function} = process.stdout;

    private writer: Function;

    private liteMode: boolean;

    public constructor(liteMode: boolean = false) {
        this.liteMode = liteMode;
        this.writer = this.stream.write;
    }

    public enable(enabled: boolean): void {
        this.writer = () => {}; // tslint:disable-line no-empty
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    }

    public setStream(stream: {write: Function}): void {
        this.stream = stream;
        this.enable(true);
    }

    public logRequest(req: Request, res: Response): void {

        let line: string = null;

        if (this.liteMode) {
            // Colorized, wimpy, developer logs
            const color = res.statusCode >= 500 ? Color.red : res.statusCode >= 400 ? Color.yellow : res.statusCode >= 300 ? Color.cyan : Color.green;
            line = `${req.method} ${req.url} \x1B[${color}m${res.statusCode}\x1B[0m`;
        } else {
            // SSENSE Standardized Access Logs
            const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            const reqId = req.header('x-request-id') || '-';
            const userId = '-';
            const date = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
            const method = req.method;
            const query = req.url;
            const httpVersion = `HTTP/${req.httpVersion}`;
            const code = res.statusCode;
            const size = res.header('content-length') || '-';
            const referer = req.header('referer') || '-';
            const browser = req.header('user-agent') || '-';
            line = `${ip} ${reqId} ${userId} [${date}] "${method} ${query} ${httpVersion}" ${code} ${size} "${referer}" "${browser}"`;
        }

        this.writer.call(this.stream, `${line}\n`);
    }
}