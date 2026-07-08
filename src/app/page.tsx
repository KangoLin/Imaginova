import Link from "next/link";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
export default async function Home() {
  const userId = await getSessionUserId();
  let user: { name: string } | null = null;

  if (userId) {
    user = db.prepare("SELECT name FROM users WHERE id = ?").get(userId) as { name: string } | null;
  }

  return (
    <>
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">Imaginova</span>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/create" className="text-[var(--muted-fg)] hover:text-[var(--fg)]">Create</Link>
                <Link href="/dashboard" className="text-[var(--muted-fg)] hover:text-[var(--fg)]">Dashboard</Link>
                <span className="text-[var(--muted-fg)]">Hi, {user.name}</span>
                <form action="/api/logout" method="POST" className="inline">
                  <button className="text-[var(--muted-fg)] hover:text-red-500 text-sm">Sign Out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[var(--muted-fg)] hover:text-[var(--fg)]">Sign In</Link>
                <Link href="/register" className="bg-[var(--primary)] text-[var(--primary-fg)] px-3 py-1.5 rounded-md">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Imagine. Create.{" "}
          <span className="text-[var(--primary)]">Bring it to life.</span>
        </h1>
        <p className="text-[var(--muted-fg)] max-w-md mb-8">
          Generate images and videos with AI. No complex setup.
        </p>
        <Link
          href={user ? "/create" : "/register"}
          className="bg-[var(--primary)] text-[var(--primary-fg)] px-6 py-2.5 rounded-md font-medium hover:opacity-90 transition"
        >
          Start Creating
        </Link>
      </main>
    </>
  );
}
