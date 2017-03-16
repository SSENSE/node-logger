import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSandbox} from 'sinon';
import * as restify from 'restify';
import * as express from 'express';
import * as httpClient from 'supertest';
import {AccessLogger} from '../../ts/AccessLogger';
import {BaseLog} from '../../ts/BaseLog';

let sandbox: SinonSandbox;
let lastLog: string;
const stream: any = {write: Function};
let env: string;

class Request {
    public static async getPage(server: any, url: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const request = (<any> httpClient(server));
            request.get(url).end((err: Error, res: any) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
}

describe('AccessLogger', () => {
    before(() => {
        env = process.env.NODE_ENV;
        sandbox = sinon.sandbox.create();
        sandbox.stub(stream, 'write', (data: string) => {
            lastLog = data;
        });
    });

    afterEach(() => {
        (<any> BaseLog).standardEnv = null;
        process.env.NODE_ENV = env;
        sandbox.restore();
    });

    it('AccessLogger::logRequest()', () => {
        process.env.NODE_ENV = ' DEVELOPMENT  ';
        const appId = 'my-app';
        const logger = new AccessLogger(appId);
        logger.setStream(stream);

        const req: any = {
            connection: {
                remoteAddress: '127.0.0.1'
            },
            header(): string { // tslint:disable-line:no-missing-visibility-modifiers
                return undefined;
            }
        };
        const res: any = {
            getHeader(): string { // tslint:disable-line:no-missing-visibility-modifiers
                return undefined;
            }
        };
        logger.logRequest(req, res);
        let log = JSON.parse(lastLog);
        expect(log).to.haveOwnProperty('app');
        expect(log.app).to.equal(appId);
        expect(log).to.haveOwnProperty('env');
        expect(log.env).to.equal('dev');
        expect(log).to.haveOwnProperty('service');
        expect(log.service).to.equal('node');
        expect(log).to.haveOwnProperty('userId');
        expect(log.userId).to.equal(null, 'Result should be as expected');
        expect(log).to.haveOwnProperty('reqId');
        expect(log).to.haveOwnProperty('date');
        expect(log).to.haveOwnProperty('ip');
        expect(log).to.haveOwnProperty('httpVersion');

        logger.setAppId('foo');
        logger.logRequest(req, res);
        expect(lastLog).to.not.contain(appId);
        expect(lastLog).to.contain('foo');

        // Check 20X HTTP status (by default)
        logger.setPretty(true);
        logger.logRequest(req, res);
        expect(lastLog).to.equal('undefined undefined \x1B[32mundefined\x1B[0m - - -\n', 'Result should be as expected');

        // Check 50X HTTP status
        const clock = sandbox.useFakeTimers(Date.now());
        clock.now = 1500;
        req._time = 250;
        res.statusCode = 503;
        logger.logRequest(req, res);
        expect(lastLog).to.equal('undefined undefined \x1B[31m503\x1B[0m 1250 ms - -\n', 'Result should be as expected');

        // Check 40X HTTP status
        res.statusCode = 403;
        logger.logRequest(req, res);
        expect(lastLog).to.equal('undefined undefined \x1B[33m403\x1B[0m 1250 ms - -\n', 'Result should be as expected');

        // Check 30X HTTP status
        res.statusCode = 301;
        logger.logRequest(req, res);
        expect(lastLog).to.equal('undefined undefined \x1B[36m301\x1B[0m 1250 ms - -\n', 'Result should be as expected');

        // Check disabled
        logger.enable(false);
        res.statusCode = 800;
        logger.logRequest(req, res);
        expect(lastLog).to.not.contain('800');

        // Check custom user id callback
        logger.enable(true);
        logger.setPretty(false);
        res.statusCode = 200;
        logger.logRequest(req, res);
        log = JSON.parse(lastLog);
        expect(log).to.haveOwnProperty('userId');
        expect(log.userId).to.equal(null, 'Result should be as expected');

        logger.setUserIdCallback(() => {
            return 'bar';
        });
        logger.logRequest(req, res);
        log = JSON.parse(lastLog);
        expect(log).to.haveOwnProperty('userId');
        expect(log.userId).to.equal('bar');
    });

    it('AccessLogger::logRequest() - Restify', async () => {
        // Create logger
        process.env.NODE_ENV = ' PRODUCTION  ';
        const logger = new AccessLogger('restify');
        logger.setStream({write: (data: string) => {
            lastLog = data;
        }});

        // Create server
        const server = restify.createServer();
        server.get('/foo', async (req, res, next) => {
            res.send('bar');
            next();
        });

        // Add logger to server
        server.on('after', (req: any, res: any) => {
            logger.logRequest(req, res);
        });

        logger.setPretty(true);
        await Request.getPage(server, '/foo');
        expect(/^GET \/foo \x1B\[32m200\x1B\[0m (\d+) ms - 5\n$/.test(lastLog)).to.equal(true, 'Last log should be as expected');

        logger.setPretty(false);
        await Request.getPage(server, '/foo');
        expect(JSON.parse(lastLog).env).to.equal('prod');
    });

    it('AccessLogger::logRequest() - Express', async () => {
        // Create logger
        delete process.env.NODE_ENV;
        const logger = new AccessLogger('express');
        logger.setStream({write: (data: string) => {
            lastLog = data;
        }});

        // Create server
        const server = express();
        server.use((req, res, next) => {
            logger.logRequest(req, res, next);
        });

        server.get('/foo', (req, res, next) => {
            res.send('bar');
        });

        logger.setPretty(true);
        await Request.getPage(server, '/foo');
        expect(/^GET \/foo \x1B\[32m200\x1B\[0m \d+ ms - 3\n$/.test(lastLog)).to.equal(true, 'Last log should be as expected');

        logger.setPretty(false);
        await Request.getPage(server, '/foo');
        expect(JSON.parse(lastLog).env).to.equal(null, 'Result should be as expected');

        lastLog = null;
        logger.enable(false);
        await Request.getPage(server, '/foo');
        expect(lastLog).to.equal(null, 'Result should be as expected');
    });
});
