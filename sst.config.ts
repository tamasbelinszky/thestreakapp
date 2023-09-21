import { SSTConfig } from "sst";
import { Api, NextjsSite, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "thestreak",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // Create the table
      const table = new Table(stack, "table", {
        fields: {
          pk: "string",
          sk: "string",
          gsi1pk: "string",
          gsi1sk: "string",
          gsi2pk: "string",
          gsi2sk: "string",
        },
        primaryIndex: {
          partitionKey: "pk",
          sortKey: "sk",
        },
        globalIndexes: {
          gsi1: {
            partitionKey: "gsi1pk",
            sortKey: "gsi1sk",
          },
          gsi2: {
            partitionKey: "gsi2pk",
            sortKey: "gsi2sk",
          },
        },
        timeToLiveAttribute: "expires",
      });

      // Create the HTTP API
      const api = new Api(stack, "Api", {
        defaults: {
          function: {
            // Bind the table name to our API
            bind: [table],
          },
        },
        routes: {
          "POST /streak": "lambdas/createStreak.handler",
        },
      });
      const site = new NextjsSite(stack, "site", {
        bind: [api, table],
        environment: {
          NEXT_PUBLIC_API_URL: api.url,
          NEXT_PUBLIC_TABLE_NAME: table.tableName,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
