import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const raw = await request.text();
  const body = JSON.parse(raw);
  const { type, id } = body;
  if (!type || !id) return NextResponse.json({ error: "Missing type or id" }, { status: 400 });

  const table = type === "image" ? "images" : "videos";
  db.prepare(`UPDATE ${table} SET reported = 1 WHERE id = ?`).run(id);

  return NextResponse.json({ success: true });
}
