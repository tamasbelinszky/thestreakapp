import { chainz } from "@/lib/langchain";
import { LangChainStream, StreamingTextResponse } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const body = await req.json();

  const inputSchema = z.object({
    streakId: z.string(),
    username: z.string(),
    messages: z.array(
      z.object({
        content: z.string(),
        role: z.enum(["user", "system", "assistant"]),
      }),
    ),
  });

  const { streakId, messages, username } = inputSchema.parse(body);

  const lastMessage = messages[messages.length - 1];

  const { stream, handlers } = LangChainStream();

  const input = lastMessage.content;

  const chain = await chainz({
    streakId,
    username,
    input,
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
