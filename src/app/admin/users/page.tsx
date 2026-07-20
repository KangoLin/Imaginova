"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number; name: string; email: string; credits: number;
  role: string; created_at: string;
  image_count: number; video_count: number;
}

export default function AdminUsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ items: User[]; total: number }>(`/api/admin/users?limit=${limit}&offset=${offset}`);
      if (offset === 0) setUsers(data.items);
      else setUsers((prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [offset]);

  return (
    <div className="container-narrow px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{t("admin.users")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("admin.usersSubtitle", { total })}</p>
      {users.length === 0 && loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : (
        <div className="bg-card rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-xs">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">{t("auth.name")}</th>
                  <th className="text-left p-3 font-medium">{t("auth.email")}</th>
                  <th className="text-right p-3 font-medium">{t("dashboard.credits")}</th>
                  <th className="text-center p-3 font-medium">{t("admin.role")}</th>
                  <th className="text-right p-3 font-medium">{t("dashboard.images")}</th>
                  <th className="text-right p-3 font-medium">{t("dashboard.videos")}</th>
                  <th className="text-right p-3 font-medium">{t("common.created")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60 hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground text-xs">{u.id}</td>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-right font-medium">{u.credits}</td>
                    <td className="p-3 text-center">
                      <Badge variant={u.role === "admin" ? "default" : "outline"} className="text-[10px] px-1.5">
                        {u.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{u.image_count}</td>
                    <td className="p-3 text-right text-muted-foreground">{u.video_count}</td>
                    <td className="p-3 text-right text-muted-foreground text-xs">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {users.length < total && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setOffset((o) => o + limit)} disabled={loading} className="text-sm text-primary hover:underline disabled:opacity-50">
            {t("dashboard.loadMore")} ({users.length}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
