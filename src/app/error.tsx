"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">{error.message || "An unexpected error occurred."}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary px-6 text-sm font-medium text-secondary-foreground hover:opacity-90 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
