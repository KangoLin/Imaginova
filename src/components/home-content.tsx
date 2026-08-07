"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Image as ImageIcon, Wand2, Check, Shirt, Gamepad2, Paintbrush } from "lucide-react";

const heroSlides = [
  { mode: "product-photography", titleKey: "scene.productPhotography", taglineKey: "home.featureproductDesc", imageUrl: "/images/showcase/hero-beauty-editorial.jpg" },
  { mode: "fashion", titleKey: "scene.fashion", taglineKey: "home.featurefashionDesc", imageUrl: "/images/showcase/fashion-model.jpg" },
  { mode: "game", titleKey: "scene.game", taglineKey: "home.featuregameDesc", imageUrl: "/images/showcase/hero-perfume-lifestyle.jpg" },
  { mode: "style", titleKey: "scene.styleTransfer", taglineKey: "home.featurestyleDesc", imageUrl: "/images/showcase/style-transfer-result.png" },
  { mode: "free", titleKey: "scene.free", taglineKey: "home.featurefreeDesc", imageUrl: "/images/showcase/hero-lipstick-model.jpg" },
];

const studioCards = [
  { id: "product-photography", icon: ImageIcon, titleKey: "scene.productPhotography", descKey: "scene.productPhotographyDesc" },
  { id: "fashion", icon: Shirt, titleKey: "scene.fashion", descKey: "scene.fashionDesc" },
  { id: "game", icon: Gamepad2, titleKey: "scene.game", descKey: "scene.gameDesc" },
  { id: "style", icon: Paintbrush, titleKey: "scene.styleTransfer", descKey: "scene.styleTransferDesc" },
  { id: "free", icon: Sparkles, titleKey: "scene.free", descKey: "scene.freeDesc" },
];

const showcaseItems = [
  { id: 1, labelKey: "scene.productPhotography", imageUrl: "/images/showcase/hero-beauty-editorial.jpg" },
  { id: 2, labelKey: "scene.fashion", imageUrl: "/images/showcase/fashion-model.jpg" },
  { id: 3, labelKey: "scene.game", imageUrl: "/images/showcase/hero-perfume-lifestyle.jpg" },
  { id: 4, labelKey: "scene.styleTransfer", imageUrl: "/images/showcase/style-transfer-result.png" },
  { id: 5, labelKey: "scene.free", imageUrl: "/images/showcase/hero-lipstick-model.jpg" },
];

const features = [
  { key: "product", icon: ImageIcon },
  { key: "fashion", icon: Shirt },
  { key: "game", icon: Gamepad2 },
  { key: "style", icon: Paintbrush },
  { key: "free", icon: Sparkles },
];

const steps = [
  { icon: Wand2, titleKey: "home.step1Title", descKey: "home.step1Desc" },
  { icon: Sparkles, titleKey: "home.step2Title", descKey: "home.step2Desc" },
  { icon: Check, titleKey: "home.step3Title", descKey: "home.step3Desc" },
];

const fallbackGradients = [
  "from-neutral-900 via-neutral-800 to-neutral-950",
  "from-neutral-950 via-stone-900 to-neutral-800",
  "from-zinc-900 via-neutral-800 to-zinc-950",
  "from-neutral-800 via-stone-950 to-neutral-900",
  "from-stone-900 via-zinc-800 to-neutral-950",
];

