import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'dall-e-3',
    url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'agnes-video-v2.0',
    status TEXT NOT NULL DEFAULT 'queued',
    progress INTEGER NOT NULL DEFAULT 0,
    task_id TEXT,
    url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// migrate: add task_id column if missing
try { db.exec("ALTER TABLE videos ADD COLUMN progress INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN task_id TEXT"); } catch {}

export default db;
