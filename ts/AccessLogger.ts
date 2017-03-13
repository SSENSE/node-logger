import * as restify from 'restify';
import * as express from 'express';
import {Color, generateRequestId} from './Common';
import {BaseLog} from './BaseLog';

export interface UserIdCallback {
    (req: restify.Request|express.Request, res: restify.Response|express.Response): string;
}

export class AccessLogger {

    private appId: string;
    private enabled: boolean = true;
    private pretty: boolean = false;
    private stream: {write: Function} = process.stdout;
    private userIdCallback: UserIdCallback;

    public constructor(appId: string) {
        this.appId = appId;
    }

    public enable(enabled: boolean): void {
        this.enabled = enabled;
    }

    public setPretty(pretty: boolean): void {
        this.pretty = pretty;
    }

    public setStream(stream: {write: Function}): void {
        this.stream = stream;
        this.enable(true);
    }

    public setAppId(appId: string): void {
        this.appId = appId;
    }

    public setUserIdCallback(callback: UserIdCallback): void {
        this.userIdCallback = callback;
    }

    public logRequest(req: restify.Request|express.Request, res: restify.Response|express.Response): void {
        if (this.enabled !== true) {
            return;
        }

        // Work in progress stuff to add request latency in express
        // if (req.on) {
        //     const start = process.hrtime();
        //     req.on('end', () => {
        //         const end = process.hrtime();
        //         const ms = (end[0] - start[0]) * 1e3 + (end[1] - start[1]) * 1e-6;
        //         console.log(ms.toFixed(3));
        //     });
        // }

        let line: string = null;
        if (this.pretty) { // Colorized, wimpy, developer logs
            // tslint:disable-next-line:max-line-length
            const color = res.statusCode >= 500 ? Color.red : res.statusCode >= 400 ? Color.yellow : res.statusCode >= 300 ? Color.cyan : Color.green;
            const latency = (<any> req)._time ? `${Date.now() - (<any> req)._time} ms` : '-';
            const size = res.getHeader('content-length') || '-';

            line = `${req.method} ${req.url} \x1B[${color}m${res.statusCode}\x1B[0m ${latency} - ${size}`;
        } else {
            const log = new BaseLog(this.appId);
            log.reqId = req.xRequestId || generateRequestId();
            log.userId = this.getUserId(req, res);
            log.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            log.method = req.method;
            log.route = req.url;
            log.httpVersion = `HTTP/${req.httpVersion}`;
            log.resCode = res.statusCode;
            log.resSize = res.getHeader('content-length');
            log.referer = req.header('referer');
            log.userAgent = req.header('user-agent');

            line = JSON.stringify(log);
        }

        this.stream.write(`${line}\n`);
    }

    private getUserId(req: restify.Request|express.Request, res: restify.Response|express.Response): string {
        let userId: string = null;

        if (typeof this.userIdCallback === 'function') {
            try {
                userId = this.userIdCallback(req, res);
            } catch (e) {} // tslint:disable-line:no-empty
        }

        return userId;
    }
}
