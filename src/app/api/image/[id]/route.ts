import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const image = db
    .prepare("SELECT id, user_id, prompt, model, url, created_at FROM images WHERE id = ?")
    .get(Number(id)) as { id: number; user_id: number; prompt: string; model: string; url: string; created_at: string } | undefined;

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  if (image.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(image);
}
