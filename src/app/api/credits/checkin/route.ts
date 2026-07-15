import { NextResponse } from "next/server";
import db, { type UserRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = db
    .prepare("SELECT credits, checkin_streak, last_checkin_date FROM users WHERE id = ?")
    .get(userId) as Pick<UserRow, "credits" | "checkin_streak" | "last_checkin_date"> | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

  if (user.last_checkin_date === todayStr) {
    return NextResponse.json({ error: "Already checked in today" }, { status: 409 });
  }

  let newStreak = 1;
  if (user.last_checkin_date === yesterdayStr) {
    newStreak = user.checkin_streak + 1;
  }

  const creditAmount = 30;

  const insertTx = db.transaction(() => {
    db.prepare(
      "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES (?, 'checkin', ?, ?)"
    ).run(userId, creditAmount, `Daily check-in reward (streak: ${newStreak})`);

    db.prepare("UPDATE users SET credits = credits + ?, checkin_streak = ?, last_checkin_date = ? WHERE id = ?").run(
      creditAmount,
      newStreak,
      todayStr,
      userId
    );
  });

  insertTx();

  const updated = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as Pick<UserRow, "credits">;

  return NextResponse.json({ credits: updated.credits, reward: creditAmount, streak: newStreak });
}
