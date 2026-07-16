"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import SplitText from "@/components/SplitText";
import { ArrowRight, Sparkles, Image, Video, Wand2 } from "lucide-react";

const features = [
  { key: "text", icon: Wand2 },
  { key: "image", icon: Image },
  { key: "video", icon: Video },
  { key: "multimodal", icon: Sparkles },
];

export function HomeContent({ user }: { user: { name: string } | null }) {
  const { t } = useLocale();
  const featuresRef = useRef<HTMLElement>(null);

  return (
    <>
      <Navbar variant="home" user={user} />
      <main className="min-h-dvh">
        <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

          <div className="container-narrow px-6 text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-primary mb-8 animate-fade-in">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {t("home.badge")}
            </div>

            <SplitText
              text={`${t("home.title1")} ${t("home.title2")}`}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto"
              splitType="words"
              delay={25}
              duration={0.8}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              tag="h1"
              textAlign="center"
            />

            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {t("home.subtitle")}
            </p>

            <div className="flex items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Link href={user ? "/create" : "/register"}>
                <Button size="lg" className="gap-2 text-base h-11 px-7">
                  {t("home.cta")}
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-11 px-7" onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}>
                {t("home.learnMore")}
              </Button>
            </div>
          </div>
        </section>

        <section ref={featuresRef} id="features" className="py-20 border-t border-border/50">
          <div className="container-narrow px-6">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t("home.featuresTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("home.featuresSub")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.key} className="group rounded-xl bg-card border border-border/60 p-5 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/15 transition-colors">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5">{t(`home.feature${f.key}Title`)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(`home.feature${f.key}Desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-transparent via-muted/30 to-transparent border-y border-border/50">
          <div className="container-narrow px-6">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t("home.howItWorks")}</h2>
              <p className="text-sm text-muted-foreground">{t("home.howItWorksSub")}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[1, 2, 3].map((n) => (
                <div key={n} className="text-center animate-slide-up" style={{ animationDelay: `${(n - 1) * 0.1}s` }}>
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mx-auto mb-3">{n}</div>
                  <h3 className="font-semibold text-sm mb-1.5">{t(`home.step${n}Title`)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`home.step${n}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 text-center">
          <div className="container-narrow px-6 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t("home.readyTitle")}</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8">{t("home.readySub")}</p>
            <Link href={user ? "/create" : "/register"}>
              <Button size="lg" className="gap-2 text-base h-11 px-8">
                {t("home.cta")}
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground/50">
        <div className="container-narrow px-6">
          <span className="text-gradient font-semibold">Imaginova</span> &mdash; {t("home.footer")}
        </div>
      </footer>
    </>
  );
}
