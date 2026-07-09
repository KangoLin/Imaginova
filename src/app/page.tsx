import Link from "next/link";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
export default async function Home() {
  const userId = await getSessionUserId();
  let user: { name: string } | null = null;

  if (userId) {
    user = db.prepare("SELECT name FROM users WHERE id = ?").get(userId) as { name: string } | null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-primary">Imaginova</span>
          <nav className="flex items-center gap-6 text-sm">
            {user ? (
              <>
                <Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors">Create</Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                <span className="text-muted-foreground/70">{user.name}</span>
                <SignOutButton className="text-muted-foreground hover:text-foreground transition-colors" />
              </>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
                <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-primary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI-Powered Creative Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Turn your ideas
            <br />
            <span className="text-primary">into reality</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Generate stunning images and videos with AI. No complex setup required.
          </p>

          <Link
            href={user ? "/create" : "/register"}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Start Creating
          </Link>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 text-xs text-muted-foreground/50">
          <span>Image Generation</span>
          <span className="w-px h-3 bg-border" />
          <span>Video Creation</span>
          <span className="w-px h-3 bg-border" />
          <span>AI-Powered</span>
        </div>
      </main>
    </>
  );
}
