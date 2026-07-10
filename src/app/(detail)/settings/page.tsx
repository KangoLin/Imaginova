"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    setSaving(true);
    try {
      await api.put("/api/settings/password", { currentPassword, newPassword });
      toast("Password changed successfully", "success");
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
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm mb-8">Manage your account</p>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="Repeat new password" />
                </div>
                <Button type="submit" disabled={saving} className="w-full h-11 gap-2">
                  {saving && <LoadingSpinner />}
                  {saving ? "Saving..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}
