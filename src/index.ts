import {ElasticSearch} from "./utils/elasticsearch";

const CronJob = require('cron').CronJob;
import { RedisChecker } from "./checkers/RedisChecker";
import {Utils} from "./utils/util";
import {Checker} from "./checkers/Checker";
import {WebChecker} from "./checkers/WebChecker";
import {Processor} from "./processor/processor";

const clientId = 'demo';
const es = new ElasticSearch();
const processor = new Processor();

let configJob = new CronJob({
    cronTime: Utils.cronTime(1),
    onTick: () => {
        es.getClientConfig(clientId).then((results) => {
            processConfigs(results);
        });
    }
});
configJob.start();

/**
 * Process Configs
 * @param results
 */
function processConfigs(results) {
    results.forEach((config) => {
        processor.addJob(config);
    });
}
