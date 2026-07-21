import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db, { type UserRow } from "@/lib/db";
import { validateEmail } from "@/lib/email-validation";
import { sendPasswordResetLink } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const { email } = JSON.parse(raw);
  if (!email) return NextResponse.json({ error: "all_fields_required" }, { status: 400 });

  const emailError = await validateEmail(email);
  if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });

  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as Pick<UserRow, "id"> | null;
  const response: Record<string, string> = {
    message: "If the email exists, a reset link has been generated.",
  };

  // Always return the same message regardless of whether the user exists (security)
  if (!user) return NextResponse.json(response);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expiresAt);

  const resetLink = `${req.headers.get("origin") || "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    await sendPasswordResetLink(email, resetLink);
  } catch {
    return NextResponse.json({ error: "send_code_failed" }, { status: 500 });
  }

  if (process.env.NODE_ENV !== "production") {
    response.resetLink = resetLink;
  }
  return NextResponse.json(response);
}
