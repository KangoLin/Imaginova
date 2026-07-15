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

export interface VideoOptions {
  width?: number;
  height?: number;
  num_frames?: number;
  frame_rate?: number;
}

export function createVideo(prompt: string, imageUrl?: string, options?: VideoOptions): Promise<{
  task_id: string;
  video_id?: string;
}> {
  const reqBody: Record<string, unknown> = { model: "agnes-video-v2.0", prompt };
  if (imageUrl) reqBody.image = imageUrl;
  if (options) {
    if (options.width) reqBody.width = options.width;
    if (options.height) reqBody.height = options.height;
    if (options.num_frames) reqBody.num_frames = options.num_frames;
    if (options.frame_rate) reqBody.frame_rate = options.frame_rate;
  }
  return request(
    "/v1/videos",
    {
      method: "POST",
      body: JSON.stringify(reqBody),
    }
  ).then((res) => {
    const body = JSON.parse(res.body);
    if (res.status !== 200) {
      throw new Error(body.error?.message || `Video creation failed (${res.status})`);
    }
    const taskId = body.task_id || body.id;
    if (!taskId) throw new Error(`No task_id in response: ${res.body.slice(0, 500)}`);
    return { task_id: taskId, video_id: body.video_id };
  });
}

function extractVideoUrl(body: Record<string, unknown>): string | undefined {
  return (
    (body.url as string) ||
    (body.video_url as string) ||
    (body.remixed_from_video_id as string) ||
    (body.metadata as Record<string, unknown>)?.url as string ||
    (body.result as Record<string, unknown>)?.url as string ||
    (body.result as Record<string, unknown>)?.video_url as string ||
    (body.data as Record<string, unknown>[])?.find(Boolean)?.url as string ||
    undefined
  );
}

export function getVideoStatus(taskId: string, videoId?: string): Promise<{
  status: string;
  progress: number;
  url?: string;
  error?: string;
}> {
  const path = videoId ? `/agnesapi?video_id=${videoId}` : `/v1/videos/${taskId}`;
  return request(path, { method: "GET" }).then(
    (res) => {
      const body = JSON.parse(res.body);
      if (res.status !== 200) {
        throw new Error(body.error?.message || `Status check failed (${res.status})`);
      }
      const rawStatus = (body.status || body.state || "").toLowerCase();
      const mappedStatus =
        rawStatus === "completed" || rawStatus === "success" || rawStatus === "succeeded" ? "completed" :
        rawStatus === "failed" ? "failed" : "processing";
      const progress = typeof body.progress === "number" ? body.progress : 0;
      const url = extractVideoUrl(body);
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
  onProgress?: (progress: number) => void,
  options?: VideoOptions
): Promise<string> {
  const { task_id, video_id } = await createVideo(prompt, undefined, options);

  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await getVideoStatus(task_id, video_id);

    if (onProgress) onProgress(status.progress || 0);

    if (status.status === "completed") {
      if (!status.url) throw new Error("Video generation completed but no URL returned");
      return status.url;
    }
    if (status.status === "failed") {
      throw new Error(status.error || "Video generation failed");
    }
  }

  throw new Error("Video generation timed out");
}
