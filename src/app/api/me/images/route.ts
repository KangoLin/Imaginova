import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const images = db.prepare(
    "SELECT id, prompt, model, url, created_at FROM images WHERE user_id = ? ORDER BY created_at DESC"
  ).all(userId);

  return NextResponse.json(images);
}
