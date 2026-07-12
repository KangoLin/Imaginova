"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Item {
  id: number; prompt: string; url: string | null; model: string;
  user_id: number; user_name: string; user_email: string;
  flagged: number; reported: number; reviewed: number;
  created_at: string; status?: string;
}

export default function ModerationPage() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [tab, setTab] = useState<"all" | "images" | "videos">("all");
  const [filter, setFilter] = useState<"all" | "reported" | "flagged" | "unreviewed">("unreviewed");
  const [images, setImages] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [imageTotal, setImageTotal] = useState(0);
  const [videoTotal, setVideoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Item | null>(null);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await api.get<{ images: { items: Item[]; total: number }; videos: { items: Item[]; total: number } }>(
        `/api/admin/items?type=${tab}&filter=${filter}&limit=50`
      );
      setImages(data.images.items);
      setImageTotal(data.images.total);
      setVideos(data.videos.items);
      setVideoTotal(data.videos.total);
    } catch { toast(t("admin.loadFailed"), "error"); }
    setLoading(false);
  }

  useEffect(() => { loadItems(); }, [tab, filter]);

  async function handleAction(item: Item, type: "image" | "video", action: string) {
    try {
      await api.patch(`/api/admin/items/${item.id}`, { type, action });
      toast(action === "flag" ? t("admin.flagSuccess") : action === "unflag" ? t("admin.unflagSuccess") : t("admin.deleteSuccess"), "success");
      loadItems();
    } catch { toast(t("admin.actionFailed"), "error"); }
  }

  function renderItem(item: Item, type: "image" | "video") {
    const isVideo = type === "video";
    return (
      <div key={`${type}-${item.id}`} className="bg-card rounded-lg border border-border/60 overflow-hidden hover:shadow-sm transition-shadow">
        <div className="aspect-[4/3] bg-muted relative cursor-pointer overflow-hidden" onClick={() => setPreview(item)}>
          {item.url && !isVideo ? (
            <Image src={item.url} alt={item.prompt} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
          ) : item.url && isVideo ? (
            <video src={`/api/proxy/video?url=${encodeURIComponent(item.url)}`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">{item.status || "no preview"}</div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            {item.reported === 1 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("admin.reported")}</Badge>}
            {item.flagged === 1 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("admin.flagged")}</Badge>}
            {item.reviewed === 0 && item.flagged === 0 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">{t("admin.pending")}</Badge>}
          </div>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-xs font-medium truncate" title={item.prompt}>{item.prompt}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{item.user_name}</span>
            <span>&middot;</span>
            <span>{item.created_at}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleAction(item, type, item.flagged === 1 ? "unflag" : "flag")}>
              {item.flagged === 1 ? t("admin.unflag") : t("admin.flag")}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={() => {
              if (window.confirm(t("admin.deleteConfirm"))) handleAction(item, type, "delete");
            }}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{t("admin.moderation")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.moderationSubtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadItems} disabled={loading}>{t("admin.refresh")}</Button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="unreviewed">{t("admin.unreviewed")}</TabsTrigger>
            <TabsTrigger value="reported">{t("admin.reported")}</TabsTrigger>
            <TabsTrigger value="flagged">{t("admin.flagged")}</TabsTrigger>
            <TabsTrigger value="all">{t("admin.all")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">{t("admin.allItems")}</TabsTrigger>
            <TabsTrigger value="images">{t("dashboard.images")}</TabsTrigger>
            <TabsTrigger value="videos">{t("dashboard.videos")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
      ) : (
        <>
          {(tab === "all" || tab === "images") && (
            <div className="mb-8">
              {tab === "all" && <h2 className="text-sm font-semibold mb-3 text-muted-foreground">{t("dashboard.images")} ({imageTotal})</h2>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((item) => renderItem(item, "image"))}
              </div>
              {images.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("admin.noItems")}</p>}
            </div>
          )}
          {(tab === "all" || tab === "videos") && (
            <div>
              {tab === "all" && <h2 className="text-sm font-semibold mb-3 text-muted-foreground">{t("dashboard.videos")} ({videoTotal})</h2>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {videos.map((item) => renderItem(item, "video"))}
              </div>
              {videos.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("admin.noItems")}</p>}
            </div>
          )}
        </>
      )}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreview(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 z-10 size-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
            {preview.url ? (
              preview.status !== undefined ? (
                <video src={`/api/proxy/video?url=${encodeURIComponent(preview.url)}`} controls autoPlay className="max-w-full max-h-[90vh] mx-auto" />
              ) : (
                <Image src={preview.url} alt={preview.prompt} width={1024} height={768} className="max-w-full max-h-[90vh] object-contain mx-auto" />
              )
            ) : (
              <div className="text-muted-foreground text-center py-20">{t("common.loading")}</div>
            )}
            <div className="bg-card p-4">
              <p className="text-sm font-medium">{preview.prompt}</p>
              <p className="text-xs text-muted-foreground mt-1">{preview.user_name} ({preview.user_email}) &middot; {preview.created_at}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
