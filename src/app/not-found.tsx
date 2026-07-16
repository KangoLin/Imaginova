import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-primary mb-4">404</h1>
        <p className="text-muted-foreground mb-8">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
