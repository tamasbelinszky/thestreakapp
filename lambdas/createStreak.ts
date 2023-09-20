import { createStreak } from "@/lib/streak";
import { ApiHandler } from "sst/node/api";
import { z } from "zod";

const streakInputSchema = z.object({
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
      required_error:
        "Please add a description which can remind you why you started this streak.",
    })
    .max(256, {
      message: "Description must not be longer than 256 characters.",
    }),
  startDate: z.string(),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  userId: z.string().min(5),
});

export const handler = ApiHandler(async (event) => {
  const input = streakInputSchema.parse(JSON.parse(event.body));

  if (!input.userId) {
    return {
      statusCode: 401,
      body: "Unauthorized",
    };
  }

  await createStreak({
    description: input.description,
    name: input.name,
    period: input.period,
    startDate: new Date(input.startDate).getTime(),
    streak: 0,
    userId: input.userId,
  });

  return {
    statusCode: 200,
  };
});
