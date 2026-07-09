"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "home" | "app" | "detail";
  user?: { name: string } | null;
}

export function Navbar({ variant = "app", user }: NavbarProps) {
  const router = useRouter();

  const shared = "fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-sm border-b border-border";

  if (variant === "home") {
    return (
      <header className={shared}>
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
    );
  }

  if (variant === "detail") {
    return (
      <header className={shared}>
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Dashboard</Link>
        </div>
      </header>
    );
  }

  return (
    <header className={shared}>
      <div className="container-narrow px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
        <nav className="flex items-center gap-5 text-sm">
          <Button size="xs" onClick={() => router.push("/create")}>Create</Button>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
          <ThemeToggle />
          <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className="text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
        </nav>
      </div>
    </header>
  );
}
