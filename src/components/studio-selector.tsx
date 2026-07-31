"use client";

import { useLocale } from "@/components/locale-provider";
import { Shirt, Sparkles } from "lucide-react";

const STUDIO_OPTIONS = [
  { id: "try-on", icon: Shirt, labelKey: "studio.fashion", descKey: "studio.fashionDesc", gradient: "from-primary/10 via-accent/5 to-transparent" },
  { id: "general", icon: Sparkles, labelKey: "studio.general", descKey: "studio.generalDesc", gradient: "from-primary/10 via-accent/5 to-transparent" },
];

export function StudioSelector({ onSelect }: { onSelect: (mode: string) => void }) {
  const { t } = useLocale();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">{t("studio.title")}</h2>
      </div>
      <div className="grid gap-4 max-w-lg mx-auto">
        {STUDIO_OPTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className="group relative rounded-[14px] bg-card border border-border/60 p-5 text-left transition-all duration-300 hover:border-primary/25 hover:-translate-y-0.5 overflow-hidden cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{t(s.labelKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(s.descKey)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
