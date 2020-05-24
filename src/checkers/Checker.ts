import {ElasticSearch} from "../utils/elasticsearch";

export abstract class Checker {

    protected index: string = "";
    protected clientId: string = "";
    protected es: ElasticSearch;

    /**
     * Constructor
     */
    protected constructor() {
        this.es = new ElasticSearch();
    }

    /**
     * Check
     */
    public check(): void {}

    /**
     * Store
     * @param data
     */
    public store(data: any): boolean {
        try {
            if (this.index === "") {
                throw new Error("Index not set.");
            }
            data = this.appendMetadata(data);
            this.es.index(this.index, data)
                .then((message) => {
                    return true;
                }).catch((err) => {
                    throw new Error("Error: " + err);
                });
        }
        catch(err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Append Metadata
     * @param data
     */
    protected appendMetadata(data: any): any {
        data.clientId = this.clientId;
        data.query_date = new Date().getSeconds();
        return data;
    }

}
