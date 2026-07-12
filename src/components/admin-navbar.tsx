"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

export function AdminNavbar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const links = [
    { href: "/admin", label: "admin.overview" },
    { href: "/admin/moderation", label: "admin.moderation" },
    { href: "/admin/users", label: "admin.users" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-sm border-b border-border">
      <div className="container-narrow px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-primary">Imaginova <span className="text-xs font-normal text-muted-foreground">Admin</span></Link>
          <nav className="flex items-center gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {t("admin.backToApp")}
        </Link>
      </div>
    </header>
  );
}
