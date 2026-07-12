import db, { type UserRow } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { HomeContent } from "@/components/home-content";

export default async function Home() {
  const userId = await getSessionUserId();
  let user: Pick<UserRow, "name"> | null = null;

  if (userId) {
    user = db.prepare("SELECT name FROM users WHERE id = ?").get(userId) as Pick<UserRow, "name"> | null;
  }

  return <HomeContent user={user} />;
}
