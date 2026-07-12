import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db, { type UserRow } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = db.prepare(
    "SELECT id, name, email, password FROM users WHERE email = ?"
  ).get(email) as Pick<UserRow, "id" | "name" | "email" | "password"> | undefined;

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await setSessionCookie(user.id);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
