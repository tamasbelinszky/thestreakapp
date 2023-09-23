import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import dotenv from "dotenv";
import { SSTConfig } from "sst";
import { Config, NextjsSite, Table } from "sst/constructs";

dotenv.config();

export default {
  config(_input) {
    return {
      name: "thestreak",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const randomEnv = process.env.NEXTAUTH_URL;
      if (!randomEnv) throw new Error("NEXTAUTH_URL is not set");
      const config = Config.Secret.create(
        stack,
        "NEXT_AUTH_AWS_ACCESS_KEY",
        "NEXT_AUTH_AWS_SECRET_KEY",
        "NEXT_AUTH_AWS_REGION",
        "NEXT_AUTH_SECRET",
        "NEXTAUTH_URL",
        "GITHUB_ID",
        "GITHUB_SECRET",
      );

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
        environment: {
          // Sst config uses top level await, next js server actions currently does not support this ( same for middleware).
          NEXT_PUBLIC_TABLE_NAME: myTable.tableName,
          NEXT_PUBLIC_TABLE_ARN: myTable.tableArn,
          NEXT_AUTH_AWS_ACCESS_KEY: process.env.NEXT_AUTH_AWS_ACCESS_KEY as string,
          NEXT_AUTH_AWS_SECRET_KEY: process.env.NEXT_AUTH_AWS_SECRET_KEY as string,
          NEXT_AUTH_AWS_REGION: process.env.NEXT_AUTH_AWS_REGION as string,
          NEXT_AUTH_SECRET: process.env.NEXT_AUTH_SECRET as string,
          NEXTAUTH_URL: app.stage === "production" ? "https://thestreakapp.com" : "http://localhost:3000",
          GITHUB_ID: app.stage === "production" ? process.env.PROD_GITHUB_ID! : process.env.GITHUB_ID!,
          GITHUB_SECRET: app.stage === "production" ? process.env.PROD_GITHUB_SECRET! : process.env.GITHUB_SECRET!,
        },
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
        tableName: myTable.tableName,
        tableArn: myTable.tableArn,
      });
    });
  },
} satisfies SSTConfig;
