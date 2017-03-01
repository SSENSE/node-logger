import {Request, Response} from 'restify';
import * as moment from 'moment';
import {Color, generateRequestId} from './Common';

export class AccessLogger {

    private appId: string;
    private enabled: boolean = true;
    private pretty: boolean = false;
    private stream: {write: Function} = process.stdout;

    public constructor(appId: string) {
        this.appId = appId;
    }

    public enable(enabled: boolean): void {
        this.enabled = enabled;
    }

    public makePretty(pretty: boolean): void {
        this.pretty = pretty;
    }

    public setStream(stream: {write: Function}): void {
        this.stream = stream;
        this.enable(true);
    }

    public setAppId(appId: string): void {
        this.appId = appId;
    }

    public logRequest(req: Request, res: Response): void {
        if (this.enabled !== true) {
            return;
        }

        let line: string = null;

        if (this.pretty) { // Colorized, wimpy, developer logs
            // tslint:disable-next-line:max-line-length
            const color = res.statusCode >= 500 ? Color.red : res.statusCode >= 400 ? Color.yellow : res.statusCode >= 300 ? Color.cyan : Color.green;
            const latency = (<any> req)._time ? `${Date.now() - (<any> req)._time} ms` : '-';
            const size = res.header('content-length') || '-';
            line = `${req.method} ${req.url} \x1B[${color}m${res.statusCode}\x1B[0m ${latency} - ${size}`;
        } else {
            // SSENSE Standardized Access Logs
            const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            const reqId = (<any> req).xRequestId || generateRequestId(this.appId);
            const userId = '-'; // TODO: Implement it for your application
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

        this.stream.write(`${line}\n`);
    }
}
