"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { SignOutButton } from "@/components/sign-out-button";

export function HomeContent({ user }: { user: { name: string } | null }) {
  const { t } = useLocale();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-border">
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-primary">Imaginova</span>
          <nav className="flex items-center gap-6 text-sm">
            {user ? (
              <>
                <Link href="/create" className="text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]">{t("nav.create")}</Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]">{t("nav.dashboard")}</Link>
                <span className="text-muted-foreground/70">{user.name}</span>
                <SignOutButton className="text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]" />
              </>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]">{t("nav.signIn")}</Link>
                <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]">{t("nav.getStarted")}</Link>
              </>
            )}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-primary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {t("home.badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            {t("home.title1")}
            <br />
            <span className="text-primary">{t("home.title2")}</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            {t("home.subtitle")}
          </p>

          <Link
            href={user ? "/create" : "/register"}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.97]"
          >
            {t("home.cta")}
          </Link>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 text-xs text-muted-foreground/50">
          <span>{t("home.feature1")}</span>
          <span className="w-px h-3 bg-border" />
          <span>{t("home.feature2")}</span>
          <span className="w-px h-3 bg-border" />
          <span>{t("home.feature3")}</span>
        </div>
      </main>
    </>
  );
}
