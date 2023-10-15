import { PERIODS } from "@/app/constants";
import { z } from "zod";

export const baseStreakSchema = z.object({
  name: z.string().max(128, {
    message: "Name must not be longer than 128 characters.",
  }),
  description: z.string().min(6, { message: "Description must be at least 6 characters long." }).max(512, {
    message: "Description must not be longer than 512 characters.",
  }),
  startDate: z.date({
    required_error: "A start date is required to count the streak.",
  }),
  period: z.enum(PERIODS),
  autoComplete: z.boolean(),
});

export const fullStreakSchema = baseStreakSchema.extend({
  isCompleted: z.boolean(),
  streak: z.number().optional(),
});

export const editableStreakSchema = baseStreakSchema.extend({
  isCompleted: z.boolean(),
});
