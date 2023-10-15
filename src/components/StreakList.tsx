import { PERIODS } from "@/app/constants";
import { auth } from "@/lib/auth";
import { getStreaksByUserId } from "@/lib/streak";
import { z } from "zod";

import { StreakCard } from "./StreakCard";

const streakSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.number(),
  period: z.enum(PERIODS),
  streak: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().optional(),
  validationType: z.string().optional(),
  isCompleted: z.boolean(),
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
      {streaks
        .sort((a, b) => (a.createdAt! > b.createdAt! ? -1 : 1))
        .map((streak, index) => (
          <StreakCard
            id={streak.id}
            key={index}
            name={streak.name}
            description={streak.description || ""}
            startDate={new Date(streak.startDate)}
            period={streak.period}
            streak={streak.streak}
            isCompleted={streak.isCompleted}
          />
        ))}
    </div>
  );
}
