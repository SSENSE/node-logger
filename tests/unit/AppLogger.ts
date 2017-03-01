import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSandbox} from 'sinon';
import * as uuid from 'uuid';
import {AppLogger, LogLevel} from '../../ts/AppLogger';

let lastLog: string;
const appId = 'my-app';
let sandbox: SinonSandbox;

describe('AppLogger', () => {
    before(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('AppLogger::log()', () => {
        const logger = new AppLogger(appId);
        logger.setStream(<any> { write: (data: string) => {
            lastLog = data;
        }});
        logger.silly('foo');
        expect(lastLog).to.equal(undefined, 'Last log should be empty');
        logger.info('foo');
        expect(lastLog).to.contain('foo');
        expect(lastLog).to.not.contain('\x1B');
        logger.setPretty(true);
        logger.warn('bar', 'logId', [], 'aaa\nbbb');
        expect(lastLog).to.not.contain('foo');
        expect(lastLog).to.contain('\x1B');
        expect(lastLog).to.contain(`${' '.repeat(12)}bbb`);
        logger.setLevel(LogLevel.Silly);
        logger.verbose('foobar');
        expect(lastLog).to.contain('foobar');
        logger.error('foobar');
        expect(lastLog).to.contain('\x1B[31');
        logger.info('foobar');
        expect(lastLog).to.contain('\x1B[32');
        logger.silly('foobar');
        expect(lastLog).to.contain('\x1B[36');
        logger.log(10, 'foo');
        expect(lastLog).to.contain('\x1B[0mlog\x1B[0m');
    });

    it('AppLogger::getters/setters', () => {
        const logger = new AppLogger(appId);

        // AppId
        expect(logger.getAppId()).to.equal(appId);
        logger.setAppId('foo');
        expect(logger.getAppId()).to.equal('foo');

        // Level
        expect(logger.getLevel()).to.equal(LogLevel.Info);
        logger.setLevel(LogLevel.Silly);
        expect(logger.getLevel()).to.equal(LogLevel.Silly);
    });

    it('AppLogger::generateRequestId()', () => {
        const logger = new AppLogger(appId);
        sandbox.stub(uuid, 'v4', () => 'foo');
        expect(logger.generateRequestId()).to.equal(`${appId}/foo`);
    });

    it('AppLogger::getRequestLogger()', () => {
        const logger = new AppLogger(appId);
        logger.setStream(<any> { write: (data: string) => {
            lastLog = data;
        }});

        sandbox.stub(uuid, 'v4', () => 'foo');
        const reqLogger = logger.getRequestLogger(logger.generateRequestId());
        expect(reqLogger).to.have.property('silly');
        expect(reqLogger).to.have.property('verbose');
        expect(reqLogger).to.have.property('info');
        expect(reqLogger).to.have.property('warn');
        expect(reqLogger).to.have.property('error');

        reqLogger.info('foo');
        const result = JSON.parse(lastLog);
        expect(result.log_id).to.equal(`${appId}/foo`);
        expect(result.level).to.equal('info');
        expect(result.message).to.equal('foo');
    });
});
