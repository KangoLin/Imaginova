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
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">Imaginova</span>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/create" className="text-gray-600 hover:text-gray-900">Create</Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <span className="text-gray-500">Hi, {user.name}</span>
                <form action="/api/logout" method="POST" className="inline">
                  <button className="text-gray-400 hover:text-red-500 text-sm">Sign Out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link href="/register" className="bg-blue-600 text-white px-3 py-1.5 rounded-md">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Imagine. Create.{" "}
          <span className="text-blue-600">Bring it to life.</span>
        </h1>
        <p className="text-gray-500 max-w-md mb-8">
          Generate images and videos with AI. No complex setup.
        </p>
        <Link
          href={user ? "/create" : "/register"}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium"
        >
          Start Creating
        </Link>
      </main>
    </>
  );
}
