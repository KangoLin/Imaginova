"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-sm text-muted-foreground">{t("common.loading")}</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}

function ResetForm() {
  const router = useRouter();
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError(t("auth.passwordsDoNotMatch")); return; }
    if (password.length < 6) { setError(t("auth.passwordMinLength")); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("auth.networkError"));
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm animate-slide-up text-center">
        <div className="bg-destructive/5 rounded-xl p-5">
          <p className="text-sm text-destructive">{t("auth.invalidResetLink")}</p>
          <Link href="/forgot-password" className="text-primary text-sm mt-3 inline-block hover:underline">{t("auth.requestNewResetLink")}</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-sm animate-slide-up text-center">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
          <p className="text-lg font-bold text-foreground">{t("auth.passwordReset")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("auth.passwordUpdated")}</p>
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground mt-4 hover:opacity-90">{t("auth.signIn")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="text-center mb-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
        <h1 className="text-2xl font-bold mt-6 mb-1">{t("auth.setNewPassword")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.setNewPasswordSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="password" placeholder={t("auth.passwordMinPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input type="password" placeholder={t("settings.confirmPasswordPlaceholder")} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}
        <Button type="submit" disabled={loading || !password || !confirm} className="w-full">{loading ? t("auth.resetting") : t("auth.resetPasswordBtn")}</Button>
      </form>
    </div>
  );
}
