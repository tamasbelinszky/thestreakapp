import * as DynamoDBClient from "@aws-sdk/client-dynamodb";

export * as Dynamo from "./dynamo";

export const Client = new DynamoDBClient.DynamoDBClient();
export const Service = {
  client: Client,
  table: process.env.NEXT_PUBLIC_TABLE_NAME as string,
};
