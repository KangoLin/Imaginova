import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function extFromContentType(contentType: string): string {
  if (contentType.includes("video/mp4") || contentType.includes("video")) return ".mp4";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("webp")) return ".webp";
  return ".bin";
}

export async function saveFileFromUrl(
  category: "images" | "videos",
  id: number,
  url: string
): Promise<{ localPath: string; publicUrl: string }> {
  const categoryDir = path.join(UPLOAD_DIR, category);
  await ensureDir(categoryDir);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const ext = extFromContentType(contentType);

  const filename = `${id}${ext}`;
  const filePath = path.join(categoryDir, filename);
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/api/file/${category}/${filename}`;
  return { localPath: filePath, publicUrl };
}
