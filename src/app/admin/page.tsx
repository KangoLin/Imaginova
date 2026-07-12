"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Stats {
  totalUsers: number; totalImages: number; totalVideos: number;
  totalCredits: number; totalSpent: number;
  dailyRegistrations: { date: string; count: number }[];
  dailyGenerations: { date: string; count: number }[];
  topUsers: { id: number; name: string; email: string; generations: number }[];
  keyUsage: { action: string; count: number; total_cost: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<Stats>("/api/admin/stats")
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container-narrow px-6 py-12 flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="container-narrow px-6 py-12 text-center">
      <p className="text-destructive font-medium">{t("admin.accessDenied")}</p>
      <button onClick={() => router.push("/dashboard")} className="mt-4 text-sm text-primary hover:underline">{t("admin.backToApp")}</button>
    </div>
  );

  if (!stats) return null;

  const statCards = [
    { label: t("admin.totalUsers"), value: stats.totalUsers, color: "border-l-chart-2" },
    { label: t("admin.totalImages"), value: stats.totalImages, color: "border-l-chart-4" },
    { label: t("admin.totalVideos"), value: stats.totalVideos, color: "border-l-chart-5" },
    { label: t("admin.totalCredits"), value: stats.totalCredits.toLocaleString(), color: "border-l-primary" },
    { label: t("admin.totalSpent"), value: stats.totalSpent.toLocaleString(), color: "border-l-accent" },
  ];

  const actionLabels: Record<string, string> = {
    image_generation: t("admin.imageGeneration"),
    video_generation: t("admin.videoGeneration"),
  };

  return (
    <div className="container-narrow px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{t("admin.overview")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("admin.overviewSubtitle")}</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-card rounded-lg p-4 border border-border/60 ${card.color} border-l-4`}>
            <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-card rounded-lg border border-border/60 p-5">
          <h2 className="text-sm font-semibold mb-4">{t("admin.dailyRegistrations")}</h2>
          <div className="flex items-end gap-1 h-32">
            {stats.dailyRegistrations.map((d) => {
              const max = Math.max(...stats.dailyRegistrations.map((r) => r.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{d.count}</span>
                  <div className="w-full bg-primary/20 rounded-t" style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }} />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border/60 p-5">
          <h2 className="text-sm font-semibold mb-4">{t("admin.dailyGenerations")}</h2>
          <div className="flex items-end gap-1 h-32">
            {stats.dailyGenerations.map((d) => {
              const max = Math.max(...stats.dailyGenerations.map((r) => r.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{d.count}</span>
                  <div className="w-full bg-chart-4/60 rounded-t" style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }} />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border/60 p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">{t("admin.keyUsage")}</h2>
        <div className="space-y-2">
          {stats.keyUsage.map((k) => (
            <div key={k.action} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
              <span className="text-sm">{actionLabels[k.action] || k.action}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{k.count} {t("admin.times")}</span>
                <span className="font-medium">{k.total_cost} {t("admin.creditsCost")}</span>
              </div>
            </div>
          ))}
          {stats.keyUsage.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("admin.noUsage")}</p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border/60 p-5">
        <h2 className="text-sm font-semibold mb-4">{t("admin.topUsers")}</h2>
        <div className="space-y-2">
          {stats.topUsers.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-5 text-xs text-muted-foreground font-medium">#{i + 1}</span>
                <span className="text-sm font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </div>
              <span className="text-sm text-muted-foreground">{u.generations} {t("admin.generations")}</span>
            </div>
          ))}
          {stats.topUsers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("admin.noUsers")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
