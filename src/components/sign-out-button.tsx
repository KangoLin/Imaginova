"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <button
      onClick={async () => {
        if (!window.confirm(t("common.confirmSignOut"))) return;
        await api.post("/api/logout");
        router.push("/");
        router.refresh();
      }}
      className={className}
    >
      {t("nav.signOut")}
    </button>
  );
}