const Utils = require("../utils/util").Utils;

/**
 * Redis Checker
 */
export class RedisChecker {
    /**
     * Redis Check
     * @param options
     */
    public redisCheck(options: object) {
        let success = false;
        let startTime = new Date().getTime();
        const Redis = require('ioredis');
        let redis = new Redis(options);

        Redis.Command.setReplyTransformer("info", (result) => {
            let obj = {};
            let lines = result.split("\n");
            let totalKeys = 0;
            lines.forEach((element, index, lines) => {
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
            obj['total_keys'] = totalKeys;
            return obj;
        });

        redis.on('connect', () => {
            // Attempting to connect, start timer for latency check
            startTime = new Date().getTime();
        });

        redis.on('ready', () => {
            // End latency check once we're connected
            let stopTime = new Date().getTime();
            let diff = stopTime - startTime;
            console.log("Latency: " + diff + " ms");
        });

        redis.ping((err, result) => {
            if (result === "PONG") {
                success = true;
                console.log("Redis connected.");
                redis.info("all", (err, result) => {
                    if (err) {
                        console.log("Error: " + err);
                    }
                    else {
                        console.log("Port: " + result.tcp_port);
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
