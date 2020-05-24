import {Checker} from "../checkers/Checker";
import {RedisChecker} from "../checkers/RedisChecker";
import {WebChecker} from "../checkers/WebChecker";
import {Utils} from "../utils/util";
import {Job} from "./job";

const CronJob = require('cron').CronJob;
let hash = require('object-hash');

/**
 * Processor
 */
export class Processor {

    protected jobs: {} = null;

    /**
     * Add Job
     * @param config
     */
    public addJob(config: any): void {
        let source = config._source;
        let prettyTime = Utils.prettyTime(source.interval);

        console.log("Setting up cron for client [" + source.client_id + "] with name \"" + source.name + "\"");
        console.log("CronJob " + config._id + " setup to run every " + prettyTime);

        // If we have the job stored in our jobs list...
        if(config._id in this.jobs) {
            /** @var job Job **/
            let job = this.jobs[config._id];
            if(job.isConfigDifferent(config)) {
                job.updateJob(config);
            }
        }
        // Otherwise add new job
        else {
            let job = new Job(config);
            this.jobs[job.id] = job;
        }
    }

}