export function HomeContent({ user }: { user: { name: string } | null }) {
  const { t } = useLocale();
  const featuresRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Navbar variant="home" user={user} />
      <main className="min-h-dvh">
        <section className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] via-transparent to-background pointer-events-none" />
          <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-foreground/[0.03] rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-foreground/[0.02] rounded-full blur-[120px] pointer-events-none" />

          {heroSlides.map((slide, i) => (
            <div
              key={slide.mode}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === activeSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              {!imgErrors.has(i) ? (
                <Image
                  src={slide.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  onError={() => setImgErrors((prev) => new Set(prev).add(i))}
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradients[i]}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
              <div className="absolute bottom-24 left-0 right-0 z-10 px-6 text-center animate-fade-in" key={i}>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {t(slide.titleKey)}
                </h2>
                <p className="text-sm sm:text-base text-white/70 max-w-md mx-auto drop-shadow">
                  {t(slide.taglineKey)}
                </p>
              </div>
            </div>
          ))}

          <div className="container-narrow px-6 text-center relative z-10">
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-foreground border border-border/20">
                <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
                {t("home.badge")}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto text-white drop-shadow-lg">
              {t("home.title1")} {t("home.title2")}
            </h1>

            <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed drop-shadow">
              {t("home.subtitle")}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href={user ? "/create" : "/register"}>
                <Button
                  size="lg"
                  className="gap-2 text-base h-12 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 hover:shadow-foreground/20 transition-all duration-300 active:scale-[0.97] font-medium"
                >
                  {t("home.cta")}
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full border-foreground/20 text-foreground hover:bg-foreground/5 hover:border-foreground/30 transition-all duration-300"
                onClick={() => showcaseRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                {t("home.learnMore")}
              </Button>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeSlide ? "bg-white w-6" : "bg-white/30 hover:bg-white/50 w-2"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] via-transparent to-background pointer-events-none" />
          <div className="container-narrow px-6 relative">
            <div className="text-center mb-10 animate-fade-in">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2">{t("scene.sectionTitle")}</h2>
            </div>
            <div className="relative max-w-4xl mx-auto">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-6 px-6" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                {studioCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        if (user) window.location.href = `/create?mode=${card.id}`;
                        else window.location.href = "/register";
                      }}
                      className="group relative rounded-[14px] bg-card border border-border/60 p-5 text-center cursor-pointer transition-all duration-300 hover:border-foreground/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 shrink-0 snap-start w-[70vw] sm:w-[220px]"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[14px]" />
                      <div className="relative">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-foreground mx-auto mb-3 group-hover:bg-foreground/10 group-hover:scale-110 transition-all duration-300">
                          <Icon size={18} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{t(card.titleKey)}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t(card.descKey)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none sm:hidden" />
            </div>
          </div>
        </section>

        <section ref={showcaseRef} className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-foreground/[0.02] to-background pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-foreground/[0.02] rounded-full blur-[120px] pointer-events-none" />
          <div className="container-narrow px-6 relative">
            <div className="text-center mb-14 animate-fade-in">
              <p className="text-xs font-medium text-foreground tracking-widest uppercase mb-3">{t("home.badge")}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.showcaseTitle")}</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t("home.showcaseDesc")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 auto-rows-[160px] lg:auto-rows-[200px]">
              {showcaseItems.map((item, i) => (
                <div
                  key={item.id}
                  className="relative rounded-[14px] overflow-hidden group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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

        <section ref={featuresRef} id="features" className="py-24">
          <div className="container-narrow px-6">
            <div className="text-center mb-14 animate-fade-in">
              <p className="text-xs font-medium text-foreground tracking-widest uppercase mb-3">{t("home.featuresTitle")}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.featuresSub")}</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.key}
                    className="group relative rounded-[14px] bg-card border border-border/60 p-6 hover:border-foreground/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 overflow-hidden animate-slide-up w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-foreground mb-4 group-hover:bg-foreground/10 group-hover:scale-110 transition-all duration-300">
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

        <section className="py-24 bg-gradient-to-b from-transparent via-foreground/[0.02] to-transparent border-y border-border/60">
          <div className="container-narrow px-6">
            <div className="text-center mb-14 animate-fade-in">
              <p className="text-xs font-medium text-foreground tracking-widest uppercase mb-3">{t("home.howItWorks")}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.howItWorksSub")}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="relative mb-4">
                      <div className="size-14 rounded-full bg-muted flex items-center justify-center text-foreground mx-auto">
                        <Icon size={22} />
                      </div>
                      {i < steps.length - 1 && (
                        <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-foreground/20 to-transparent" />
                      )}
                    </div>
                    <div className="inline-flex items-center justify-center size-6 rounded-full bg-foreground text-background text-xs font-bold mb-3">
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
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] via-transparent to-foreground/[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/[0.03] rounded-full blur-[150px] pointer-events-none" />
          <div className="container-narrow px-6 relative animate-slide-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">{t("home.readyTitle")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">{t("home.readySub")}</p>
            <Link href={user ? "/create" : "/register"}>
              <Button
                size="lg"
                className="gap-2 text-base h-12 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 hover:shadow-foreground/20 transition-all duration-300 active:scale-[0.97] font-medium"
              >
                {t("home.cta")}
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center">
        <div className="container-narrow px-6">
          <p className="text-xs text-muted-foreground/40">
            <span className="font-semibold">Imaginova</span> &mdash; {t("home.footer")}
          </p>
        </div>
      </footer>
    </>
  );
}
