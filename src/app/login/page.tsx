"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

export default function LoginPage() {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("error");
    if (e) setError(e);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_60%)] opacity-8 pointer-events-none" />
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
      </div>
      <Card className="w-full max-w-sm animate-scale-in shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl font-bold">{t("auth.welcomeBack")}</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-0.5">{t("auth.signInSubtitle")}</p>
        </CardHeader>
        <CardContent>
          <form action="/api/login?redirect=/dashboard" method="POST" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.email")}</label>
              <Input id="email" name="email" type="email" required placeholder={t("auth.emailPlaceholder")} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.password")}</label>
              <Input id="password" name="password" type="password" required placeholder={t("auth.passwordPlaceholder")} />
              <div className="text-right"><Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary hover:underline">{t("auth.forgotPassword")}</Link></div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              {t("auth.signIn")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">{t("auth.signUp")}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
