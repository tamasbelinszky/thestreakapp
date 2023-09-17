import { randomUUID } from "crypto";
import { CreateEntityItem, Entity } from "electrodb";
import { Dynamo } from "./dynamo";

const validationTypes = ["manual"] as const;
const streakPeriods = ["daily", "weekly", "monthly", "yearly"] as const;

const StreakEntity = new Entity(
  {
    model: {
      entity: "streak",
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
      name: {
        type: "string",
        required: true,
      },
      description: {
        type: "string",
        required: true,
      },
      period: {
        type: streakPeriods,
        default: streakPeriods[0],
        required: true,
      },
      startDate: {
        type: "number",
        default: () => new Date().getTime(),
      },
      validationType: {
        type: validationTypes,
        default: validationTypes[0],
        required: true,
      },
      streak: {
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
          composite: ["userId", "createdAt"],
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
      // You can add more indexes if needed
    },
  },
  Dynamo.Service,
);

type CreateStreakInput = CreateEntityItem<typeof StreakEntity>;

export const createStreak = async (
  input: CreateEntityItem<typeof StreakEntity>,
) => {
  return StreakEntity.put(input).go();
};

export const getStreaksByUserId = async (userId: string) => {
  return StreakEntity.query.byUserId({ userId }).go();
};
