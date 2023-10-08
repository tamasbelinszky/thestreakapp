import { deleteChatHistory } from "@/lib/langchain";

export async function DELETE(_request: Request, { params }: { params: { streakId: string } }) {
  const streakId = params.streakId;

  await deleteChatHistory({ streakId });

  return new Response(null, { status: 204 });
}
