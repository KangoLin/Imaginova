import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const videos = db.prepare(
    "SELECT id, prompt, model, status, url, progress, created_at FROM videos WHERE user_id = ? ORDER BY created_at DESC"
  ).all(userId);

  return NextResponse.json(videos);
}
