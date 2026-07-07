import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
  ).run(name, email, hashed);

  return NextResponse.json({ id: result.lastInsertRowid });
}
