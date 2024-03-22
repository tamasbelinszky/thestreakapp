import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { Entity } from "electrodb";
import { z } from "zod";

import { Dynamo } from "./dynamo";

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
        S: `USER#${userId}`,
      },
      sk: {
        S: `USER#${userId}`,
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

const _UserEntity = new Entity(
  // TODO: Define VerificationToken entity
  {
    model: {
      entity: "user",
      service: "",
      version: "1",
    },
    attributes: {
      id: {
        type: "string",
        default: () => randomUUID(),
      },
      name: {
        type: "string",
      },
      email: {
        type: "string",
        required: true,
      },
      emailVerified: {
        type: "boolean",
        default: false,
      },
      image: {
        type: "string",
      },
      type: {
        type: "string",
      },
      provider: {
        type: "string",
      },
      providerAccountId: {
        type: "string",
      },
    },

    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["id"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      byEmail: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["email"],
          template: "USER#${email}",
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Service,
);
