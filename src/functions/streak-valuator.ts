import { getPreferenceByUserId } from "@/lib/preferences";
import { sendStreakNotification } from "@/lib/sendgrid";
import { evaluateStreak, getStreakById } from "@/lib/streak";
import { putStreakEvent } from "@/lib/streakEvent";
import { getUserById } from "@/lib/user";
import { type Handler } from "aws-lambda";
import { format } from "date-fns";
import { z } from "zod";

const eventSchema = z.object({
  userId: z.string(),
  streakId: z.string(),
});

type Event = z.infer<typeof eventSchema>;

export const handler: Handler<Event> = async (event) => {
  const { streakId, userId } = eventSchema.parse(event);

  const streak = await getStreakById(streakId);

  if (!streak.data) {
    throw new Error("Streak not found");
  }

  await evaluateStreak(streakId, streak.data.isCompleted, streak.data.autoComplete);
  await putStreakEvent({
    userId,
    streakId,
    isCompleted: streak.data.isCompleted,
    currentStreak: streak.data.streak,
    autoComplete: streak.data.autoComplete,
  });

  const user = await getUserById(userId);
  const preference = await getPreferenceByUserId(userId);

  if (!preference.data?.acceptsStreakNotifications) {
    console.info(`User ${userId} has disabled streak notifications. Skip sending streak notification.`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Streak ${streakId} reset successfully.`,
      }),
    };
  }

  await sendStreakNotification({
    to: user.email,
    dynamicTemplateData: {
      autoComplete: streak.data.autoComplete,
      description: streak.data.description,
      id: streak.data.id,
      isCompleted: streak.data.isCompleted,
      name: streak.data.name,
      period: streak.data.period,
      startDate: format(new Date(streak.data.startDate), "yyyy-MM-dd"),
      streak: streak.data.streak,
      createdAt: format(new Date(streak.data.createdAt!), "yyyy-MM-dd"),
      updatedAt: format(new Date(streak.data.updatedAt!), "yyyy-MM-dd"),
    },
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Streak ${streakId} reset successfully.`,
    }),
  };
};
