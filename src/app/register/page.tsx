"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

const ERROR_MAP: Record<string, string> = {
  all_fields_required: "auth.allFieldsRequired",
  invalid_email_format: "auth.invalidEmailFormat",
  invalid_email_domain: "auth.invalidEmailDomain",
  email_domain_unverifiable: "auth.emailDomainUnverifiable",
  email_already_registered: "auth.emailAlreadyRegistered",
  send_code_too_soon: "auth.sendCodeTooSoon",
  send_code_failed: "auth.sendCodeFailed",
  code_not_sent: "auth.codeNotSent",
  code_already_used: "auth.codeAlreadyUsed",
  code_mismatch: "auth.codeMismatch",
  code_expired: "auth.codeExpired",
};

const CLIENT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  function getErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
      const code = err.message;
      const key = ERROR_MAP[code];
      if (key) return t(key);
    }
    return t("auth.registrationFailed");
  }

  function startCountdown() {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    const form = document.querySelector<HTMLFormElement>("form");
    if (!form) return;
    const email = new FormData(form).get("email") as string;

    if (!CLIENT_EMAIL_REGEX.test(email)) {
      setError(t("auth.invalidEmailFormat"));
      return;
    }

    setSendingCode(true);
    setError("");
    try {
      await api.post("/api/auth/send-code", { email });
      startCountdown();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    if (!CLIENT_EMAIL_REGEX.test(email)) {
      setError(t("auth.invalidEmailFormat"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/register", {
        name: form.get("name"),
        email,
        password: form.get("password"),
        code: form.get("code"),
      });
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_60%)] opacity-8 pointer-events-none" />
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
      </div>
      <Card className="w-full max-w-sm animate-scale-in shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl font-bold">{t("auth.createAccount")}</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-0.5">{t("auth.createAccountSubtitle")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.email")}</label>
              <div className="flex gap-2">
                <Input id="email" name="email" type="email" required placeholder={t("auth.emailPlaceholder")} className="flex-1" />
                <Button type="button" variant="outline" onClick={handleSendCode} disabled={sendingCode || countdown > 0} className="shrink-0">
                  {countdown > 0 ? `${countdown}s` : sendingCode ? t("auth.sending") : t("auth.sendCode")}
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.verificationCode")}</label>
              <Input id="code" name="code" inputMode="numeric" maxLength={6} required placeholder={t("auth.codePlaceholder")} />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.name")}</label>
              <Input id="name" name="name" required placeholder={t("auth.namePlaceholder")} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.password")}</label>
              <Input id="password" name="password" type="password" required minLength={6} placeholder={t("auth.passwordMinPlaceholder")} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("auth.creating") : t("auth.createAccount")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">{t("auth.signIn")}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
