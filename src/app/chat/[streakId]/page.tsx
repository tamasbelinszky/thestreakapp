import { Chat } from "@/components/chat/Chat";
import { auth } from "@/lib/auth";
import { getStreakById } from "@/lib/streak";
import { Message } from "ai/react";

export default async function Page({ params }: { params: { streakId: string } }) {
  const { data } = await getStreakById(params.streakId);
  const maybeUser = await auth();

  if (!maybeUser?.user) {
    return null;
  }

  const username = maybeUser.user.name;

  if (!data) {
    return <div>loading...</div>;
  }

  const initialChatMessages: Message[] = [
    {
      id: "1",
      content: `Context: Discussing progress on goal named "${data?.name}". Check if user provided a description and acknowledge their streak.`,
      role: "system",
    },
    {
      id: "2",
      content:
        `${
          data?.description
            ? `Welcome back ${username}! I see you set the goal "${data.name}" with the intention of "${data?.description}". `
            : `Hello again ${username}! You've embarked on the goal "${data.name}". Even without a specific reason, I admire your dedication. `
        }` +
        `${
          data?.streak === 0
            ? `It's a ${
                data?.period === "daily" ? "day-to-day" : "weekly"
              } challenge. Remember, every journey starts with that first step. I'm here to support you every step of the way! `
            : `Impressive! You've been consistent with your ${
                data?.period === "daily" ? "daily" : "weekly"
              } goal, achieving a streak of ${data?.streak} ${data?.period}s in a row. Keep up the fantastic work! `
        }` +
        `Your consistency is truly inspiring. How do you feel about your progress so far? If you need any insights or strategies to keep going strong, just let me know. I'm here to help!`,
      role: "assistant",
    },
  ];
  return <Chat initialMessages={initialChatMessages} />;
}
