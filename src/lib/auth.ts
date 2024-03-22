import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { type DefaultUser, type NextAuthOptions as NextAuthConfig, Session, User, getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/dist/server/api-utils";
import { Client } from "postmark";
// TODO: It should rely on process.env or @aws-sdk/client-ssm + env at build time
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import { z } from "zod";

const envSchema = z.object({
  POSTMARK_API_TOKEN: z.string(),
  POSTMARK_SIGN_IN_TEMPLATE: z.string(),
  SMTP_FROM: z.string().default("hello@thestreakapp.com"),
  NEXTAUTH_URL: z.string(),
});

const { SMTP_FROM, NEXTAUTH_URL } = envSchema.parse(process.env);

const postmarkClient = new Client(Config.POSTMARK_API_TOKEN);

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user?: DefaultUser & {
      id: string;
    };
  }
}

const awsConfig: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: Config.NEXT_AUTH_AWS_ACCESS_KEY,
    secretAccessKey: Config.NEXT_AUTH_AWS_SECRET_KEY as string,
  },
  region: Config.NEXT_AUTH_AWS_REGION,
};

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB(awsConfig), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export const nextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    GithubProvider({
      clientId: Config.GITHUB_ID,
      clientSecret: Config.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: Config.GOOGLE_CLIENT_ID as string,
      clientSecret: Config.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      from: SMTP_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        console.log("sendVerificationRequest", { identifier, url, provider });

        const result = await postmarkClient.sendEmailWithTemplate({
          TemplateId: parseInt(Config.POSTMARK_SIGN_IN_TEMPLATE),
          To: identifier,
          From: SMTP_FROM,
          TemplateModel: {
            action_url: url,
            product_name: "TheStreakApp",
          },
          Headers: [
            {
              // Set this to prevent Gmail from threading emails.
              // See https://stackoverflow.com/questions/23434110/force-emails-not-to-be-grouped-into-conversations/25435722.
              Name: "X-Entity-Ref-ID",
              Value: new Date().getTime() + "",
            },
          ],
        });
        console.log("sendEmailWithTemplate", result);

        if (result.ErrorCode) {
          throw new Error(result.Message);
        }
      },
    }),
  ],
  adapter: DynamoDBAdapter(dynamoDbClient, {
    tableName: Table.table.tableName,
    partitionKey: "pk",
    sortKey: "sk",
    indexName: "gsi1",
    indexPartitionKey: "gsi1pk",
    indexSortKey: "gsi1sk",
  }),
  secret: NEXTAUTH_URL,
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export function auth(
  ...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []
) {
  return getServerSession(...args, nextAuthConfig);
}
