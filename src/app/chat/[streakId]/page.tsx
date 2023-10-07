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
      content: `Context: Discussing progress on goal named "${data?.name}".
      period: ${data?.period}
      username: ${username}
      current streak: ${data?.streak}
      Is already completed for the given period: ${data?.isCompleted}
      Is on autoComplete: ${data?.autoComplete} (if true, the streak will be automatically completed when the period ends)
      `,
      role: "system",
    },
    {
      id: "2",
      content: `Hi ${username?.substring(username.indexOf(" "))}, how can I help you?`,
      role: "assistant",
    },
  ];
  return <Chat initialMessages={initialChatMessages} />;
}
