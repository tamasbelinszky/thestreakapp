import { randomUUID } from "crypto";
import { Entity } from "electrodb";

import { Dynamo } from "./dynamo";

const Users = new Entity(
  // not used
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