"use client";

import { useRouter } from "next/navigation";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className={className}
    >
      Sign Out
    </button>
  );
}