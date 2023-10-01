import { evaluateStreak, getStreakById } from "@/lib/streak";
import { putStreakEvent } from "@/lib/streakEvent";
import { type Handler } from "aws-lambda";
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
  await evaluateStreak(streakId, streak.data.isCompleted);
  await putStreakEvent({
    userId,
    streakId,
    isCompleted: streak.data.isCompleted,
    currentStreak: streak.data.streak,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Streak ${streakId} reset successfully.`,
    }),
  };
};
