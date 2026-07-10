import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Token and password are required" }, { status: 400 });

  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const record = db.prepare(
    "SELECT id, user_id, expires_at FROM password_resets WHERE token = ? AND used = 0"
  ).get(token) as { id: number; user_id: number; expires_at: string } | null;

  if (!record) return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });

  if (new Date(record.expires_at) < new Date()) return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  const updateTx = db.transaction(() => {
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, record.user_id);
    db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(record.id);
  });

  updateTx();
  return NextResponse.json({ message: "Password updated successfully" });
}
