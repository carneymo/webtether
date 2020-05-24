"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
/**
 * Redis Checker
 */
var RedisChecker = /** @class */ (function () {
    function RedisChecker() {
    }
    /**
     * Redis Check
     * @param options
     */
    RedisChecker.prototype.redisCheck = function (options) {
        var success = false;
        var Redis = Promise.resolve().then(function () { return __importStar(require('ioredis')); });
        var startTime = new Date().getTime();
        var redis = new Redis(options);
        Redis.Command.setReplyTransformer("info", function (result) {
            var obj = {};
            var lines = result.split("\n");
            var totalKeys = 0;
            lines.forEach(function (element, index, lines) {
                if (element.includes(':')) {
                    var key = element.split(':')[0];
                    var value = element.split(':')[1].replace("\r", "");
                    if (key.match(/db[0-9]{1,2}/)) {
                        var keys = value.split(',')[0].split("=")[1];
                        totalKeys += parseInt(keys);
                    }
                    if (key === 'uptime_in_seconds') {
                        obj['uptime_in_seconds_pretty'] = utils.prettyTime(value);
                    }
                    obj[key] = value;
                }
            });
            obj['total_keys'] = totalKeys;
            return obj;
        });
        redis.on('connect', function () {
            // Attempting to connect, start timer for latency check
            startTime = new Date().getTime();
        });
        redis.on('ready', function () {
            // End latency check once we're connected
            var stopTime = new Date().getTime();
            var diff = stopTime - startTime;
            console.log("Latency: " + diff + " ms");
        });
        redis.ping(function (err, result) {
            if (result === "PONG") {
                success = true;
                console.log("Redis connected.");
                redis.info("all", function (err, result) {
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
    };
    return RedisChecker;
}());
