"use server";

import { randomUUID } from "crypto";
import { Entity } from "electrodb";

import { auth } from "./auth";
import { Dynamo } from "./dynamo";

// eslint-disable-next-line no-unused-vars
const Users = new Entity(
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
      },
      emailVerified: {
        type: "boolean",
        nullify: true,
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
      byAccount: {
        pk: {
          field: "pk",
          composite: ["id"],
          template: "USER#${id}",
          casing: "none",
        },
        sk: {
          field: "sk",
          composite: ["id"],
          template: "USER#${id}",
          casing: "none",
        },
      },
      emailIndex: {
        index: "gsi1",
        pk: { field: "GSI1PK", composite: [] },
        sk: { field: "GSI1SK", composite: [] },
      },
    },
  },
  Dynamo.Service,
);

export const getUserById = async (id: string) => {
  const user = await Users.get({ id }).go();
  return user;
};

export const updateUserName = async (name: string) => {
  const data = await auth();
  if (!data?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (name.length < 3) {
    throw new Error("Name must be at least 3 characters long");
  }
  return Users.update({ id: data.user.id }).set({ name }).go();
};
