import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { validateEmail } from "@/lib/email-validation";

function stripHtml(s: string) { return s.replace(/<[^>]*>/g, "").trim(); }

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const { name: rawName, email, password, code } = JSON.parse(raw);
  const name = stripHtml(rawName);

  if (!name || !email || !password || !code) {
    return NextResponse.json({ error: "all_fields_required" }, { status: 400 });
  }

  const emailError = await validateEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json({ error: "email_already_registered" }, { status: 409 });
  }

  const row = db.prepare(
    "SELECT id, code, expires_at, used FROM verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
  ).get(email) as { id: number; code: string; expires_at: string; used: number } | undefined;

  if (!row) {
    return NextResponse.json({ error: "code_not_sent" }, { status: 400 });
  }

  if (row.used) {
    return NextResponse.json({ error: "code_already_used" }, { status: 400 });
  }

  if (row.code !== code) {
    return NextResponse.json({ error: "code_mismatch" }, { status: 400 });
  }

  if (Date.now() > new Date(row.expires_at).getTime()) {
    return NextResponse.json({ error: "code_expired" }, { status: 400 });
  }

  db.prepare("UPDATE verification_codes SET used = 1 WHERE id = ?").run(row.id);

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password, credits) VALUES (?, ?, ?, 50)"
  ).run(name, email, hashed);

  return NextResponse.json({ id: result.lastInsertRowid });
}
