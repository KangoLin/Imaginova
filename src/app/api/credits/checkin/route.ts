import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already checked in today
  const today = db
    .prepare(
      "SELECT id FROM credit_transactions WHERE user_id = ? AND type = 'checkin' AND date(created_at) = date('now')"
    )
    .get(userId);

  if (today) {
    return NextResponse.json({ error: "Already checked in today" }, { status: 409 });
  }

  const creditAmount = 1;

  const insertTx = db.transaction(() => {
    db.prepare(
      "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES (?, 'checkin', ?, 'Daily check-in reward')"
    ).run(userId, creditAmount);

    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(creditAmount, userId);
  });

  insertTx();

  const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as { credits: number };

  return NextResponse.json({ credits: user.credits, reward: creditAmount });
}
