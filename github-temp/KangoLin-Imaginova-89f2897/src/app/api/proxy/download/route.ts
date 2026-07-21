import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "download";

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const owned =
    db.prepare("SELECT 1 FROM images WHERE url = ? AND user_id = ?").get(url, userId) ||
    db.prepare("SELECT 1 FROM videos WHERE url = ? AND user_id = ?").get(url, userId);

  if (!owned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const ext = contentType.split("/")[1] || "bin";
    const disposition = `attachment; filename="${filename}.${ext}"`;

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Download proxy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
