"use server";

import { TIMEZONES } from "@/app/constants";
import { basePreferenceSchema } from "@/schemas/preference";
import { Entity } from "electrodb";
import { z } from "zod";

import { auth } from "./auth";
import { Dynamo } from "./dynamo";

const PreferenceEntity = new Entity(
  // TODO: respect the user's preferences
  {
    model: {
      entity: "preference",
      version: "1",
      service: "core",
    },
    attributes: {
      userId: {
        type: "string",
        required: true,
      },
      timezone: {
        type: TIMEZONES,
        required: true,
        default: "Europe/Budapest",
      },
      acceptsStreakNotifications: {
        type: "boolean",
        required: true,
        default: true,
      },
      acceptsAppNotifications: {
        type: "boolean",
        required: true,
        default: true,
      },
      createdAt: {
        type: "string",
        readOnly: true,
        default: () => new Date().toISOString(),
      },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["userId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Service,
);

export const getPreference = async () => {
  const maybeUser = await auth();
  if (!maybeUser?.user?.id) {
    throw new Error("User not found");
  }

  const userId = maybeUser.user.id;

  const preference = await PreferenceEntity.get({
    userId,
  }).go();

  return preference;
};

export const putPreference = async (input: Omit<z.infer<typeof basePreferenceSchema>, "userId">) => {
  const maybeUser = await auth();
  if (!maybeUser?.user?.id) {
    throw new Error("User not found");
  }

  const userId = maybeUser.user.id;

  const preference = await PreferenceEntity.put({
    userId,
    ...input,
  }).go();

  return preference;
};
