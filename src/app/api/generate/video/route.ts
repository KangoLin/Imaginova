import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import db, { type UserRow, type VideoRow } from "@/lib/db";
import { createVideo, getVideoStatus } from "@/lib/video";

export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let prompt: string;
  let imageUrl: string | undefined;

  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const formData = await req.formData();
    const p = formData.get("prompt");
    if (typeof p !== "string" || !p) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    prompt = p;
    const file = formData.get("image");
    if (file && typeof file === "object" && "size" in file && file.size > 0 && "arrayBuffer" in file) {
      const buf = Buffer.from(await file.arrayBuffer());
      const b64 = buf.toString("base64");
      const mime = file.type || "image/png";
      imageUrl = `data:${mime};base64,${b64}`;
      console.log("Video FormData: image processed, size:", file.size, "mime:", mime);
    } else {
      console.log("Video FormData: no image file found, type:", typeof file, file ? Object.keys(file).join(",") : "null");
    }
  } else {
    const raw = await req.text();
    const body = JSON.parse(raw);
    if (typeof body.prompt !== "string" || !body.prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    prompt = body.prompt;
    imageUrl = body.imageUrl;
  }

  const user = db
    .prepare("SELECT credits FROM users WHERE id = ?")
    .get(userId) as Pick<UserRow, "credits"> | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

    if (user.credits < 1) {
    return NextResponse.json(
      { error: "Insufficient credits", credits: user.credits },
      { status: 402 }
    );
  }

  try {
    const task = await createVideo(prompt, imageUrl);

    const info = db.prepare(
      "INSERT INTO videos (user_id, prompt, model, status, task_id) VALUES (?, ?, ?, ?, ?)"
    ).run(userId, prompt, "agnes-video-v2.0", "queued", task.task_id);
    db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(userId);
    db.prepare("INSERT INTO api_usage (user_id, action, cost) VALUES (?, 'video_generation', ?)").run(userId, 1);

    return NextResponse.json({
      id: info.lastInsertRowid,
      task_id: task.task_id,
      credits: user.credits - 1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Video creation failed";
    console.error("Video create error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  try {
    const status = await getVideoStatus(taskId);
    console.log("Video status for", taskId, ":", JSON.stringify(status));

    if (status.status === "completed" && status.url) {
      db.prepare("UPDATE videos SET status = ?, url = ?, progress = 100 WHERE task_id = ?").run(
        "completed",
        status.url,
        taskId
      );
    } else if (status.status === "failed") {
      db.prepare("UPDATE videos SET status = ? WHERE task_id = ?").run(
        "failed",
        taskId
      );
    } else {
      db.prepare("UPDATE videos SET status = ?, progress = ? WHERE task_id = ?").run(
        status.status,
        status.progress || 0,
        taskId
      );
    }

    const videoRow = db.prepare("SELECT id FROM videos WHERE task_id = ?").get(taskId) as Pick<VideoRow, "id"> | undefined;
    return NextResponse.json({ ...status, id: videoRow?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
