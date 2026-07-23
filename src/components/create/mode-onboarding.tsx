"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Shirt, Paintbrush, VenusAndMars, UserCog } from "lucide-react";

interface ModeOnboardingProps {
  mode: "try-on" | "style-transfer" | "gender-swap" | "age-transform";
  onDismiss: () => void;
}

const MODE_DATA: Record<ModeOnboardingProps["mode"], { icon: typeof Shirt; descKey: string; accent: string }> = {
  "try-on": { icon: Shirt, descKey: "scene.tryOnDesc", accent: "from-pink-500/20 via-purple-500/10 to-transparent" },
  "style-transfer": { icon: Paintbrush, descKey: "scene.styleTransferDesc", accent: "from-amber-500/20 via-orange-500/10 to-transparent" },
  "gender-swap": { icon: VenusAndMars, descKey: "scene.genderSwapDesc", accent: "from-blue-500/20 via-cyan-500/10 to-transparent" },
  "age-transform": { icon: UserCog, descKey: "scene.ageTransformDesc", accent: "from-emerald-500/20 via-teal-500/10 to-transparent" },
};

export function ModeOnboarding({ mode, onDismiss }: ModeOnboardingProps) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = `imaginova-onboarded-${mode}`;
    if (sessionStorage.getItem(key)) {
      onDismiss();
      return;
    }
    requestAnimationFrame(() => setVisible(true));
  }, [mode, onDismiss]);

  function handleStart() {
    sessionStorage.setItem(`imaginova-onboarded-${mode}`, "1");
    setVisible(false);
    setTimeout(onDismiss, 200);
  }

  if (!visible) return null;

  const data = MODE_DATA[mode];

  return (
    <div className={`transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="relative overflow-hidden rounded-[14px] border border-border/60 bg-card p-8 text-center">
        <div className={`absolute inset-0 bg-gradient-to-br ${data.accent} opacity-60`} />
        <div className="relative">
          <div className="mx-auto size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <data.icon size={32} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">
            {mode === "try-on" ? t("scene.tryOn") : mode === "style-transfer" ? t("scene.styleTransfer") : mode === "gender-swap" ? t("scene.genderSwap") : t("scene.ageTransform")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{t(data.descKey)}</p>
          <Button onClick={handleStart} size="lg" className="gap-2">
            {t("scene.start") || "开始使用"}
          </Button>
        </div>
      </div>
    </div>
  );
}
