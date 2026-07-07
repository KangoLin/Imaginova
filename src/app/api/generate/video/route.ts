import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import db from "@/lib/db";
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
    const body = await req.json();
    if (typeof body.prompt !== "string" || !body.prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    prompt = body.prompt;
    imageUrl = body.imageUrl;
  }

  const user = db
    .prepare("SELECT credits FROM users WHERE id = ?")
    .get(userId) as { credits: number } | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.credits < 2) {
    return NextResponse.json(
      { error: "Insufficient credits (need 2)", credits: user.credits },
      { status: 402 }
    );
  }

  try {
    const task = await createVideo(prompt, imageUrl);

    db.prepare("UPDATE users SET credits = credits - 2 WHERE id = ?").run(userId);
    db.prepare(
      "INSERT INTO videos (user_id, prompt, model, status, task_id) VALUES (?, ?, ?, ?, ?)"
    ).run(userId, prompt, "agnes-video-v2.0", "queued", task.task_id);

    return NextResponse.json({
      task_id: task.task_id,
      credits: user.credits - 2,
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

    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
