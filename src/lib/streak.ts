"use server";

import { randomUUID } from "crypto";
import { Entity } from "electrodb";
import { z } from "zod";

import { auth } from "./auth";
import { Dynamo } from "./dynamo";
import { createOrUpdateStreakSchedule, deleteStreakSchedule } from "./scheduler";

const streakPeriods = ["daily", "weekly"] as const;

export type StreakPeriod = (typeof streakPeriods)[number];

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
        default: "",
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
      streak: {
        type: "number",
        required: true,
      },
      isCompleted: {
        type: "boolean",
        default: false,
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
    },
  },
  Dynamo.Service,
);

const streakFormSchema = z.object({
  name: z.string().max(128, { message: "Name must not be longer than 128 characters." }),
  description: z
    .string()
    .max(256, {
      message: "Description must not be longer than 256 characters.",
    })
    .optional(),
  startDate: z.date({
    required_error: "A start date is required to count the streak.",
  }),
  period: z.enum(["daily", "weekly"]),
  isCompleted: z.boolean(),
  streak: z.number().optional(),
});

export type StreakFormInput = z.infer<typeof streakFormSchema>;

export const createStreak = async (input: StreakFormInput) => {
  const maybeUser = await auth();
  const maybeUserId = maybeUser?.user?.id;
  if (!maybeUserId) {
    throw new Error("Unauthorized");
  }

  const validatedInput = streakFormSchema.parse({
    ...input,
    isCompleted: false,
  });

  const result = await StreakEntity.put({
    ...validatedInput,
    startDate: validatedInput.startDate.getTime(),
    userId: maybeUserId,
    streak: 0,
  }).go();

  await createOrUpdateStreakSchedule({
    userId: maybeUserId,
    streakId: result.data.id,
    streakPeriod: validatedInput.period,
    startTime: validatedInput.startDate.getTime(),
  });
};

export const getStreakById = async (id: string) => {
  return StreakEntity.get({ id }).go();
};

export const getStreaksByUserId = async (userId: string) => {
  return StreakEntity.query.byUserId({ userId }).go();
};

export const deleteStreakById = async (id: string) => {
  // TODO: transaction
  await deleteStreakSchedule(id);
  return StreakEntity.delete({ id }).go();
};

export const completeStreakById = async (id: string) => {
  return StreakEntity.patch({ id }).add({ streak: 1 }).set({ isCompleted: true }).go();
};

export const editStreakById = async (id: string, input: StreakFormInput) => {
  const validatedInput = streakFormSchema.parse(input);
  return StreakEntity.patch({ id })
    .set({
      ...validatedInput,
      startDate: validatedInput.startDate.getTime(),
    })
    .go();
};

export const evaluateStreak = async (streakId: string, isCompleted: boolean) => {
  if (!isCompleted) {
    await StreakEntity.patch({ id: streakId }).set({ streak: 0 }).go();
  }

  await StreakEntity.patch({ id: streakId }).set({ isCompleted: false }).go();
};
