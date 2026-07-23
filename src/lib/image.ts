const AI_API_BASE = process.env.AI_API_BASE_URL || "https://apihub.agnes-ai.com";

async function makeRequest(
  urlStr: string,
  opts: { method: string; headers: Record<string, string>; body?: string },
  timeoutMs = 180000,
  retries = 3
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
        if (res.status === 503 && attempt < retries) {
          const delay = Math.min(2000 * Math.pow(2, attempt), 15000);
          console.error(`Image request got 503 (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        return { status: res.status, body };
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      console.error(`Image request attempt ${attempt + 1}/${retries + 1} failed:`, (e as Error).message);
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Unreachable");
}

export async function generateImage(params: { prompt: string; model: string; size?: string; imageUrls?: string[] }) {
  const key = process.env.OPENAI_API_KEY || "";
  const reqBody: Record<string, unknown> = {
    model: params.model || "agnes-image-2.1-flash",
    prompt: params.prompt,
    size: params.size || "1024x1024",
  };
  if (params.imageUrls && params.imageUrls.length > 0) {
    reqBody.extra_body = {
      image: params.imageUrls,
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
    try { const e = JSON.parse(result.body); if (e.error?.message) msg = `[${result.status}] ${e.error.message}`; } catch { msg += `: ${result.body.slice(0, 500)}`; }
    throw new Error(msg);
  }

  const data = JSON.parse(result.body);
  const item = data.data?.[0];
  if (!item) throw new Error(`Unexpected API response: ${result.body.slice(0, 500)}`);
  const imageUrl = item.url || item.b64_json || item.image_url || item.url;
  if (!imageUrl) throw new Error(`API response missing image URL: ${result.body.slice(0, 500)}`);
  return { url: imageUrl };
}
