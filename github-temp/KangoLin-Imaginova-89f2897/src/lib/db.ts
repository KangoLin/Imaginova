import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");

// Direct path to native binding to avoid `bindings` package resolution issue in Next.js bundle
const db = new Database(dbPath, {
  nativeBinding: path.join(process.cwd(), "node_modules/better-sqlite3/build/Release/better_sqlite3.node"),
});

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 50,
    checkin_streak INTEGER NOT NULL DEFAULT 0,
    last_checkin_date TEXT,
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

// migrate: add columns if missing
try { db.exec("ALTER TABLE videos ADD COLUMN progress INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN task_id TEXT"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN video_id TEXT"); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS credit_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  credits: number;
  role: string;
  checkin_streak: number;
  last_checkin_date: string | null;
  created_at: string;
}

export interface ImageRow {
  id: number;
  user_id: number;
  prompt: string;
  model: string;
  url: string;
  flagged: number;
  reported: number;
  reviewed: number;
  created_at: string;
}

export interface VideoRow {
  id: number;
  user_id: number;
  prompt: string;
  model: string;
  status: string;
  progress: number;
  task_id: string | null;
  video_id: string | null;
  url: string | null;
  flagged: number;
  reported: number;
  reviewed: number;
  created_at: string;
}

export interface VerificationCodeRow {
  id: number;
  email: string;
  code: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export interface CreditTransactionRow {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface PasswordResetRow {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: number;
  created_at: string;
}

// user role migration
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"); } catch {}

// moderation columns for images
try { db.exec("ALTER TABLE images ADD COLUMN flagged INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE images ADD COLUMN reported INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE images ADD COLUMN reviewed INTEGER NOT NULL DEFAULT 0"); } catch {}

// moderation columns for videos
try { db.exec("ALTER TABLE videos ADD COLUMN flagged INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN reported INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN reviewed INTEGER NOT NULL DEFAULT 0"); } catch {}

// migration: add checkin_streak and last_checkin_date to users
try { db.exec("ALTER TABLE users ADD COLUMN checkin_streak INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN last_checkin_date TEXT"); } catch {}

// user_tasks table for onboarding tasks
db.exec(`
  CREATE TABLE IF NOT EXISTS user_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_key TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, task_key)
  );
`);

// migration: add has_reference to images
try { db.exec("ALTER TABLE images ADD COLUMN has_reference INTEGER NOT NULL DEFAULT 0"); } catch {}

// verification_codes table for email verification
db.exec(`
  CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// api_usage table for statistics
db.exec(`
  CREATE TABLE IF NOT EXISTS api_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    cost INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export default db;
