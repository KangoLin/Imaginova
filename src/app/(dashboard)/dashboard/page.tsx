"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { GridSkeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/components/locale-provider";

type Tab = "images" | "videos";
const PAGE_SIZE = 12;

interface UserData { name: string; email: string; credits: number; }
interface ImageItem { id: number; prompt: string; model: string; url: string; created_at: string; }
interface VideoItem { id: number; prompt: string; model: string; status: string; url: string | null; progress: number; created_at: string; }
interface PageData<T> { items: T[]; total: number; }
interface TaskItem { key: string; reward: number; completed: boolean; conditionMet: boolean; progress: { current: number; total: number }; }

function ImageLightbox({ img, images, onClose, onNavigate }: {
  img: ImageItem; images: ImageItem[]; onClose: () => void; onNavigate: (img: ImageItem) => void;
}) {
  const { t } = useLocale();
  const idx = images.findIndex((i) => i.id === img.id);
  const prev = idx > 0 ? images[idx - 1] : null;
  const next = idx < images.length - 1 ? images[idx + 1] : null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 150);
  }, [onClose]);

  function trapFocus(e: KeyboardEvent) {
    if (e.key !== "Tab" || !containerRef.current) return;
    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
    if (e.key === "Tab") { trapFocus(e); }
    if (e.key === "ArrowLeft" && prev) onNavigate(prev);
    if (e.key === "ArrowRight" && next) onNavigate(next);
  }, [handleClose, onNavigate, prev, next]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [handleKey]);

  return (
    <div ref={containerRef} tabIndex={-1} className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 ${closing ? "animate-fade-out pointer-events-none" : "animate-fade-in"}`} onClick={handleClose}>
      <div className={`relative max-w-4xl w-full max-h-[90vh] md:max-h-[90vh] flex flex-col overflow-hidden ${closing ? "animate-scale-out" : "animate-scale-in"}`} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/60 to-transparent rounded-t-xl">
          <span className="text-xs text-white/80">{idx + 1}/{images.length}</span>
          <button onClick={handleClose} className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>
        </div>
        <div className="relative flex-1 flex items-center justify-center bg-black/40 min-h-[50vh] max-h-[70vh]">
          <Image src={img.url} alt={img.prompt} fill className="object-contain" sizes="90vw" />
          {prev && <button onClick={() => onNavigate(prev)} className="absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all" aria-label="Previous"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>}
          {next && <button onClick={() => onNavigate(next)} className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all" aria-label="Next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>}
        </div>
        <div className="bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 w-full sm:w-auto">
            <p className="text-sm font-medium truncate">{img.prompt}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{img.model} &middot; {img.created_at}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="secondary" onClick={() => window.open(`/image/${img.id}`, "_blank")} className="flex-1 sm:flex-none">{t("dashboard.viewDetails")}</Button>
            <Button size="sm" variant="ghost" onClick={handleClose} className="flex-1 sm:flex-none">{t("dashboard.close")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ vid, onClose }: { vid: VideoItem; onClose: () => void }) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 150);
  }, [onClose]);

  function trapFocus(e: KeyboardEvent) {
    if (e.key !== "Tab" || !containerRef.current) return;
    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
    if (e.key === "Tab") { trapFocus(e); }
  }, [handleClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [handleKey]);

  return (
    <div ref={containerRef} tabIndex={-1} className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 ${closing ? "animate-fade-out pointer-events-none" : "animate-fade-in"}`} onClick={handleClose}>
      <div className={`relative max-w-3xl w-full max-h-[90vh] md:max-h-[90vh] flex flex-col overflow-hidden ${closing ? "animate-scale-out" : "animate-scale-in"}`} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end px-4 py-2 bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={handleClose} className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>
        </div>
        <div className="relative flex-1 flex items-center justify-center bg-black/40 min-h-[50vh]">
          {vid.status === "completed" && vid.url ? (
            <video src={`/api/proxy/video?url=${encodeURIComponent(vid.url)}`} controls autoPlay className="max-w-full max-h-[70vh]" />
          ) : (
            <div className="text-muted-foreground text-sm">{vid.status === "processing" ? t("video.processing", { progress: vid.progress }) : t("video.statusLabel", { status: vid.status })}</div>
          )}
        </div>
        <div className="bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 w-full sm:w-auto">
            <p className="text-sm font-medium truncate">{vid.prompt}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{vid.model} &middot; {vid.created_at}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="secondary" onClick={() => window.open(`/video/${vid.id}`, "_blank")} className="flex-1 sm:flex-none">{t("dashboard.viewDetails")}</Button>
            <Button size="sm" variant="ghost" onClick={handleClose} className="flex-1 sm:flex-none">{t("dashboard.close")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ONBOARDING_KEY = "imaginova-onboarded";

const WELCOME_FEATURES = [
  { icon: "sparkles", title: "Generate Images & Videos", desc: "Describe what you want in natural language — AI brings it to life." },
  { icon: "grid", title: "Browse Your Works", desc: "All your creations in one place. Click any thumbnail for a full preview." },
  { icon: "star", title: "Earn & Spend Credits", desc: "Check in daily for free credits. Use them to generate more content." },
] as const;

function FeatureIcon({ icon }: { icon: string }) {
  const paths: Record<string, string> = {
    sparkles: "M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83",
    grid: "M3 6h18M21 12H3M3 18h18",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  };
  return <path d={paths[icon] || paths.sparkles} />;
}

function WelcomeModal({ onDismiss }: { onDismiss: () => void }) {
  const [closing, setClosing] = useState(false);
  function handleDismiss() {
    setClosing(true);
    setTimeout(onDismiss, 150);
  }
  return (
    <div className={`fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 ${closing ? "animate-fade-out pointer-events-none" : "animate-fade-in"}`} onClick={handleDismiss}>
      <div className={`bg-card rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-border/60 ${closing ? "animate-scale-out" : "animate-slide-up"}`} onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83"/></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Imaginova!</h2>
        <p className="text-sm text-muted-foreground mb-6">Your AI creative studio. Here&apos;s what you can do:</p>

        <div className="space-y-4 mb-8">
          {WELCOME_FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><FeatureIcon icon={f.icon} /></svg>
              </div>
              <div><p className="text-sm font-medium">{f.title}</p><p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p></div>
            </div>
          ))}
        </div>

        <Button onClick={handleDismiss} className="w-full">Get Started</Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("images");
  const [user, setUser] = useState<UserData | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [imageTotal, setImageTotal] = useState(0);
  const [videoTotal, setVideoTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) setShowWelcome(true);
  }, []);
  const searchRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.get<TaskItem[]>("/api/tasks").then(setTasks).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const [me, imgData, vidData] = await Promise.all([
          api.get<UserData>("/api/me"),
          api.get<PageData<ImageItem>>(`/api/me/images?limit=${PAGE_SIZE}&offset=0`),
          api.get<PageData<VideoItem>>(`/api/me/videos?limit=${PAGE_SIZE}&offset=0`),
        ]);
        setUser(me);
        setImages(imgData.items); setImageTotal(imgData.total);
        setVideos(vidData.items); setVideoTotal(vidData.total);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw err;
      }
      setLoading(false);
    })();
  }, []);

  const handleCheckin = async () => {
    try {
      const data = await api.post<{ reward: number; credits: number; streak: number }>("/api/credits/checkin");
      toast(t("toast.checkedIn", { reward: data.reward, streak: data.streak }), "success");
      setUser((prev) => prev ? { ...prev, credits: data.credits } : prev);
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, "error");
    }
  };

  const sortedImages = useMemo(() => [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [images]);
  const sortedVideos = useMemo(() => [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [videos]);

  if (loading) {
    return (
      <div className="container-narrow px-6 py-12">
        <div className="mb-8"><div className="h-8 w-36 bg-muted rounded animate-pulse mb-2" /><div className="h-4 w-52 bg-muted rounded animate-pulse" /></div>
        <div className="flex gap-1 mb-6 border-b border-border"><div className="h-8 w-20 bg-muted rounded-t animate-pulse" /><div className="h-8 w-20 bg-muted rounded-t animate-pulse" /></div>
        <GridSkeleton count={6} />
      </div>
    );
  }

  if (!user) return null;

  async function handleDeleteItem(id: number, type: Tab, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(type === "images" ? t("dashboard.deleteConfirmImage") : t("dashboard.deleteConfirmVideo"))) return;
    setDeletingItems((prev) => new Set(prev).add(id));
    try {
      await api.delete(`/api/${type.slice(0, -1)}/${id}`);
      if (type === "images") { setImages((prev) => prev.filter((i) => i.id !== id)); setImageTotal((prev) => prev - 1); }
      else { setVideos((prev) => prev.filter((v) => v.id !== id)); setVideoTotal((prev) => prev - 1); }
      if (selectedImage?.id === id) setSelectedImage(null);
      if (selectedVideo?.id === id) setSelectedVideo(null);
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, "error");
    }
    setDeletingItems((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function loadMore() {
    setLoadingMore(true);
    const offset = tab === "images" ? images.length : videos.length;
    const data = await api.get<PageData<ImageItem & VideoItem>>(`/api/me/${tab}?limit=${PAGE_SIZE}&offset=${offset}`);
    if (tab === "images") { setImages((prev) => [...prev, ...(data.items as ImageItem[])]); } else { setVideos((prev) => [...prev, ...(data.items as VideoItem[])]); }
    setLoadingMore(false);
  }

  const rawItems = tab === "images" ? images : videos;
  const query = search.toLowerCase();
  const filteredItems = rawItems.filter((item) => item.prompt.toLowerCase().includes(query));
  const currentTotal = tab === "images" ? imageTotal : videoTotal;
  const hasMore = rawItems.length < currentTotal;

  async function handleClaimTask(taskKey: string) {
    setClaimingTask(taskKey);
    try {
      const data = await api.post<{ credits: number; reward: number }>("/api/tasks", { taskKey });
      toast(t("toast.taskCompleted", { reward: data.reward }), "success");
      setUser((prev) => prev ? { ...prev, credits: data.credits } : prev);
      setTasks((prev) => prev.map((t) => t.key === taskKey ? { ...t, completed: true } : t));
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, "error");
    }
    setClaimingTask(null);
  }

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-fade-in">
        {showWelcome && <WelcomeModal onDismiss={() => { localStorage.setItem(ONBOARDING_KEY, "1"); setShowWelcome(false); }} />}
        {selectedImage && (
          <ImageLightbox
            img={selectedImage}
            images={sortedImages}
            onClose={() => setSelectedImage(null)}
            onNavigate={setSelectedImage}
          />
        )}
        {selectedVideo && <VideoModal vid={selectedVideo} onClose={() => setSelectedVideo(null)} />}

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{t("dashboard.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCheckin} className="border-accent/30 text-accent hover:bg-accent/10 hover:text-accent">{t("dashboard.checkIn")}</Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-lg p-4 border border-border/60 border-l-chart-2 border-l-4">
            <p className="text-xs text-muted-foreground font-medium">{t("dashboard.images")}</p>
            <p className="text-xl font-bold mt-0.5 text-chart-2">{imageTotal}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border/60 border-l-chart-4 border-l-4">
            <p className="text-xs text-muted-foreground font-medium">{t("dashboard.videos")}</p>
            <p className="text-xl font-bold mt-0.5 text-chart-4">{videoTotal}</p>
          </div>
          <Link href="/credits" className="bg-card rounded-lg p-4 border border-border/60 border-l-chart-5 border-l-4 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 block">
            <p className="text-xs text-muted-foreground font-medium">{t("dashboard.credits")}</p>
            <p className="text-xl font-bold mt-0.5 text-chart-5">{user.credits}</p>
          </Link>
        </div>

        {tasks.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("tasks.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((task) => {
                const label = t(`tasks.${task.key}` as any);
                const desc = t(`tasks.${task.key}_desc` as any);
                return (
                  <div key={task.key} className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${task.completed ? 'bg-muted/30 opacity-60' : 'hover:bg-muted/50'}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{task.completed ? <span className="line-through">{label}</span> : label}</p>
                        <span className="text-xs font-semibold text-primary">+{task.reward}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.completed ? t("tasks.completed") : `${desc} (${task.progress.current}/${task.progress.total})`}
                      </p>
                    </div>
                    {!task.completed && task.conditionMet && (
                      <Button size="sm" variant="default" onClick={() => handleClaimTask(task.key)} disabled={claimingTask === task.key} className="ml-3 shrink-0">
                        {claimingTask === task.key ? <LoadingSpinner size="sm" /> : t("tasks.claim")}
                      </Button>
                    )}
                    {!task.completed && !task.conditionMet && (
                      <span className="text-xs text-muted-foreground ml-3 shrink-0">{t("tasks.locked")}</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3 mb-6">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setSearch(""); }}>
            <TabsList variant="line">
              <TabsTrigger value="images">{t("dashboard.images")} ({imageTotal})</TabsTrigger>
              <TabsTrigger value="videos">{t("dashboard.videos")} ({videoTotal})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative ml-auto max-w-56">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <Input
              ref={searchRef}
              type="text"
              placeholder={t("dashboard.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {tab === "images" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedImages.filter((i) => i.prompt.toLowerCase().includes(query)).map((img) => (
              <Card key={img.id} className="relative group overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer" onClick={() => setSelectedImage(img)}>
                <div className="aspect-[4/3] overflow-hidden bg-muted relative"><Image src={img.url} alt={img.prompt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 33vw" /></div>
                <button
                  onClick={(e) => handleDeleteItem(img.id, "images", e)}
                  disabled={deletingItems.has(img.id)}
                  className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  {deletingItems.has(img.id) ? <LoadingSpinner size="sm" /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
                </button>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{img.prompt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">{img.model}</Badge>
                    <span className="text-xs text-muted-foreground">{img.created_at}</span>
                  </div>
                </div>
              </Card>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-16">
                <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <p className="text-muted-foreground text-sm mb-4">{search ? t("dashboard.noImagesSearch") : t("dashboard.noImages")}</p>
                {!search && <Link href="/create" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]">{t("dashboard.createFirstImage")}</Link>}
              </div>
            )}
          </div>
        )}

        {tab === "videos" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedVideos.filter((v) => v.prompt.toLowerCase().includes(query)).map((vid) => (
              <Card key={vid.id} className="relative group overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer" onClick={() => setSelectedVideo(vid)}>
                {vid.status === "completed" && vid.url ? (
                  <div className="aspect-[4/3] overflow-hidden bg-muted"><video src={`/api/proxy/video?url=${encodeURIComponent(vid.url)}`} preload="metadata" muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    {vid.status === "processing" ? `Processing (${vid.progress}%)` : vid.status}
                  </div>
                )}
                <button
                  onClick={(e) => handleDeleteItem(vid.id, "videos", e)}
                  disabled={deletingItems.has(vid.id)}
                  className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  {deletingItems.has(vid.id) ? <LoadingSpinner size="sm" /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
                </button>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{vid.prompt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">{vid.model}</Badge>
                    <span className="text-xs text-muted-foreground">{vid.created_at}</span>
                    {vid.status !== "completed" && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{vid.status}</Badge>}
                  </div>
                </div>
              </Card>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-16">
                <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                <p className="text-muted-foreground text-sm mb-4">{search ? t("dashboard.noVideosSearch") : t("dashboard.noVideos")}</p>
                {!search && <Link href="/create" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]">{t("dashboard.createFirstVideo")}</Link>}
              </div>
            )}
          </div>
        )}

        {!search && hasMore && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="gap-2 min-w-[140px]">
              {loadingMore && <LoadingSpinner />}
              {loadingMore ? t("dashboard.loading") : `${t("dashboard.loadMore")} (${rawItems.length}/${currentTotal})`}
            </Button>
          </div>
        )}
      </main>
  );
}
