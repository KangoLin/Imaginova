/**
 * Server-side migration script
 * Run inside Docker container: docker exec -i imaginova-imaginova-1 node /app/scripts/migrate-server-images.js
 */
import Database from "better-sqlite3";
import fs from "fs/promises";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || "/app/data/data.db";
const UPLOAD_DIR = "/app/data/uploads/images";

async function extFromResponse(response) {
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("png")) return ".png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("gif")) return ".gif";
  return ".bin";
}

async function main() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  const images = db.prepare("SELECT id, url FROM images WHERE url NOT LIKE '/api/file/%'").all();

  if (images.length === 0) {
    console.log("All images already use local URLs. Nothing to migrate.");
    db.close();
    return;
  }

  console.log(`Found ${images.length} images with external URLs.`);

  for (const img of images) {
    try {
      console.log(`[${img.id}] Downloading: ${img.url.slice(0, 80)}...`);
      const response = await fetch(img.url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) {
        console.error(`[${img.id}] FAILED: HTTP ${response.status}`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = await extFromResponse(response);
      const filename = `${img.id}${ext}`;
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

      const publicUrl = `/api/file/images/${filename}`;
      db.prepare("UPDATE images SET url = ? WHERE id = ?").run(publicUrl, img.id);
      console.log(`[${img.id}] OK -> ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`[${img.id}] ERROR: ${err.message}`);
    }
  }

  db.close();
  console.log("Migration complete.");
}

main().catch(console.error);
