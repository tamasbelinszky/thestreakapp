import { auth } from "@/lib/auth";
import { openai } from "@/lib/opanai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

// export const runtime = "edge";

export async function POST(req: NextRequest) {
  const maybeUser = await auth();
  if (!maybeUser?.user) {
    return {
      status: 401,
      body: "Unauthorized",
    };
  }

  const { messages } = await req.json();
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
