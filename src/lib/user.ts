import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const userSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const getUserById = async (userId: string) => {
  const command = new GetItemCommand({
    TableName: process.env.NEXT_PUBLIC_TABLE_NAME,
    Key: {
      pk: {
        S: `USER#${userId}`, // Given your structure, the partition key is the same for user information
      },
      sk: {
        S: `USER#${userId}`, // Given your structure, the sort key is the same for user information
      },
    },
  });

  const response = await docClient.send(command);

  if (!response.Item) {
    throw new Error("User not found");
  }

  const name = response.Item.name.S;
  const email = response.Item.email.S;

  return userSchema.parse({
    name,
    email,
  });
};
