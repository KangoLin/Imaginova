import { NextResponse } from "next/server";
import db, { type UserRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = db.prepare(
    "SELECT id, name, email, credits, created_at FROM users WHERE id = ?"
  ).get(userId) as Pick<UserRow, "id" | "name" | "email" | "credits" | "created_at"> | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
