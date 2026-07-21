import { NextResponse } from "next/server";
import db, { type UserRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.text();
  const body = JSON.parse(raw);
  const amount = typeof body.amount === "number" && body.amount > 0 ? body.amount : null;

  if (!amount) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const insertTx = db.transaction(() => {
    db.prepare(
      "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES (?, 'recharge', ?, 'Recharge (mock)')"
    ).run(userId, amount);

    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(amount, userId);
  });

  insertTx();

  const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as Pick<UserRow, "credits">;

  return NextResponse.json({ credits: user.credits, amount });
}
