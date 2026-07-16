import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { validateEmail } from "@/lib/email-validation";
import { sendVerificationCode } from "@/lib/mail";

const RATE_LIMIT_MS = 60_000;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const { email } = JSON.parse(raw);
  if (!email) {
    return NextResponse.json({ error: "all_fields_required" }, { status: 400 });
  }

  const emailError = await validateEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  const lastCode = db.prepare(
    "SELECT created_at FROM verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
  ).get(email) as { created_at: string } | undefined;

  if (lastCode) {
    const elapsed = Date.now() - new Date(lastCode.created_at + "Z").getTime();
    if (elapsed < RATE_LIMIT_MS) {
      return NextResponse.json({ error: "send_code_too_soon" }, { status: 429 });
    }
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);
  db.prepare(
    "INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)"
  ).run(email, code, expiresAt);

  try {
    await sendVerificationCode(email, code);
  } catch {
    return NextResponse.json({ error: "send_code_failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "ok" });
}
