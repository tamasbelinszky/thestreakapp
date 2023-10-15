import { sendTestEmail } from "@/lib/ses";

export async function POST(_request: Request) {
  // TODO: remove
  await sendTestEmail();

  return new Response(null, { status: 204 });
}
