import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.credits, u.role, u.created_at,
      (SELECT COUNT(*) FROM images WHERE user_id = u.id) as image_count,
      (SELECT COUNT(*) FROM videos WHERE user_id = u.id) as video_count
    FROM users u ORDER BY u.created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;

  return NextResponse.json({ items: users, total });
}
