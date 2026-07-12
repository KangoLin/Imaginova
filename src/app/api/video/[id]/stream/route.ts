import { NextRequest } from "next/server";
import db, { type VideoRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getVideoStatus } from "@/lib/video";

export const maxDuration = 300;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const video = db
    .prepare("SELECT id, user_id, prompt, task_id, status, progress, url FROM videos WHERE id = ?")
    .get(Number(id)) as Pick<VideoRow, "id" | "user_id" | "task_id" | "status" | "progress" | "url"> | undefined;

  if (!video) {
    return new Response("Not found", { status: 404 });
  }
  if (video.user_id !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!video.task_id) {
    return new Response("No task", { status: 400 });
  }

  if (video.status === "completed" || video.status === "failed") {
    return new Response(JSON.stringify({ status: video.status, progress: video.progress, url: video.url }), {
      headers: { "content-type": "application/json" },
    });
  }

  const taskId: string = video.task_id;
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const maxAttempts = 60;
      for (let i = 0; i < maxAttempts; i++) {
        if (closed) return;
        await new Promise((r) => setTimeout(r, 3000));

        try {
          const status = await getVideoStatus(taskId);
          const mappedStatus = status.status;
          const progress = status.progress || 0;

          if (mappedStatus === "completed" && status.url) {
            db.prepare("UPDATE videos SET status = ?, url = ?, progress = 100 WHERE id = ?").run("completed", status.url, video.id);
            send({ status: "completed", progress: 100, url: status.url });
            closed = true;
            controller.close();
            return;
          } else if (mappedStatus === "failed") {
            db.prepare("UPDATE videos SET status = ? WHERE id = ?").run("failed", video.id);
            send({ status: "failed", progress, error: status.error || "Video generation failed" });
            closed = true;
            controller.close();
            return;
          } else {
            db.prepare("UPDATE videos SET status = ?, progress = ? WHERE task_id = ?").run(mappedStatus, progress, taskId);
            send({ status: mappedStatus, progress });
          }
        } catch {
          send({ status: "processing", progress: 0 });
        }
      }

      send({ status: "failed", progress: 0, error: "Timed out" });
      closed = true;
      controller.close();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}
