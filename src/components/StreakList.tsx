import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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

export default function StreakList() {
  const { data: sessionData } = useSession();
  const [streaks, setStreaks] = useState<Streaks>([]);

  useEffect(() => {
    const userId = sessionData?.user?.id;
    if (userId) {
      listStreaks(userId).then((data) => setStreaks(data));
    }
  }, [sessionData]);

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

async function listStreaks(userId: string): Promise<Streaks> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/streak?userId=${userId}`,
  );
  const json = await res.json();
  return streaksSchema.parse(json.data);
}
