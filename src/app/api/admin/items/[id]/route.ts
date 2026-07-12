import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const TABLES = { image: "images", video: "videos" } as const;
type ItemType = keyof typeof TABLES;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { type, action } = body;
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  if (!type || !TABLES[type as ItemType]) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  if (action === "delete") {
    const item = db.prepare(`SELECT * FROM ${TABLES[type as ItemType]} WHERE id = ?`).get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    db.prepare(`DELETE FROM ${TABLES[type as ItemType]} WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  }

  const updates: Record<string, number> = { reviewed: 1 };
  if (action === "flag") updates.flagged = 1;
  else if (action === "unflag") updates.flagged = 0;

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(updates);
  db.prepare(`UPDATE ${TABLES[type as ItemType]} SET ${setClause} WHERE id = ?`).run(...values, id);

  return NextResponse.json({ success: true });
}
