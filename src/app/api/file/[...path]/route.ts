import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSessionUserId } from "@/lib/auth";
import db from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const ALLOWED_CATEGORIES = ["images", "videos"];
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".gif": "image/gif",
  ".bin": "application/octet-stream",
};

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pathname = req.nextUrl.pathname;
  const segments = pathname.replace("/api/file/", "").split("/");
  const category = segments[0];
  const filename = segments.slice(1).join("/");

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, category, filename);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const idMatch = filename.match(/^(\d+)/);
  if (!idMatch) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  const fileId = parseInt(idMatch[1], 10);

  const owned = db
    .prepare(`SELECT 1 FROM ${category} WHERE id = ? AND user_id = ?`)
    .get(fileId, userId);
  if (!owned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileSize = stat.size;
  const rangeHeader = req.headers.get("range");

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const handle = await fs.open(filePath, "r");
    const buffer = Buffer.alloc(chunkSize);
    await handle.read(buffer, 0, chunkSize, start);
    await handle.close();

    return new NextResponse(buffer, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": String(chunkSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const file = await fs.readFile(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
