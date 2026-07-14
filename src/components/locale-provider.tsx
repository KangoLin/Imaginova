"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import enMessages from "@/locales/en.json";
import zhMessages from "@/locales/zh.json";

type Locale = "en" | "zh";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const allMessages: Record<Locale, Record<string, string>> = {
  en: enMessages,
  zh: zhMessages,
};

const LocaleContext = createContext<LocaleContextValue>(null!);

const STORAGE_KEY = "imaginova-locale";

function tImpl(messages: Record<string, string>, key: string, params?: Record<string, string | number>): string {
  let val = messages[key];
  if (val === undefined) val = key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(`{${k}}`, String(v));
    }
  }
  return val;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      return saved === "en" || saved === "zh" ? saved : "zh";
    }
    return "zh";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return tImpl(allMessages[locale], key, params);
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
