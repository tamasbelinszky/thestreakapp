"use server";

import { Entity } from "electrodb";
import { z } from "zod";

import { auth } from "./auth";
import { Dynamo } from "./dynamo";

const preferencePeriods = ["daily", "weekly"] as const;

export type PreferencePeriod = (typeof preferencePeriods)[number];

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
            type: preferencePeriods,
            default: preferencePeriods[0],
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
          period: preferencePeriods[0],
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
  period: z.enum(preferencePeriods),
  hour: z.number().min(0).max(23), // 24-hour format for hour
  minute: z.number().min(0).max(59),
  enabled: z.boolean(),
});

const preferenceSchema = z.object({
  appNotifications: appNotificationPreferenceFormSchema,
  firstName: z.string(),
  lastName: z.string(),
  userId: z.string(),
});

type PreferenceInput = z.infer<typeof preferenceSchema>;

export type AppNotificationPreferencesFormInput = z.infer<typeof appNotificationPreferenceFormSchema>;

export const createPreference = async (input: PreferenceInput) => {
  const validatedInput = preferenceSchema.parse(input);

  return PreferencesEntity.create({
    userId: validatedInput.userId,
    appNotifications: {
      ...validatedInput.appNotifications,
      startDate: validatedInput.appNotifications.startDate.getTime(),
    },
  }).go();
};

export const createPreferenceServerAction = async (input: AppNotificationPreferencesFormInput) => {
  const validatedInput = appNotificationPreferenceFormSchema.parse(input);

  const maybeUser = await auth();
  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = maybeUser.user.id;

  return PreferencesEntity.put({
    userId,
    appNotifications: {
      ...validatedInput,
      startDate: validatedInput.startDate.getTime(),
    },
  }).go();
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

export const getNamePreference = async () => {
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
  };
};

export const updateNamePreference = async (firstName: string, lastName: string) => {
  const maybeUser = await auth();

  if (!maybeUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = maybeUser.user.id;

  return PreferencesEntity.patch({ userId }).set({ firstName, lastName }).go();
};
