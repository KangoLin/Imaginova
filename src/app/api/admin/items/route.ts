import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";
  const filter = searchParams.get("filter") || "all";
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  function buildQuery(table: string, conditions: string[]) {
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const items = db.prepare(`SELECT i.*, u.name as user_name, u.email as user_email FROM ${table} i JOIN users u ON u.id = i.user_id ${where} ORDER BY i.created_at DESC LIMIT ? OFFSET ?`).all(limit, offset);
    const total = (db.prepare(`SELECT COUNT(*) as c FROM ${table} i ${where}`).get() as { c: number }).c;
    return { items, total };
  }

  const conds: string[] = [];
  if (filter === "flagged") conds.push("i.flagged = 1");
  else if (filter === "reported") conds.push("i.reported = 1");
  else if (filter === "unreviewed") conds.push("i.reviewed = 0 AND i.flagged = 0");

  if (type === "all") {
    const images = buildQuery("images", conds);
    const videos = buildQuery("videos", conds);
    return NextResponse.json({ images, videos });
  } else if (type === "images") {
    return NextResponse.json(buildQuery("images", conds));
  } else {
    return NextResponse.json(buildQuery("videos", conds));
  }
}
