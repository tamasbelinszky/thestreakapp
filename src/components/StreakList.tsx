import { auth } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { StreakCard } from "./StreakCard";

const streakSchema = z.object({
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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/streak?userId=${userId}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch streaks");
  }

  const json = await res.json();
  return streaksSchema.parse(json.data);
}

export default async function StreakList() {
  const streaks = await getData();

  return (
    <div className="flex w-full flex-col gap-2">
      {streaks.map((streak, index) => (
        <StreakCard
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
