import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db, { type UserRow } from "@/lib/db";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const { email } = JSON.parse(raw);
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as Pick<UserRow, "id"> | null;
  if (!user) return NextResponse.json({ error: "No account found with that email" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expiresAt);

  const resetLink = `${req.headers.get("origin") || "http://localhost:3000"}/reset-password?token=${token}`;
  const response: Record<string, string> = {
    message: "If the email exists, a reset link has been generated.",
  };
  if (process.env.NODE_ENV !== "production") {
    response.resetLink = resetLink;
  }
  return NextResponse.json(response);
}
