import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db, { type UserRow } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { EMAIL_REGEX } from "@/lib/email-validation";

export async function POST(request: NextRequest) {
  const ct = request.headers.get("content-type") || "";
  let email: string, password: string;
  if (ct.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    email = form.get("email") as string;
    password = form.get("password") as string;
  } else {
    const raw = await request.text();
    const json = JSON.parse(raw);
    email = json.email;
    password = json.password;
  }

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "imaginova.online";
  const baseUrl = `${proto}://${host}`;
  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/dashboard";
  const errRedirect = (errorKey: string) => {
    const url = new URL("/login", baseUrl);
    url.searchParams.set("error", errorKey);
    return NextResponse.redirect(url, { status: 303 });
  };

  if (!email || !password) {
    return errRedirect("all_fields_required");
  }

  if (!EMAIL_REGEX.test(email)) {
    return errRedirect("Invalid email or password");
  }

  const user = db.prepare(
    "SELECT id, name, email, password FROM users WHERE email = ?"
  ).get(email) as Pick<UserRow, "id" | "name" | "email" | "password"> | undefined;

  if (!user) {
    return errRedirect("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return errRedirect("Invalid email or password");
  }

  await setSessionCookie(user.id);

  if (request.nextUrl.searchParams.has("redirect")) {
    return NextResponse.redirect(new URL(redirectTo, baseUrl), { status: 303 });
  }

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
