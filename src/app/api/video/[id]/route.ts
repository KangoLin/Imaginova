import { NextRequest, NextResponse } from "next/server";
import db, { type VideoRow } from "@/lib/db";
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
  const video = db
    .prepare("SELECT id, user_id, prompt, model, status, url, progress, created_at FROM videos WHERE id = ?")
    .get(Number(id)) as Pick<VideoRow, "id" | "user_id" | "prompt" | "model" | "status" | "url" | "progress" | "created_at"> | undefined;

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
  if (video.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(video);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const video = db.prepare("SELECT id FROM videos WHERE id = ? AND user_id = ?").get(Number(id), userId);
  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  db.prepare("DELETE FROM videos WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
