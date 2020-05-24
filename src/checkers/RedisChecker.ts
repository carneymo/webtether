import {Checker} from "./Checker";
import { ElasticSearch } from "../utils/elasticsearch";

const Utils = require("../utils/util").Utils;
const Redis = require('ioredis');

/**
 * Redis Checker
 */
export class RedisChecker extends Checker {

    protected index: string;
    protected es: ElasticSearch;
    protected redis: any;
    protected options: any;

    /**
     * Constructor
     * @param config
     */
    constructor(config: any) {
        super();
        this.index = config.client_id;
        this.clientId = config.client_id;

        this.options = {
            host: config.host,
            port: config.port,
            family: 4,
            password: config.secret_key
        };
        this.transformRedis();
    }

    /**
     * Transform Redis
     *
     * Transformation takes values returned and changes
     * their structure to fit.
     */
    public transformRedis() {
        this.transformInfo();
    }

    /**
     * Transform Info
     * Returns big long string with "\n\r" for each config line item.
     */
    protected transformInfo() {
        Redis.Command.setReplyTransformer("info", function (result) {
            let obj = {};
            let lines = result.split("\n");
            let totalKeys = 0;
            lines.forEach((element) => {
                if (element.includes(':')) {
                    let key = element.split(':')[0];
                    let value = element.split(':')[1].replace("\r", "");
                    if (key.match(/db[0-9]{1,2}/)) {
                        let keys = value.split(',')[0].split("=")[1];
                        totalKeys += parseInt(keys);
                    }
                    if (key === 'uptime_in_seconds') {
                        obj['uptime_in_seconds_pretty'] = Utils.prettyTime(value);
                    }
                    obj[key] = value;
                }
            });
            obj['query_time'] = new Date().getTime();
            obj['total_keys'] = totalKeys;
            return obj;
        });
    }

    /**
     * Redis Check
     */
    public check() {
        let success = false;
        let startTime = new Date().getTime();
        let latency = 0;

        this.redis = new Redis(this.options);

        // Attempting to connect, start timer for latency check
        this.redis.on('connect', () => {
            startTime = new Date().getTime();
        });

        // Once connected, 'ready' signal sent
        this.redis.on('ready', () => {
            // End latency check once we're connected
            let stopTime = new Date().getTime();
            latency = stopTime - startTime;
            console.log("Latency: " + latency + " ms");
        });

        // Ping sent to ensure connection
        let pingStart = new Date().getTime();
        this.redis.ping((err, result) => {
            if (result === "PONG") {
                console.log("PING latency: " + ((new Date().getTime()) - pingStart));
                this.redis.info("all", (err, result) => {
                    if (err) {
                        console.log("Error: " + err);
                    }
                    else {
                        result.latency = latency;
                        if(this.store(result)) {
                            console.log("Indexed redis reply");
                        }
                    }
                });
            }
            else {
                success = false;
                console.log("Error: " + err);
            }
        });
    }
}
