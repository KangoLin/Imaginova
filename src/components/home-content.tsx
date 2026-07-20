"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import SplitText from "@/components/SplitText";
import { ArrowRight, Sparkles, Image as ImageIcon, Video, Wand2, Layers, Users, Zap, Check } from "lucide-react";

const features = [
  { key: "text", icon: Wand2, gradient: "from-primary/15 via-primary/5 to-transparent" },
  { key: "image", icon: ImageIcon, gradient: "from-accent/15 via-accent/5 to-transparent" },
  { key: "video", icon: Video, gradient: "from-primary/10 via-accent/5 to-transparent" },
  { key: "multimodal", icon: Layers, gradient: "from-accent/15 via-primary/5 to-transparent" },
];

const showcaseItems = [
  { id: 1, span: "lg:col-span-2 lg:row-span-2", gradient: "conic-gradient(from 230deg at 50% 50%, #c084fc, #818cf8, #22d3ee, #c084fc)", labelKey: "home.showcaseImg", imageUrl: "/images/showcase/ai-image-generation.jpg" },
  { id: 2, span: "", gradient: "linear-gradient(160deg, #fbbf24, #f472b6, #a78bfa)", labelKey: "home.showcaseStyle", imageUrl: "/images/showcase/style-transfer.jpg" },
  { id: 3, span: "", gradient: "linear-gradient(135deg, #22d3ee, #60a5fa, #a78bfa)", labelKey: "home.showcaseVideo", imageUrl: "/images/showcase/video-creation.jpg" },
  { id: 4, span: "lg:col-span-2", gradient: "linear-gradient(120deg, #a78bfa, #818cf8, #22d3ee, #2dd4bf)", labelKey: "home.showcaseMulti", imageUrl: "/images/showcase/multimodal.jpg" },
];

const logos = ["OpenAI", "Anthropic", "Google", "Meta", "Stability", "Runway"];

const steps = [
  { icon: Wand2, titleKey: "home.step1Title", descKey: "home.step1Desc" },
  { icon: Sparkles, titleKey: "home.step2Title", descKey: "home.step2Desc" },
  { icon: Check, titleKey: "home.step3Title", descKey: "home.step3Desc" },
];

export function HomeContent({ user }: { user: { name: string } | null }) {
  const { t } = useLocale();
  const featuresRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const LogoIcon = ({ name, index }: { name: string; index: number }) => {
    const colors = ["text-primary", "text-accent", "text-foreground", "text-muted-foreground", "text-primary/70", "text-accent/70"];
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/40 hover:border-primary/20 transition-colors">
        <div className={`size-6 rounded-full ${colors[index % colors.length]} bg-current/10 flex items-center justify-center`}>
          <span className="text-[8px] font-bold text-background">{name[0]}</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{name}</span>
      </div>
    );
  };

  return (
    <>
      <Navbar variant="home" user={user} />
      <main className="min-h-dvh">
        <section className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] via-transparent to-background pointer-events-none" />
          <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />

          <div className="container-narrow px-6 text-center relative z-10">
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-primary border border-primary/10">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                {t("home.badge")}
              </div>
            </div>

            <SplitText
              text={`${t("home.title1")} ${t("home.title2")}`}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto"
              splitType="words"
              delay={20}
              duration={0.6}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              tag="h1"
              textAlign="center"
            />

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {t("home.subtitle")}
            </p>

            <div className="flex items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Link href={user ? "/create" : "/register"}>
                <Button
                  size="lg"
                  className="gap-2 text-base h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300 active:scale-[0.97] font-medium dark:shadow-primary/20 dark:hover:shadow-primary/30"
                >
                  {t("home.cta")}
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full border-white/20 dark:border-primary/20 text-foreground hover:bg-white/5 dark:hover:bg-primary/5 hover:border-white/30 dark:hover:border-primary/30 transition-all duration-300"
                onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                {t("home.learnMore")}
              </Button>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3v14M4 11l6 6 6-6" />
            </svg>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
          <div className="container-narrow px-6 relative">
            <div className="text-center mb-14 animate-slide-up">
              <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">{t("home.badge")}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.showcaseTitle")}</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t("home.showcaseDesc")}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[160px] lg:auto-rows-[200px]">
              {showcaseItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`relative rounded-[14px] overflow-hidden group cursor-pointer ${item.span} animate-slide-up`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  )}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${item.imageUrl ? "opacity-40 group-hover:opacity-60" : "opacity-60 group-hover:opacity-80"}`}
                    style={{ background: item.gradient }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-white/[0.06] rounded-[14px]" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-medium text-white drop-shadow-sm">{t(item.labelKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-y border-border/40 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
          <div className="container-narrow px-6 relative">
            <p className="text-xs text-muted-foreground text-center mb-6 font-medium tracking-wider uppercase">{t("home.featuresTitle")}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {logos.map((name, i) => (
                <LogoIcon key={name} name={name} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section ref={featuresRef} id="features" className="py-24">
          <div className="container-narrow px-6">
            <div className="text-center mb-14 animate-slide-up">
              <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">{t("home.featuresTitle")}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.featuresSub")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.key}
                    className="group relative rounded-[14px] bg-card border border-border/40 p-6 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 animate-slide-up overflow-hidden"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-semibold text-base mb-2">{t(`home.feature${f.key}Title`)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.feature${f.key}Desc`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent border-y border-border/40">
          <div className="container-narrow px-6">
            <div className="text-center mb-14 animate-slide-up">
              <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">{t("home.howItWorks")}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.howItWorksSub")}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="relative mb-4">
                      <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <Icon size={22} />
                      </div>
                      {i < steps.length - 1 && (
                        <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/20 to-transparent" />
                      )}
                    </div>
                    <div className="inline-flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-3">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-base mb-2">{t(step.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{t(step.descKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
          <div className="container-narrow px-6 relative animate-slide-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.readyTitle")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">{t("home.readySub")}</p>
            <Link href={user ? "/create" : "/register"}>
              <Button
                size="lg"
                className="gap-2 text-base h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300 active:scale-[0.97] font-medium"
              >
                {t("home.cta")}
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 text-center">
        <div className="container-narrow px-6">
          <p className="text-xs text-muted-foreground/40">
            <span className="text-gradient font-semibold">Imaginova</span> &mdash; {t("home.footer")}
          </p>
        </div>
      </footer>
    </>
  );
}
