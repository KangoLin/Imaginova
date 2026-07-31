import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("data.db");

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get("screenshot@test.com");
if (existing) {
  console.log("User already exists, id:", existing.id);
} else {
  const hashed = await bcrypt.hash("test123456", 10);
  const result = db.prepare("INSERT INTO users (name, email, password, credits) VALUES (?, ?, ?, 50)")
    .run("Screenshot", "screenshot@test.com", hashed);
  console.log("User created, id:", result.lastInsertRowid);
}

db.close();
