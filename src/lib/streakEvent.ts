"use server";

import { randomUUID } from "crypto";
import { Entity } from "electrodb";

import { Dynamo } from "./dynamo";

const StreakEventEntity = new Entity(
  {
    model: {
      entity: "streakEvent",
      version: "1",
      service: "core",
    },
    attributes: {
      id: {
        type: "string",
        uuid: true,
        default: () => randomUUID(),
        readOnly: true,
      },
      userId: {
        type: "string",
        required: true,
      },
      streakId: {
        type: "string",
        required: true,
      },
      note: {
        type: "string",
      },
      isCompleted: {
        type: "boolean",
        default: false,
        required: true,
      },
      autoComplete: {
        type: "boolean",
        default: false,
        required: true,
      },
      currentStreak: {
        type: "number",
        required: true,
      },
      createdAt: {
        type: "string",
        readOnly: true,
        default: () => new Date().toISOString(),
      },
      updatedAt: {
        type: "string",
        // watch for changes to any attribute
        watch: "*",
        // set current timestamp when updated
        set: () => new Date().toISOString(),
        readOnly: true,
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
      byUserId: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["userId"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
      byStreakId: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["streakId"],
        },
        sk: {
          field: "gsi2sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Service,
);

export const putStreakEvent = async (input: {
  userId: string;
  streakId: string;
  isCompleted: boolean;
  currentStreak: number;
  autoComplete: boolean;
}) => {
  const streakEvent = await StreakEventEntity.put(input).go();

  return streakEvent;
};
