import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db, { type UserRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.text();
  const { currentPassword, newPassword } = JSON.parse(raw);

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const user = db.prepare("SELECT password FROM users WHERE id = ?").get(userId) as Pick<UserRow, "password"> | undefined;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, userId);

  return NextResponse.json({ ok: true });
}
