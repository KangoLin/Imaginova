const AI_API_BASE = process.env.AI_API_BASE_URL || "https://apihub.agnes-ai.com";

async function request(
  path: string,
  opts: { method: string; body?: string },
  timeoutMs = 90000,
  retries = 1
): Promise<{ status: number; body: string }> {
  const key = process.env.OPENAI_API_KEY || "";
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const url = AI_API_BASE + path;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        };
        const res = await fetch(url, {
          method: opts.method,
          headers,
          body: opts.body,
          signal: controller.signal,
        });
        const body = await res.text();
        return { status: res.status, body };
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      console.error(`Video request attempt ${attempt + 1}/${retries + 1} failed:`, (e as Error).message);
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Unreachable");
}

export function createVideo(prompt: string, imageUrl?: string): Promise<{
  task_id: string;
}> {
  const reqBody: Record<string, unknown> = { model: "agnes-video-v2.0", prompt };
  if (imageUrl) reqBody.image = imageUrl;
  return request(
    "/v1/videos",
    {
      method: "POST",
      body: JSON.stringify(reqBody),
    }
  ).then((res) => {
    const body = JSON.parse(res.body);
    if (res.status !== 200) {
      console.log("[video-create] non-200 response:", res.status, res.body.slice(0, 500));
      throw new Error(body.error?.message || `Video creation failed (${res.status})`);
    }
    const taskId = body.task_id;
    console.log("[video-create] response:", JSON.stringify({ task_id: taskId, url: body.url, status: body.status }).slice(0, 300));
    if (!taskId) throw new Error("No task_id in response");
    return { task_id: taskId };
  });
}

export function getVideoStatus(taskId: string): Promise<{
  status: string;
  progress: number;
  url?: string;
  error?: string;
}> {
  return request(`/v1/videos/${taskId}`, { method: "GET" }).then(
    (res) => {
      const body = JSON.parse(res.body);
      console.log("[video-status] raw 200 for", taskId.slice(0, 30), ":", res.body.slice(0, 500));
      if (res.status !== 200) {
        console.log("[video-status] non-200 for", taskId.slice(0, 30), ":", res.status, res.body.slice(0, 400));
        throw new Error(body.error?.message || `Status check failed (${res.status})`);
      }
      const rawStatus = (body.status || "").toLowerCase();
      const mappedStatus =
        rawStatus === "completed" ? "completed" :
        rawStatus === "failed" ? "failed" : "processing";
      const progress = typeof body.progress === "number" ? body.progress : 0;
      const url = body.url || body.remixed_from_video_id || body.video_url || body.result?.url || undefined;
      const errMsg = typeof body.error === "object" && body.error?.message
        ? body.error.message
        : typeof body.error === "string" ? body.error
        : undefined;
      return { status: mappedStatus, progress, url, error: errMsg };
    }
  );
}

export async function generateVideo(
  prompt: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { task_id } = await createVideo(prompt);

  const maxAttempts = 120; // 120 * 5s = 10 minutes
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await getVideoStatus(task_id);

    if (onProgress) onProgress(status.progress || 0);

    if (status.status === "completed") {
      return status.url || "";
    }
    if (status.status === "failed") {
      throw new Error("Video generation failed");
    }
  }

  throw new Error("Video generation timed out");
}
