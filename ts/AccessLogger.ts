import {Request, Response} from 'restify';
import * as moment from 'moment';

enum Color {
    red = 31,
    green = 32,
    yellow = 33,
    cyan = 36
}

// @TODO - Add interface for DI

export class AccessLogger {

    private stream: {write: Function} = process.stdout;

    private writer: Function;

    private pretty: Boolean = false;

    public constructor(liteMode: Boolean = false) {
        this.writer = this.stream.write;
    }

    public enable(enabled: Boolean): void {
        this.writer = () => {}; // tslint:disable-line no-empty
        if (enabled && this.stream && this.stream.write) {
            this.writer = this.stream.write;
        }
    }

    public makePretty(pretty: Boolean): void{
        this.pretty = pretty;
    }

    /**
     * @TODO - this could be used for tests, since 'sinon' is used for tests maybe this could be removed
     */
    public setStream(stream: {write: Function}): void {
        this.stream = stream;
        this.enable(true);
    }

    public logRequest(req: Request, res: Response): void {

        let line: string = null;

        if (this.pretty) {
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