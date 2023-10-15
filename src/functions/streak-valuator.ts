import { sendStreakValuatorEmail } from "@/lib/ses";
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

  // TODO: transaction
  await evaluateStreak(streakId, streak.data.isCompleted, streak.data.autoComplete);
  await putStreakEvent({
    userId,
    streakId,
    isCompleted: streak.data.isCompleted,
    currentStreak: streak.data.streak,
    autoComplete: streak.data.autoComplete,
  });
  const user = await getUserById(userId);
  await sendStreakValuatorEmail(user.email, {
    streak: streak.data.streak,
    isCompleted: streak.data.isCompleted,
    autoComplete: streak.data.autoComplete,
    startDate: format(new Date(streak.data.startDate), "yyyy-MM-dd"),
    period: streak.data.period,
    description: streak.data.description,
    name: streak.data.name,
    id: streak.data.id,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Streak ${streakId} reset successfully.`,
    }),
  };
};
