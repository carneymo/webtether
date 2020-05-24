import { Client, ApiResponse, RequestParams } from "@elastic/elasticsearch";

/**
 * ElasticSearch
 */
export class ElasticSearch {

    public client: Client;

    /**
     * Constructor
     */
    constructor() {
        this.client = new Client({node: 'http://localhost:9200'});
    }

    public index(index: string, data: object) {
        let doc: RequestParams.Index = {
            index: index,
            body: data
        }
        return this.client.index(doc);
    }

    /**
     * Basic Search
     */
    async basicSearch() {
        const { body } = await this.client.search({
            index: 'redis',
            body: {
                query: {
                    match: {
                        role: 'master'
                    }
                }
            }
                                                  });
        console.log(body.hits.hits);
    }

    async getClientConfig(clientid: string) {
        const { body } = await this.client.search({
                                                      index: 'configs',
                                                      body: {
                                                          query: {
                                                              match: {
                                                                  "client_id": clientid
                                                              }
                                                          }
                                                      }
                                                  });
        return body.hits.hits;
    }

}
