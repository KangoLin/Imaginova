import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

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
    .get(videoUrl, userId) as { url: string } | undefined;

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  try {
    const res = await fetch(videoUrl);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "video/mp4";
    const contentLength = res.headers.get("content-length");

    // Stream the response so browser can start playing immediately
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        ...(contentLength ? { "Content-Length": contentLength } : {}),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
