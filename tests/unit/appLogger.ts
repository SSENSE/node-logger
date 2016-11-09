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
        const logger = AppLogger.GetInstance();
        logger.setAppId('test');
        logger.enable(true);
        logger.setLevel('Silly');

        logger.verbose('toto');
        this.log.restore();

        expect(this.output).to.contain('toto');
        expect(this.output).to.contain('verbose');

        done();
    });

    it('has the properties it should', (done: Function) => {
        const logger = AppLogger.GetInstance();
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
    })
});