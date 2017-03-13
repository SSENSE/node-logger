import * as moment from 'moment';
import {getService} from './Common';

export class BaseLog {
    private static standardEnv: string;

    public app: string;
    public env: string;
    public service: string;
    public date: string;
    [key: string]: any;

    public constructor(appId: string) {
        this.app = appId;
        this.env = this.getStandardEnv();
        this.service = getService();
        this.date = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
    }

    private getStandardEnv(): string {
        if (!BaseLog.standardEnv) {
            const env = process.env.NODE_ENV ? (<string> process.env.NODE_ENV).toLowerCase().trim() : null;
            switch (env) {
                case 'development': BaseLog.standardEnv = 'dev'; break;
                case 'production': BaseLog.standardEnv = 'prod'; break;
                default: BaseLog.standardEnv = env; break;
            }
        }

        return BaseLog.standardEnv;
    }
}
