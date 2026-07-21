"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; resetLink?: string } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<{ message: string; resetLink: string }>("/api/auth/forgot-password", { email });
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("auth.networkError"));
    }
    setLoading(false);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <h1 className="text-2xl font-bold mt-6 mb-1">{t("auth.resetPassword")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.resetPasswordSubtitle")}</p>
        </div>

        {result ? (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 text-sm space-y-3">
            <p className="text-foreground font-medium">{result.message}</p>
            <p className="text-xs text-muted-foreground">{t("auth.resetLinkNote")}</p>
            <code className="block text-xs bg-muted p-2 rounded break-all">{result.resetLink}</code>
            <Link href="/login" className="block text-center text-primary text-sm mt-3 hover:underline">{t("auth.backToSignIn")}</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}
            <Button type="submit" disabled={loading || !email.trim()} className="w-full">{loading ? t("auth.sending") : t("auth.sendResetLink")}</Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">{t("auth.backToSignIn")}</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
