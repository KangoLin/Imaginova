"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-200">
      {open ? (
        <>
          <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AdminNavbar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileOpen]);

  const links = [
    { href: "/admin", label: "admin.overview" },
    { href: "/admin/moderation", label: "admin.moderation" },
    { href: "/admin/users", label: "admin.users" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-sm border-b border-border">
      <div className="container-narrow px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-primary shrink-0">Imaginova <span className="text-xs font-normal text-muted-foreground">Admin</span></Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
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
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
          {t("admin.backToApp")}
        </Link>
        <div ref={mobileMenuRef} className="relative md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
          {mobileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.label)}
                </Link>
              ))}
              <div className="border-t border-border my-1" />
              <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                {t("admin.backToApp")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
