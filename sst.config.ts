import * as cdk from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import dotenv from "dotenv";
import { SSTConfig } from "sst";
import { Config, Function, NextjsSite, Table } from "sst/constructs";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_GTM_CONTAINER_ID: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string(),
  NEXT_AUTH_AWS_ACCESS_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  MAILCHIMP_API_KEY: z.string(),
  MAILCHIMP_SERVER_PREFIX: z.string().default("us12"),
  MAILCHIMP_LIST_ID: z.string().default("23a56060ac"),
  SENDGRID_API_KEY: z.string(),
  SMTP_FROM: z.string().default("hello@thestreakapp.com"),
  POSTMARK_SIGN_IN_TEMPLATE: z.string().default("35308973"),
  POSTMARK_API_TOKEN: z.string(),
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
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "MAILCHIMP_API_KEY",
        "MAILCHIMP_SERVER_PREFIX",
        "MAILCHIMP_LIST_ID",
        "SENDGRID_API_KEY",
        "POSTMARK_API_TOKEN",
        "POSTMARK_SIGN_IN_TEMPLATE",
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

      const streakValuatorFunction = new Function(stack, `streakValuatorFunction-${app.stage}`, {
        handler: "src/functions/streak-valuator.handler",
        bind: [myTable, ...Object.values(secretParams)],
        functionName: `streakValuatorFunction-${app.stage}`,
        environment: {
          NEXT_PUBLIC_TABLE_NAME: myTable.tableName,
          ...env,
        },
      });

      const streakValuatorFunctionRole = new Role(stack, `streakValuatorFunctionRole-${app.stage}`, {
        assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
        inlinePolicies: {
          lambdaExecute: new PolicyDocument({
            statements: [
              new PolicyStatement({
                actions: ["lambda:InvokeFunction"],
                resources: ["*"],
              }),
            ],
          }),
        },
        roleName: `streakValuatorFunctionRole-${app.stage}`,
      });

      const site = new NextjsSite(stack, "site", {
        bind: [myTable, ...Object.values(secretParams)],
        timeout: 30,
        environment: {
          // Sst config uses top level await, next js server actions currently does not support this ( same for middleware).
          // This is why we need to pass the env variables to the site construct.
          NEXT_PUBLIC_TABLE_NAME: myTable.tableName,
          STREAK_VALUATOR_FUNCTION_ARN: streakValuatorFunction.functionArn,
          STREAK_VALUATOR_FUNCTION_ROLE_ARN: streakValuatorFunctionRole.roleArn,
          ...env,
        },
        experimental: {
          streaming: true,
        },
        permissions: ["scheduler:*", "iam:PassRole"],
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

      if (app.stage === "production") {
        stack.getAllFunctions().forEach((fn) => cdk.Tags.of(fn).add("lumigo:auto-trace", "true"));
      }

      stack.addOutputs({
        SiteUrl: site.url,
        tableName: myTable.tableName,
        tableArn: myTable.tableArn,
        streakValuatorFunctionArn: streakValuatorFunction.functionArn,
        streakValuatorFunctionRoleArn: streakValuatorFunctionRole.roleArn,
      });
    });
  },
} satisfies SSTConfig;
