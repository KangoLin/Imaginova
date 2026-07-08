"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    setMessage("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
      <Link href="/dashboard" className="text-[var(--primary)] underline text-sm">&larr; Back to Dashboard</Link>

      <h1 className="text-2xl font-bold mt-6 mb-6">Settings</h1>

      <div className="bg-[var(--bg)] rounded-xl shadow-sm border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        {message && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm animate-fade-in">{message}</div>}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm animate-fade-in">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted-fg)] mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--fg)] focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-fg)] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--fg)] focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-fg)] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--fg)] focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[var(--primary)] text-[var(--primary-fg)] rounded-md py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
