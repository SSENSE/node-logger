import {expect} from 'chai';
import * as sinon from 'sinon';
import {AccessLogger} from '../../ts/AccessLogger';
import {SinonSandbox} from 'sinon';

let sandbox: SinonSandbox;
let lastLog: string;
const stream: any = {write: Function};

describe('AccessLogger', () => {
    before(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(stream, 'write', (data: string) => {
            lastLog = data;
        });
    });

    after(() => {
        sandbox.restore();
    });

    it('AccessLogger::logRequest()', () => {
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
            header(): string { // tslint:disable-line:no-missing-visibility-modifiers
                return undefined;
            }
        };
        logger.logRequest(req, res);
        expect(lastLog).to.not.contain('\x1B');
        expect(lastLog).to.contain(appId);
        expect(lastLog).to.contain('"undefined undefined HTTP/undefined" undefined - "-" "-"');

        logger.setAppId('foo');
        logger.logRequest(req, res);
        expect(lastLog).to.not.contain(appId);
        expect(lastLog).to.contain('foo');

        // Check 20X HTTP status (by default)
        logger.makePretty(true);
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
    });
});
