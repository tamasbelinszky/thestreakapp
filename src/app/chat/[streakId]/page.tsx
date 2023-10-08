import { Chat } from "@/components/chat/Chat";
import { auth } from "@/lib/auth";
import { composeChatId, getLangChainMessages } from "@/lib/langchain";
import { getStreakById } from "@/lib/streak";
import { Message } from "ai/react";

export default async function Page({ params }: { params: { streakId: string } }) {
  const { data } = await getStreakById(params.streakId);
  const res = await getLangChainMessages({
    chatId: composeChatId({ streakId: params.streakId }),
  });

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
      content: `Hi ${username?.substring(username.indexOf(" "))}, how can I help you?`,
      role: "assistant",
    },
    ...res
      .map((e, index) => {
        const content = e?.lc_kwargs?.content;

        const isUserMessage = e?.lc_id.find((e) => e === "HumanMessage");

        if (!content) {
          console.log("no content: ", JSON.stringify(e, null, 2));
          return null;
        }

        return {
          id: `${index + 2}`,
          content,
          role: isUserMessage ? "user" : "assistant",
        };
      })
      .filter((message): message is Message => Boolean(message)),
  ];

  return <Chat initialMessages={initialChatMessages} streakId={params.streakId} />;
}
