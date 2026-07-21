import { NextRequest, NextResponse } from "next/server";
import db, { type ImageRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const image = db
    .prepare("SELECT id, user_id, prompt, model, url, has_reference, created_at FROM images WHERE id = ?")
    .get(Number(id)) as (Pick<ImageRow, "id" | "user_id" | "prompt" | "model" | "url" | "created_at"> & { has_reference: number }) | undefined;

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  if (image.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: image.id,
    user_id: image.user_id,
    prompt: image.prompt,
    model: image.model,
    url: image.url,
    created_at: image.created_at,
    reference_url: null,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const image = db.prepare("SELECT id FROM images WHERE id = ? AND user_id = ?").get(Number(id), userId);
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  db.prepare("DELETE FROM images WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
