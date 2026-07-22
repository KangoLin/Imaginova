import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import db, { type VideoRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoUrl = req.nextUrl.searchParams.get("url");
  if (!videoUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const video = db
    .prepare("SELECT url FROM videos WHERE url = ? AND user_id = ?")
    .get(videoUrl, userId) as Pick<VideoRow, "url"> | undefined;

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // If it's a local file, serve directly with Range support
  if (videoUrl.startsWith("/api/file/")) {
    const segments = videoUrl.replace("/api/file/", "").split("/");
    const filePath = path.join(UPLOAD_DIR, segments[0], segments.slice(1).join("/"));
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let stat;
    try { stat = await fs.stat(filePath); } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

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
          "Content-Type": "video/mp4",
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
        "Content-Type": "video/mp4",
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // External URL: proxy with Range passthrough
  try {
    const rangeHeader = req.headers.get("range") || "";
    const headers: Record<string, string> = {};
    if (rangeHeader) headers["Range"] = rangeHeader;

    const res = await fetch(videoUrl, { headers });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    const resHeaders: Record<string, string> = {
      "Content-Type": res.headers.get("content-type") || "video/mp4",
    };

    const contentLength = res.headers.get("content-length");
    if (contentLength) resHeaders["Content-Length"] = contentLength;

    const contentRange = res.headers.get("content-range");
    if (contentRange) resHeaders["Content-Range"] = contentRange;

    resHeaders["Accept-Ranges"] = "bytes";
    resHeaders["Cache-Control"] = "public, max-age=86400";

    return new NextResponse(res.body, {
      status: res.status === 206 ? 206 : 200,
      headers: resHeaders,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
