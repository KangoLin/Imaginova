import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

interface TaskDef {
  key: string;
  reward: number;
}

const TASKS: TaskDef[] = [
  { key: "first_image", reward: 5 },
  { key: "first_video", reward: 10 },
  { key: "first_img2img", reward: 5 },
  { key: "five_images", reward: 10 },
  { key: "three_videos", reward: 15 },
  { key: "checkin_streak_3", reward: 10 },
];

function taskCondition(key: string, userId: number): { met: boolean; current: number; total: number } {
  switch (key) {
    case "first_image": {
      const row = db.prepare("SELECT COUNT(*) AS c FROM images WHERE user_id = ?").get(userId) as { c: number };
      return { met: row.c >= 1, current: Math.min(row.c, 1), total: 1 };
    }
    case "first_video": {
      const row = db.prepare("SELECT COUNT(*) AS c FROM videos WHERE user_id = ?").get(userId) as { c: number };
      return { met: row.c >= 1, current: Math.min(row.c, 1), total: 1 };
    }
    case "first_img2img": {
      const row = db.prepare("SELECT COUNT(*) AS c FROM images WHERE user_id = ? AND has_reference = 1").get(userId) as { c: number };
      return { met: row.c >= 1, current: Math.min(row.c, 1), total: 1 };
    }
    case "five_images": {
      const row = db.prepare("SELECT COUNT(*) AS c FROM images WHERE user_id = ?").get(userId) as { c: number };
      return { met: row.c >= 5, current: Math.min(row.c, 5), total: 5 };
    }
    case "three_videos": {
      const row = db.prepare("SELECT COUNT(*) AS c FROM videos WHERE user_id = ?").get(userId) as { c: number };
      return { met: row.c >= 3, current: Math.min(row.c, 3), total: 3 };
    }
    case "checkin_streak_3": {
      const row = db.prepare("SELECT checkin_streak FROM users WHERE id = ?").get(userId) as { checkin_streak: number } | undefined;
      const streak = row?.checkin_streak ?? 0;
      return { met: streak >= 3, current: Math.min(streak, 3), total: 3 };
    }
    default:
      return { met: false, current: 0, total: 0 };
  }
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const completedRows = db
    .prepare("SELECT task_key FROM user_tasks WHERE user_id = ?")
    .all(userId) as { task_key: string }[];

  const completed = new Set(completedRows.map((r) => r.task_key));

  const tasks = TASKS.map((t) => {
    const cond = taskCondition(t.key, userId);
    return {
      key: t.key,
      reward: t.reward,
      completed: completed.has(t.key),
      conditionMet: cond.met,
      progress: { current: cond.current, total: cond.total },
    };
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskKey } = await req.json();
  if (!taskKey) {
    return NextResponse.json({ error: "taskKey is required" }, { status: 400 });
  }

  const task = TASKS.find((t) => t.key === taskKey);
  if (!task) {
    return NextResponse.json({ error: "Unknown task" }, { status: 400 });
  }

  const already = db.prepare("SELECT id FROM user_tasks WHERE user_id = ? AND task_key = ?").get(userId, taskKey);
  if (already) {
    return NextResponse.json({ error: "Task already claimed" }, { status: 409 });
  }

  const cond = taskCondition(taskKey, userId);
  if (!cond.met) {
    return NextResponse.json({ error: "Task conditions not met" }, { status: 400 });
  }

  const claimTx = db.transaction(() => {
    db.prepare("INSERT INTO user_tasks (user_id, task_key) VALUES (?, ?)").run(userId, taskKey);
    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(task.reward, userId);
    db.prepare(
      "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES (?, 'task', ?, ?)"
    ).run(userId, task.reward, `Task reward: ${taskKey}`);
  });

  claimTx();

  const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as { credits: number };

  return NextResponse.json({ credits: user.credits, reward: task.reward, taskKey });
}
