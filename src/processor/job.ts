import {Utils} from "../utils/util";
import {Checker} from "../checkers/Checker";
import {RedisChecker} from "../checkers/RedisChecker";
import {WebChecker} from "../checkers/WebChecker";

const CronJob = require('cron').CronJob;
const hash = require('object-hash');

/**
 * Job
 */
export class Job {

    public id: string = "";
    public cronTime: string = "";
    public hash: string = "";
    public config: any;
    public cronJob: any;
    public ticksFired: number = 0;
    protected status: number = 0;
    protected error: string = "";

    /**
     * Constructor
     * @param config
     */
    public constructor(config: any) {
        this.id = config._id;
        this.initJob(config);
    }

    /**
     * Initialize Job
     * @param config
     */
    public initJob(config: any) {
        this.hash = hash(config);
        this.config = config;
        this.cronTime = Utils.cronTime(this.config._source.interval);
        this.status = 1;
        this.ticksFired = 0;
        this.cronJob = new CronJob(
            {
                cronTime: this.cronTime,
                onTick: () => {
                    this.status = 3;
                    this.ticksFired++;
                    let checker = this.getChecker(this.config._source);
                    console.log('Check every ' + Utils.prettyTime(this.config._source.interval) +
                                    ' seconds:', new Date());
                    checker.check();
                },
                onComplete: () => {
                    this.status = 1;
                    console.log('Stopped job with id: ' + this.id);
                },
                runOnInit: true
            }
        );
        this.runJob();
    }

    /**
     * Run Job
     */
    protected runJob() {
        if (this.status < 2) {
            this.cronJob.start();
            this.status = 2;
        }
    }

    /**
     * Get Status
     */
    public getStatus(): number {
        return this.status;
    }

    /**
     * Get Status String
     */
    public getStatusString(): string {
        let statusString = "";
        switch (this.status) {
            case 0:
                statusString = "Not Ready";
                break;
            case 1:
                statusString = "Ready";
                break;
            case 2:
                statusString = "Running";
                break;
            case 3:
                statusString = "Running with Tick Fired";
                break;
            case -1:
                statusString = this.error;
                break;
            default:
                statusString = "Unknown Status " + this.status;
                break;
        }
        return statusString;
    }

    /**
     * Is Config Different
     * @param config
     */
    public isConfigDifferent(config: any) {
        if (this.hash != hash(config)) {
            console.log("Config hash has changed.");
            this.updateJob(config);
        }
    }

    /**
     * Update Job
     * @param config
     */
    public updateJob(config: any) {
        this.cronJob.stop();
        this.status = 0;
        this.initJob(config);
    }

    /**
     * Get Checker
     * @param config
     */
    protected getChecker(config: any): Checker {
        switch (config.type) {
            case "redis":
                return new RedisChecker(config);
            case "web":
                return new WebChecker(config);
        }
        return null;
    }
}
