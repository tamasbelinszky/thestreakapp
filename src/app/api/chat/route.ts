import { chainz } from "@/lib/langchain";
import { LangChainStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: {
      content: string;
      role: "user" | "system" | "assistant";
    }[];
  };

  const lastMessage = messages[messages.length - 1].content;
  const systemMessage = messages.find((m) => m.role === "system")?.content;

  const { stream, handlers, writer: _ } = LangChainStream();

  const chain = chainz({
    uniqueChatSessionId: "etwzz",
  });

  const input = lastMessage.concat(systemMessage ?? "");
  console.debug({
    input: JSON.stringify(input, null, 2),
  });

  await chain.stream(
    {
      input,
    },
    {
      callbacks: [handlers],
    },
  );

  return new StreamingTextResponse(stream);
}
