import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import db, { type UserRow } from "@/lib/db";
import { generateImage } from "@/lib/image";

export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let prompt: string;
  let imageUrls: string[] = [];
  let size: string | undefined;

  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const formData = await req.formData();
    const p = formData.get("prompt");
    if (typeof p !== "string" || !p) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    prompt = p;
    size = typeof formData.get("size") === "string" ? formData.get("size") as string : undefined;
    const files = formData.getAll("image");
    for (const file of files) {
      if (typeof file === "object" && "size" in file && file.size > 0 && "arrayBuffer" in file) {
        const buf = Buffer.from(await file.arrayBuffer());
        const b64 = buf.toString("base64");
        const mime = file.type || "image/png";
        imageUrls.push(`data:${mime};base64,${b64}`);
      }
    }
  } else {
    const raw = await req.text();
    const body = JSON.parse(raw);
    if (typeof body.prompt !== "string" || !body.prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    prompt = body.prompt;
    imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : (body.imageUrl ? [body.imageUrl] : []);
    size = body.size;
  }

  const user = db
    .prepare("SELECT credits, name FROM users WHERE id = ?")
    .get(userId) as Pick<UserRow, "credits" | "name"> | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.credits < 1) {
    return NextResponse.json(
      { error: "Insufficient credits", credits: 0 },
      { status: 402 }
    );
  }

  try {
    const result = await generateImage({
      prompt,
      model: "agnes-image-2.1-flash",
      size,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });

    const hasRef = imageUrls.length > 0 ? 1 : 0;
    const info = db.prepare(
      "INSERT INTO images (user_id, prompt, url, model, has_reference) VALUES (?, ?, ?, ?, ?)"
    ).run(userId, prompt, result.url, "agnes-image-2.1-flash", hasRef);
    db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(userId);
    db.prepare("INSERT INTO api_usage (user_id, action, cost) VALUES (?, 'image_generation', ?)").run(userId, 1);

    return NextResponse.json({ id: info.lastInsertRowid, url: result.url, credits: user.credits - 1 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    console.error("Generate error:", message);
    if (err instanceof Error) console.error("Stack:", err.stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
