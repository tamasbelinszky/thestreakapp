import DynamoDB from "aws-sdk/clients/dynamodb";

export * as Dynamo from "./dynamo";

export const Client = new DynamoDB.DocumentClient();
export const Service = {
  client: Client,
  table: process.env.NEXT_PUBLIC_TABLE_NAME as string,
};
