import { deleteStreakById } from "@/lib/streak";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("id is required", { status: 400 });
  }

  const res = await deleteStreakById(id);

  return NextResponse.json(res);
}
