"use server";

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { randomUUID } from "crypto";
import { Entity } from "electrodb";
import { z } from "zod";
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
      // You can add more indexes if needed
    },
  },
  Dynamo.Service,
);

const streakFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  description: z
    .string({
      required_error: "Please select a language.",
    })
    .max(256, {
      message: "Description must not be longer than 256 characters.",
    }),
  startDate: z.date({
    required_error: "A start date is required to count the streak.",
  }),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
});

export type StreakFormInput = z.infer<typeof streakFormSchema>;

export const createStreak = async (input: StreakFormInput) => {
  const maybeUser = await auth();
  const maybeUserId = maybeUser?.user?.id;
  if (!maybeUserId) {
    throw new Error("Unauthorized");
  }

  const validatedInput = streakFormSchema.parse(input);
  return StreakEntity.put({
    ...validatedInput,
    startDate: validatedInput.startDate.getTime(),
    userId: maybeUserId,
    streak: 0,
  }).go();
};

export const getStreaksByUserId = async (userId: string) => {
  return StreakEntity.query.byUserId({ userId }).go();
};

export const deleteStreakById = async (id: string) => {
  return StreakEntity.delete({ id }).go();
};
