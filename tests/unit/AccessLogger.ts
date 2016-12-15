import {expect} from 'chai';
import * as sinon from 'sinon';
import {AccessLogger} from '../../ts/AccessLogger';

let stub: sinon.SinonStub;
let lastLog: string;
describe('AccessLogger', () => {
    before(() => {
        stub = sinon.stub(process.stderr, 'write', (data: string) => {
            lastLog = data;
        });
    });

    after(() => {
        stub.restore();
    });

    it('AccessLogger::logRequest', (done: Function) => {
        try {
            let logger = new AccessLogger();
            logger.setStream(process.stderr);
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
            expect(lastLog).to.contain('"undefined undefined HTTP/undefined" undefined - "-" "-"');

            logger = new AccessLogger();
            logger.makePretty(true);
            logger.setStream(process.stderr);
            logger.logRequest(req, res);
            expect(lastLog).to.contain('\x1B');
            done();
        } catch (err) {
            done(err);
        }
    });
});