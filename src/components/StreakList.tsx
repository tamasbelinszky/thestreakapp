import { auth } from "@/lib/auth";
import { getStreaksByUserId } from "@/lib/streak";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { StreakCard } from "./StreakCard";

const streakSchema = z.object({
  id: z.string(),
  actionType: z.string(),
  description: z.string(),
  startDate: z.number(),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  streak: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().optional(),
  validationType: z.string().optional(),
});

const streaksSchema = z.array(streakSchema);

async function getData() {
  const maybeUser = await auth();
  const userId = maybeUser?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const res = await getStreaksByUserId(userId);

  return streaksSchema.parse(res.data);
}

export default async function StreakList() {
  const streaks = await getData();

  return (
    <div className="flex w-full flex-col gap-2">
      {streaks.map((streak, index) => (
        <StreakCard
          id={streak.id}
          key={index}
          description={streak.description}
          startDate={new Date(streak.startDate)}
          period={streak.period}
          streak={streak.streak}
        />
      ))}
    </div>
  );
}
