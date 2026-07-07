const AI_API_BASE = process.env.AI_API_BASE_URL || "https://apihub.agnes-ai.com";

async function makeRequest(
  urlStr: string,
  opts: { method: string; headers: Record<string, string>; body?: string },
  timeoutMs = 180000,
  retries = 1
): Promise<{ status: number; body: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(urlStr, {
          method: opts.method,
          headers: opts.headers,
          body: opts.body,
          signal: controller.signal,
        });
        const body = await res.text();
        return { status: res.status, body };
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      console.error(`Image request attempt ${attempt + 1}/${retries + 1} failed:`, (e as Error).message);
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Unreachable");
}

export async function generateImage(params: { prompt: string; model: string; size?: string; imageUrl?: string }) {
  const key = process.env.OPENAI_API_KEY || "";
  const reqBody: Record<string, unknown> = {
    model: params.model || "agnes-image-2.1-flash",
    prompt: params.prompt,
    size: params.size || "1024x1024",
  };
  if (params.imageUrl) {
    reqBody.extra_body = {
      image: [params.imageUrl],
      response_format: "url",
    };
  }
  const body = JSON.stringify(reqBody);

  const url = `${AI_API_BASE}/v1/images/generations`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const result = await makeRequest(url, { method: "POST", headers, body });

  if (result.status !== 200) {
    let msg = `Image generation failed (${result.status})`;
    try { const e = JSON.parse(result.body); if (e.error?.message) msg = e.error.message; } catch {}
    throw new Error(msg);
  }

  const data = JSON.parse(result.body);
  return { url: data.data[0].url };
}
