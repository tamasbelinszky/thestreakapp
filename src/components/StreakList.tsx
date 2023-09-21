import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getStreaksByUserId } from "@/lib/streak";
import { z } from "zod";
import { StreakCard } from "./StreakCard";

const streakSchema = z.object({
  id: z.string(),
  name: z.string(),
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

type Streaks = z.infer<typeof streaksSchema>;

async function getData() {
  const maybeUser = await auth();

  const userId = maybeUser?.user?.id;

  if (!userId) {
    throw new Error("User ID not found");
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
          name={streak.name}
          description={streak.description}
          startDate={new Date(streak.startDate)}
          period={streak.period}
          streak={streak.streak}
        />
      ))}
    </div>
  );
}
