"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

interface NavbarProps {
  variant?: "home" | "app" | "detail";
  user?: { name: string } | null;
}

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

export function Navbar({ variant = "app", user }: NavbarProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === "app") {
      fetch("/api/me").then(r => r.ok ? r.json() : null).then(data => {
        if (data?.role === "admin") setIsAdmin(true);
      });
    }
  }, [variant]);

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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  const shared = "fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-sm border-b border-border";

  const linkClass = "text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]";
  const navBtnClass = "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]";

  if (variant === "home") {
    return (
      <header className={shared}>
        <div className="container-narrow px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-primary">Imaginova</span>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {user ? (
              <>
                <Link href="/create" className={linkClass}>{t("nav.create")}</Link>
                <Link href="/dashboard" className={linkClass}>{t("nav.dashboard")}</Link>
                <span className="text-muted-foreground/70">{user.name}</span>
                <SignOutButton className={linkClass} />
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass}>{t("nav.signIn")}</Link>
                <Link href="/register" className={navBtnClass}>{t("nav.getStarted")}</Link>
              </>
            )}
            <LanguageSwitcher />
          </nav>
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
                {user ? (
                  <>
                    <Link href="/create" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.create")}</Link>
                    <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.dashboard")}</Link>
                    <div className="border-t border-border my-1" />
                    <div className="px-4 py-2.5"><LanguageSwitcher /></div>
                    <div className="px-4 py-2.5"><SignOutButton className="text-sm" /></div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.signIn")}</Link>
                    <Link href="/register" className="block px-4 py-2.5 text-sm text-foreground font-medium hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.getStarted")}</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  if (variant === "detail") {
    return (
      <header className={shared}>
        <div className="container-narrow px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className={`${linkClass} text-sm`}>{t("nav.backToDashboard")}</Link>
            <LanguageSwitcher />
          </div>
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
                <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.backToDashboard")}</Link>
                <div className="px-4 py-2.5"><LanguageSwitcher /></div>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={shared}>
      <div className="container-narrow px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Button size="sm" onClick={() => router.push("/create")}>{t("nav.create")}</Button>
          <Link href="/dashboard" className={linkClass}>{t("nav.dashboard")}</Link>
          <Link href="/settings" className={linkClass}>{t("nav.settings")}</Link>
          {isAdmin && (
            <Link href="/admin" className={linkClass}>{t("nav.admin")}</Link>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
          <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className={linkClass}>{t("nav.signOut")}</button>
        </nav>
        <div ref={mobileMenuRef} className="relative md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
          {mobileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-background shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Button size="sm" className="w-full mx-4 justify-start" onClick={() => { router.push("/create"); setMobileOpen(false); }}>{t("nav.create")}</Button>
              <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.dashboard")}</Link>
              <Link href="/settings" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.settings")}</Link>
              {isAdmin && (
                <Link href="/admin" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>{t("nav.admin")}</Link>
              )}
              <div className="border-t border-border my-1" />
              <div className="px-4 py-2 flex items-center gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <div className="border-t border-border my-1" />
              <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); router.refresh(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{t("nav.signOut")}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
