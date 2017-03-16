import * as restify from 'restify';
import * as express from 'express';
import * as onFinished from 'on-finished';
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

    public logRequest(req: restify.Request|express.Request, res: restify.Response|express.Response, next?: Function): void {
        if (typeof next === 'function') {
            if (this.enabled === true) {
                (<any> req)._time = Date.now();

                onFinished(res, () => {
                    this.log(req, res);
                });
            }

            next();
        } else if (this.enabled === true) {
            this.log(req, res);
        }
    }

    private log(req: restify.Request|express.Request, res: restify.Response|express.Response): void {
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
