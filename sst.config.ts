import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { SSTConfig } from "sst";
import { NextjsSite, Table } from "sst/constructs";

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
      const myTable = new Table(stack, "table", {
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
        cdk: {
          table: {
            // TODO: add back when deployed to prod
            // removalPolicy: app.stage !== "production" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
            removalPolicy: RemovalPolicy.DESTROY,
          },
        },
      });

      const site = new NextjsSite(stack, "site", {
        bind: [myTable],
        customDomain:
          app.stage === "production"
            ? {
                isExternalDomain: true,
                domainName: "thestreakapp.com",
                cdk: {
                  certificate: Certificate.fromCertificateArn(
                    stack,
                    "MyCert",
                    "arn:aws:acm:us-east-1:576858965190:certificate/58a4c1c8-d307-41a3-9023-427bf34ef257",
                  ),
                },
              }
            : undefined,
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
