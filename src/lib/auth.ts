import { getBaseUrl } from "@/getBaseUrl";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { type DefaultUser, type NextAuthOptions as NextAuthConfig, Session, User, getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";

declare module "next-auth" {
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
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: Config.GITHUB_ID,
      clientSecret: Config.GITHUB_SECRET,
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
  secret: Config.NEXT_AUTH_SECRET,
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect: async (_) => getBaseUrl(),
  },
} satisfies NextAuthConfig;

export function auth(
  ...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []
) {
  return getServerSession(...args, nextAuthConfig);
}
