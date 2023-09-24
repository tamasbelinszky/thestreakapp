import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import dotenv from "dotenv";
import { SSTConfig } from "sst";
import { Config, NextjsSite, Table } from "sst/constructs";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_GTM_CONTAINER_ID: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string(),
  NEXT_AUTH_AWS_ACCESS_KEY: z.string(),
});

export default {
  config(_input) {
    return {
      name: "thestreak",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const env = envSchema.parse(process.env);
      if (app.stage !== "production") {
        app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
      }

      const secretParams = Config.Secret.create(
        stack,
        "NEXT_AUTH_AWS_ACCESS_KEY",
        "NEXT_AUTH_AWS_SECRET_KEY",
        "NEXT_AUTH_AWS_REGION",
        "NEXT_AUTH_SECRET",
        "GITHUB_ID",
        "GITHUB_SECRET",
      );

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
      });

      const site = new NextjsSite(stack, "site", {
        bind: [myTable, ...Object.values(secretParams)],
        environment: {
          // Sst config uses top level await, next js server actions currently does not support this ( same for middleware).
          // This is why we need to pass NEXT_PUBLIC_TABLE_NAME to the db client as an env variable.
          NEXT_PUBLIC_TABLE_NAME: myTable.tableName,
          ...env,
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
