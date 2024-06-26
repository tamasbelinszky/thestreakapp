"use server";

import { PERIODS } from "@/app/constants";
import { baseStreakSchema } from "@/schemas/streak";
import { randomUUID } from "crypto";
import { Entity } from "electrodb";
import { Config } from "sst/node/config";
import { z } from "zod";

import { auth } from "./auth";
import { Dynamo } from "./dynamo";
import { createOrUpdateStreakSchedule, deleteStreakSchedule } from "./scheduler";

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
        required: true,
      },
      period: {
        type: PERIODS,
        default: PERIODS[0],
        required: true,
      },
      startDate: {
        type: "number",
        required: true,
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
      autoComplete: {
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

export type StreakFormInput = z.infer<typeof baseStreakSchema>;

export const createStreak = async (input: StreakFormInput) => {
  const maybeUser = await auth();
  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }
  const {
    user: { id: userId },
  } = maybeUser;

  const validatedInput = baseStreakSchema.parse({
    ...input,
    isCompleted: false,
  });

  const result = await StreakEntity.put({
    ...validatedInput,
    startDate: validatedInput.startDate.getTime(),
    userId,
    streak: 0,
  }).go();

  if (Config.STAGE !== "production") {
    console.info("Successfully created streak. Stage is not production. Skipping createOrUpdateStreakSchedule.");
    return;
  }

  await createOrUpdateStreakSchedule({
    userId,
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
  await deleteStreakSchedule(id);
  return StreakEntity.delete({ id }).go();
};

export const completeStreakById = async (id: string) => {
  return StreakEntity.patch({ id }).add({ streak: 1 }).set({ isCompleted: true }).go();
};

export const editStreakById = async (id: string, input: StreakFormInput) => {
  const validatedInput = baseStreakSchema.parse(input);
  return StreakEntity.patch({ id })
    .set({
      ...validatedInput,
      startDate: validatedInput.startDate.getTime(),
    })
    .go();
};

export const evaluateStreak = async (streakId: string, isCompleted: boolean, autoComplete: boolean) => {
  if (!isCompleted) {
    if (autoComplete) {
      await StreakEntity.patch({ id: streakId }).add({ streak: 1 }).go();
    } else {
      await StreakEntity.patch({ id: streakId }).set({ streak: 0 }).go();
    }
  }

  await StreakEntity.patch({ id: streakId }).set({ isCompleted: false }).go();
};
