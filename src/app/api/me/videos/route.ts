import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "12"), 1), 60);
  const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0"), 0);

  const items = db.prepare(
    "SELECT id, prompt, model, status, url, progress, created_at FROM videos WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(userId, limit, offset);

  const total = (db.prepare("SELECT COUNT(*) as count FROM videos WHERE user_id = ?").get(userId) as { count: number }).count;

  return NextResponse.json({ items, total });
}
