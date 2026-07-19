"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocale } from "@/components/locale-provider";
import { Menu, Sparkles } from "lucide-react";

interface NavbarProps {
  variant?: "home" | "app" | "detail";
  user?: { name: string } | null;
}

export function Navbar({ variant = "app", user }: NavbarProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (variant === "app") {
      fetch("/api/me").then(r => r.ok ? r.json() : null).then(data => {
        if (data?.role === "admin") setIsAdmin(true);
      });
    }
  }, [variant]);

  const navLinks = variant === "home"
    ? (user
      ? [{ href: "/create", label: t("nav.create") }, { href: "/dashboard", label: t("nav.dashboard") }]
      : [{ href: "/login", label: t("nav.signIn") }])
    : variant === "detail"
    ? [{ href: "/dashboard", label: t("nav.backToDashboard") }]
    : [{ href: "/dashboard", label: t("nav.dashboard") }, { href: "/settings", label: t("nav.settings") }, ...(isAdmin ? [{ href: "/admin", label: t("nav.admin") }] : [])];

  const showCreate = variant === "app";
  const showUser = user && variant !== "detail";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/30 dark:border-border/40 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.02)] pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 max-w-6xl mx-auto">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary">Imaginova</Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors">{l.label}</Link>
          ))}
          {showUser && <span className="text-xs text-muted-foreground/50 px-2">{user!.name}</span>}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {showCreate && <Button size="sm" onClick={() => router.push("/create")} className="gap-1.5"><Sparkles size={14} />{t("nav.create")}</Button>}
          <ThemeToggle />
          <LanguageSwitcher />
          {showUser && <SignOutButton className="text-xs text-muted-foreground hover:text-foreground transition-colors" />}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors" aria-label="Menu"><Menu size={20} /></SheetTrigger>
            <SheetContent side="right" className="w-64 p-4 pt-12">
              <div className="flex flex-col gap-1">
                {showCreate && <Button size="sm" className="w-full justify-start mb-2" onClick={() => router.push("/create")}><Sparkles size={14} className="mr-2" />{t("nav.create")}</Button>}
                {navLinks.map(l => (
                  <Link key={l.href} href={l.href} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors">{l.label}</Link>
                ))}
                {showUser && (
                  <>
                    <div className="border-t border-border/50 my-2" />
                    <span className="px-3 py-1 text-xs text-muted-foreground">{user!.name}</span>
                    <SignOutButton className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors text-left" />
                  </>
                )}
                <div className="border-t border-border/50 my-2" />
                <LanguageSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
