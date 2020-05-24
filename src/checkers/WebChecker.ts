import {Checker} from "./Checker";
import {ElasticSearch} from "../utils/elasticsearch";

const https = require('https');

/**
 * Web Checker
 */
export class WebChecker extends Checker {

    protected index: string;
    protected es: ElasticSearch;

    public url: string = "";
    public curlMethod: string = "get";
    public endpoint: string = "";
    public clientId: string = "";

    /**
     * Constructor
     * @param config
     */
    constructor(config: any) {
        super();
        this.url = ((config.port == 443) ? "https" : "http")
            + "://" + config.host + "/" + config.endpoint;
        this.curlMethod = config.curl_method;
        this.index = config.client_id;
        this.clientId = config.client_id;
    }

    /**
     * POST
     */
    post() {
        https.post(
            this.url,
            (resp) => {
                if (resp.statusCode === 200) {
                    console.log("Good 200 response");
                }
                else {
                    console.log("Warning: " + resp.statusCode + " response");
                }
                let data  = {
                    "response": resp.statusCode,
                    "latency": 43,
                    "url": this.url,
                    "curl": this.curlMethod
                };
                this.store(data);
            }
        ).on("error", (err) => {
                 console.log("Error: " + err.message);
             }
        );
    }

    /**
     * GET
     */
    get() {
        https.get(
            this.url,
            (resp) => {
                if (resp.statusCode === 200) {
                    console.log("Good 200 response");
                }
                else {
                    console.log("Warning: " + resp.statusCode + " response");
                }
                let data  = {
                    "response": resp.statusCode,
                    "latency": 43,
                    "url": this.url,
                    "curl": this.curlMethod
                };
                this.store(data);
            })
            .on("error", (err) => {
                    console.log("Error: " + err.message);
                }
            );
    }

    /**
     * Check
     */
    check(): void {
        if(this.curlMethod == "get") {
            this.get();
        }
        else if(this.curlMethod == "post") {
            this.post();
        }
    }
}
