import { chainz } from "@/lib/langchain";
import { LangChainStream, StreamingTextResponse } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const body = await req.json();

  const inputSchema = z.object({
    streakId: z.string(),
    messages: z.array(
      z.object({
        content: z.string(),
        role: z.enum(["user", "system", "assistant"]),
      }),
    ),
  });

  const { streakId, messages } = inputSchema.parse(body);

  const lastMessage = messages[messages.length - 1];

  const { stream, handlers, writer: _ } = LangChainStream();

  const chain = await chainz({
    streakId,
  });

  const input = lastMessage.content;

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
