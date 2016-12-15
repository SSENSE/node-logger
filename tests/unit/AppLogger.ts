import {expect} from 'chai';
import * as sinon from 'sinon';
import {AppLogger} from '../../ts/AppLogger';

describe('AppLogger', () => {

    beforeEach(() => {
        // Stub console.log to store the output in a var
        this.output = '';
        this.log = sinon.stub(process.stderr, 'write', (message: string) => {
            this.output += message;
        });
    });

    it('logs fine', (done: Function) => {
        const logger = new AppLogger(0, process.stderr);
        logger.setAppId('test');
        logger.enable(true);

        logger.info('toto');
        this.log.restore();

        expect(this.output).to.contain('toto');
        expect(this.output).to.contain('info');

        done();
    });

    it('logs in a pretty format', (done: Function) => {
        const logger = new AppLogger(0, process.stderr);
        logger.setAppId('test');
        logger.enable(true);
        logger.makePretty(true);

        logger.silly('toto');
        this.log.restore();

        expect((this.output.match(/\n/g) || []).length).to.be.above(1);

        done();
    });

    it('has the properties it should', (done: Function) => {
        const logger = new AppLogger(0, process.stderr);
        logger.setAppId('test');
        logger.enable(true);
        logger.setLevel('Silly');

        logger.verbose('toto');
        this.log.restore();

        expect(this.output).to.contain('datetime');
        expect(this.output).to.contain('level');
        expect(this.output).to.contain('message');
        expect(this.output).to.contain('tags');
        expect(this.output).to.contain('details');

        done();
    });

    it('should create request loggers', (done: Function) => {
        const logger = new AppLogger(0, process.stderr);
        logger.setAppId('test');
        logger.enable(true);
        logger.setLevel('Silly');

        const requestLogger1 = logger.getRequestLogger('REQUEST_ID_1');
        const requestLogger2 = logger.getRequestLogger('REQUEST_ID_2');
        requestLogger1.warn('toto');

        const requestOutput1 = this.output;
        this.output = '';

        requestLogger2.error('toto');
        const requestOutput2 = this.output;

        expect(requestOutput1).to.contain('REQUEST_ID_1');
        expect(requestOutput2).to.contain('REQUEST_ID_2');


        this.log.restore();
        done();
    });
});
