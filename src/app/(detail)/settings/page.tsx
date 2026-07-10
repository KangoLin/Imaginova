"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

export default function SettingsPage() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast(t("settings.passwordsDoNotMatch"), "error");
      return;
    }

    setSaving(true);
    try {
      await api.put("/api/settings/password", { currentPassword, newPassword });
      toast(t("settings.passwordChanged"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, "error");
    }
    setSaving(false);
  };

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-1">{t("settings.title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("settings.subtitle")}</p>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.changePassword")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">{t("settings.currentPassword")}</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder={t("settings.currentPasswordPlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">{t("settings.newPassword")}</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder={t("settings.newPasswordPlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">{t("settings.confirmPassword")}</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder={t("settings.confirmPasswordPlaceholder")} />
                </div>
                <Button type="submit" disabled={saving} className="w-full h-11 gap-2">
                  {saving && <LoadingSpinner />}
                  {saving ? t("settings.saving") : t("settings.changePassword")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}
