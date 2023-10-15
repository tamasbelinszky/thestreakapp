import { TIMEZONES } from "@/app/constants";
import { z } from "zod";

export const basePreferenceSchema = z.object({
  userId: z.string(),
  timezone: z.enum(TIMEZONES),
  acceptsStreakNotifications: z.boolean(),
  acceptsAppNotifications: z.boolean(),
});
