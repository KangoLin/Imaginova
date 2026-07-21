import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  const totalImages = (db.prepare("SELECT COUNT(*) as c FROM images").get() as { c: number }).c;
  const totalVideos = (db.prepare("SELECT COUNT(*) as c FROM videos").get() as { c: number }).c;
  const totalCredits = (db.prepare("SELECT COALESCE(SUM(amount), 0) as c FROM credit_transactions WHERE type = 'checkin' OR type = 'recharge'").get() as { c: number }).c;
  const totalSpent = (db.prepare("SELECT COALESCE(SUM(cost), 0) as c FROM api_usage").get() as { c: number }).c;

  const dailyRegistrations = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM users WHERE created_at >= datetime('now', '-14 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  const dailyGenerations = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM api_usage WHERE created_at >= datetime('now', '-14 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  const topUsers = db.prepare(`
    SELECT u.id, u.name, u.email, COUNT(a.id) as generations
    FROM users u LEFT JOIN api_usage a ON a.user_id = u.id
    GROUP BY u.id ORDER BY generations DESC LIMIT 10
  `).all();

  const keyUsage = db.prepare(`
    SELECT action, COUNT(*) as count, SUM(cost) as total_cost
    FROM api_usage GROUP BY action
  `).all();

  return NextResponse.json({
    totalUsers, totalImages, totalVideos, totalCredits, totalSpent,
    dailyRegistrations, dailyGenerations, topUsers, keyUsage,
  });
}
