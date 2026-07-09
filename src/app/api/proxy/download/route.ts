import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

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
