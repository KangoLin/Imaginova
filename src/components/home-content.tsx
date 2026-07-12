"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { SignOutButton } from "@/components/sign-out-button";

const features = [
  { key: "text", icon: "M" },
  { key: "image", icon: "I" },
  { key: "video", icon: "V" },
  { key: "multimodal", icon: "M" },
];

const steps = [
  { key: "step1" },
  { key: "step2" },
  { key: "step3" },
];

export function HomeContent({ user }: { user: { name: string } | null }) {
  const { t, locale } = useLocale();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <nav className="flex items-center gap-6 text-sm">
            {user ? (
              <>
                <Link href="/create" className="text-muted-foreground hover:text-foreground transition-all">{t("nav.create")}</Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-all">{t("nav.dashboard")}</Link>
                <span className="text-muted-foreground/70">{user.name}</span>
                <SignOutButton className="text-muted-foreground hover:text-foreground transition-all" />
              </>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-all">{t("nav.signIn")}</Link>
                <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all">{t("nav.getStarted")}</Link>
              </>
            )}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="min-h-screen">
        <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container-narrow px-6 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-primary mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t("home.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
              {t("home.title1")}{" "}
              <span className="text-primary">{t("home.title2")}</span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-muted-foreground/80">
                {t("home.title3")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("home.subtitle")}
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href={user ? "/create" : "/register"}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                {t("home.cta")}
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-base font-medium text-foreground hover:bg-muted transition-all"
              >
                {t("home.learnMore")}
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 border-t border-border/40">
          <div className="container-narrow px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("home.featuresTitle")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("home.featuresSub")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <div key={f.key} className="rounded-xl border border-border/60 bg-card p-6 hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-4">{f.icon}</div>
                  <h3 className="font-semibold mb-2">{t(`home.feature${f.key}Title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.feature${f.key}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30 border-y border-border/40">
          <div className="container-narrow px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("home.howItWorks")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("home.howItWorksSub")}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((s, i) => (
                <div key={s.key} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">{i + 1}</div>
                  <h3 className="font-semibold mb-2">{t(`home.${s.key}Title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.${s.key}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-narrow px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("home.readyTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">{t("home.readySub")}</p>
            <Link
              href={user ? "/create" : "/register"}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-10 text-base font-medium text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              {t("home.cta")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground/60">
        <div className="container-narrow px-6">
          <span className="text-primary font-bold">Imaginova</span> &mdash; {t("home.footer")}
        </div>
      </footer>
    </>
  );
}
