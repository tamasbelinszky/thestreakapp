"use server";

import { PERIODS, TIMEZONES } from "@/app/constants";
import { Entity } from "electrodb";
import { z } from "zod";

import { auth } from "./auth";
import { Dynamo } from "./dynamo";

const PreferencesEntity = new Entity(
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
      email: {
        type: "string",
        required: true,
      },
      timezone: {
        type: TIMEZONES,
        required: true,
        default: "Europe/Budapest",
      },
      firstName: {
        type: "string",
        required: true,
        default: "",
      },
      lastName: {
        type: "string",
        required: true,
        default: "",
      },
      appNotifications: {
        type: "map",
        properties: {
          enabled: {
            type: "boolean",
            required: true,
            default: true,
          },
          startDate: {
            type: "number",
            required: true,
            default: () => new Date().getTime(),
          },
          period: {
            type: PERIODS,
            default: PERIODS[0],
            required: true,
          },
          hour: {
            type: "number",
            required: true,
          },
          minute: {
            type: "number",
            required: true,
          },
        },
        required: true,
        default: {
          enabled: true,
          startDate: () => new Date().getTime(),
          period: PERIODS[0],
          hour: 0,
          minute: 0,
        },
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

const appNotificationPreferenceFormSchema = z.object({
  startDate: z.date({
    required_error: "A start date is required for the preference.",
  }),
  period: z.enum(PERIODS),
  hour: z.number().min(0).max(23), // 24-hour format for hour
  minute: z.number().min(0).max(59),
  enabled: z.boolean(),
});

export type AppNotificationPreferencesFormInput = z.infer<typeof appNotificationPreferenceFormSchema>;

export const createPreferenceServerAction = async (input: AppNotificationPreferencesFormInput) => {
  const validatedInput = appNotificationPreferenceFormSchema.parse(input);

  const maybeUser = await auth();
  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = maybeUser.user.id;

  return PreferencesEntity.patch({
    userId,
  })
    .set({
      appNotifications: {
        ...validatedInput,

        startDate: validatedInput.startDate.getTime(),
      },
    })
    .go();
};

export const getPreferenceById = async (userId: string) => {
  return PreferencesEntity.get({ userId }).go();
};

export const deletePreferenceById = async (userId: string) => {
  return PreferencesEntity.delete({ userId }).go();
};

export const editPreferenceById = async (userId: string, input: AppNotificationPreferencesFormInput) => {
  const validatedInput = appNotificationPreferenceFormSchema.parse(input);
  return PreferencesEntity.patch({ userId })
    .set({
      appNotifications: {
        ...validatedInput,
        startDate: validatedInput.startDate.getTime(),
      },
    })
    .go();
};

export const getAppNotificationPreferences = async () => {
  const maybeUser = await auth();

  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = maybeUser.user.id;

  const preferences = await PreferencesEntity.get({ userId })
    .go()
    .catch((err) => {
      if (err.name === "ItemNotFoundException") {
        return null;
      }

      throw err;
    });

  if (!preferences?.data?.appNotifications) {
    return null;
  }

  return preferences.data?.appNotifications;
};

export const getProfile = async () => {
  const maybeUser = await auth();

  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = maybeUser.user.id;

  const preferences = await PreferencesEntity.get({ userId }).go();

  if (!preferences?.data) {
    throw new Error("Preferences not found");
  }

  return {
    firstName: preferences.data.firstName,
    lastName: preferences.data.lastName,
    timezone: preferences.data.timezone,
  };
};

export const updateProfile = async (firstName: string, lastName: string, timezone: (typeof TIMEZONES)[number]) => {
  const maybeUser = await auth();

  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = maybeUser.user.id;

  return PreferencesEntity.patch({ userId }).set({ firstName, lastName, timezone }).go();
};
