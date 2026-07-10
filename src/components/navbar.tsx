"use client";

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

export function Navbar({ variant = "app", user }: NavbarProps) {
  const router = useRouter();
  const { t } = useLocale();

  const shared = "fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-sm border-b border-border";

  const linkClass = "text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]";
  const navBtnClass = "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]";

  if (variant === "home") {
    return (
      <header className={shared}>
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-primary">Imaginova</span>
          <nav className="flex items-center gap-6 text-sm">
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
        </div>
      </header>
    );
  }

  if (variant === "detail") {
    return (
      <header className={shared}>
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className={`${linkClass} text-sm`}>{t("nav.backToDashboard")}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={shared}>
      <div className="container-narrow px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Button size="sm" onClick={() => router.push("/create")}>{t("nav.create")}</Button>
          <Link href="/dashboard" className={linkClass}>{t("nav.dashboard")}</Link>
          <Link href="/settings" className={linkClass}>{t("nav.settings")}</Link>
          <ThemeToggle />
          <LanguageSwitcher />
          <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className={linkClass}>{t("nav.signOut")}</button>
        </nav>
      </div>
    </header>
  );
}
