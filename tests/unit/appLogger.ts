import {expect} from 'chai';
import {AppLogger} from '../../ts/AppLogger';

describe('AppLogger', () => {

    it('logs without errors', (done) => {
        const logger = AppLogger.GetInstance();
        logger.setAppId('test');
        logger.enable(true);
        logger.setLevel('Silly');
        
        try {
            logger.silly('toto');
            
        } catch(err) {
            done(err);
        }
        done();
    });

});