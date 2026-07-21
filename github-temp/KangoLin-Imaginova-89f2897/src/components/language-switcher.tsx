"use client";

import { useLocale } from "@/components/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
      title={locale === "en" ? t("locale.zh") : t("locale.en")}
    >
      {locale === "en" ? t("locale.zh") : t("locale.en")}
    </button>
  );
}
