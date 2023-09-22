import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import NextAuth, {
  type DefaultUser,
  type NextAuthOptions as NextAuthConfig,
  Session,
  User,
  getServerSession,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      id: string;
    };
  }
}

const awsConfig: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY as string,
  },
  region: process.env.NEXT_AUTH_AWS_REGION as string,
};

const client = DynamoDBDocument.from(new DynamoDB(awsConfig), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

const tableName = process.env.NEXT_PUBLIC_TABLE_NAME as string;

const config = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // ...add more providers here
  ],
  adapter: DynamoDBAdapter(client, {
    tableName: tableName,
    partitionKey: "pk",
    sortKey: "sk",
    indexName: "gsi1",
    indexPartitionKey: "gsi1pk",
    indexSortKey: "gsi1sk",
  }),
  secret: process.env.NEXT_AUTH_SECRET as string,
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
  return getServerSession(...args, config);
}

const handler = NextAuth(config);
export { handler as GET, handler as POST };