import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = db
    .prepare(
      "SELECT id, type, amount, description, created_at FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
    )
    .all(userId);

  return NextResponse.json(transactions);
}
