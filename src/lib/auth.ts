import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import db from "@/lib/db";
import type { UserRow } from "@/lib/db";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? (() => { throw new Error("AUTH_SECRET environment variable is required"); })()
);

const COOKIE_NAME = "token";

export async function createToken(userId: number) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as number;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  const token = await createToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = db.prepare("SELECT id, name, email, credits, role, created_at FROM users WHERE id = ?").get(userId) as Pick<UserRow, "id" | "name" | "email" | "credits" | "role" | "created_at"> | undefined;
  return user || null;
}
