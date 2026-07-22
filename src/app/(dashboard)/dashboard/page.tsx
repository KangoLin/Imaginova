"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { GridSkeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLocale } from "@/components/locale-provider";
import { Search, Trash2, ImageIcon, Video, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type Tab = "images" | "videos";
const PAGE_SIZE = 12;
const ONBOARDING_KEY = "imaginova-onboarded";

interface UserData { name: string; email: string; credits: number; }
interface ImageItem { id: number; prompt: string; model: string; url: string; created_at: string; }
interface VideoItem { id: number; prompt: string; model: string; status: string; url: string | null; progress: number; created_at: string; }
interface PageData<T> { items: T[]; total: number; }
interface TaskItem { key: string; reward: number; completed: boolean; conditionMet: boolean; progress: { current: number; total: number }; }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function ImageLightbox({ img, images, onClose, onNavigate }: {
  img: ImageItem; images: ImageItem[]; onClose: () => void; onNavigate: (img: ImageItem) => void;
}) {
  const { t } = useLocale();
  const idx = images.findIndex((i) => i.id === img.id);
  const prev = idx > 0 ? images[idx - 1] : null;
  const next = idx < images.length - 1 ? images[idx + 1] : null;
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 bg-card" showCloseButton={false}>
        <DialogTitle className="sr-only">{img.prompt}</DialogTitle>
        <DialogDescription className="sr-only">{t("dashboard.viewDetails")}</DialogDescription>
        <div className="relative flex items-center justify-center bg-black/50 min-h-[50dvh] max-h-[80dvh]">
          <Image src={img.url} alt={img.prompt} fill className="object-contain" sizes="90vw" />
          {prev && <button onClick={() => onNavigate(prev)} className="absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all" aria-label="Previous"><ChevronLeft size={18} /></button>}
          {next && <button onClick={() => onNavigate(next)} className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all" aria-label="Next"><ChevronRight size={18} /></button>}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{img.prompt}</p>
                <p className="text-xs text-white/60 mt-0.5">{img.model} &middot; {img.created_at}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm" onClick={() => window.open(`/image/${img.id}`, "_blank")}>{t("dashboard.viewDetails")}</Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={onClose}>{t("dashboard.close")}</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VideoModal({ vid, onClose }: { vid: VideoItem; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 bg-card" showCloseButton={false}>
        <DialogTitle className="sr-only">{vid.prompt}</DialogTitle>
        <DialogDescription className="sr-only">{t("dashboard.viewDetails")}</DialogDescription>
        <div className="relative flex items-center justify-center bg-black/50 min-h-[50dvh] max-h-[80dvh]">
          {vid.status === "completed" && vid.url ? (
            <video src={`/api/proxy/video?url=${encodeURIComponent(vid.url)}`} controls autoPlay playsInline muted className="max-w-full max-h-[70dvh]" />
          ) : (
            <div className="text-muted-foreground text-sm">{vid.status === "processing" ? t("video.processing", { progress: vid.progress }) : t("video.statusLabel", { status: vid.status })}</div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{vid.prompt}</p>
                <p className="text-xs text-white/60 mt-0.5">{vid.model} &middot; {vid.created_at}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm" onClick={() => window.open(`/video/${vid.id}`, "_blank")}>{t("dashboard.viewDetails")}</Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={onClose}>{t("dashboard.close")}</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WelcomeModal({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useLocale();
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogTitle className="text-lg font-bold">{t("home.readyTitle") || "Welcome to Imaginova!"}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Your AI creative studio. Generate images & videos from text.</DialogDescription>
        <div className="flex flex-col gap-3 my-4">
          {[{ icon: Sparkles, title: "Generate", desc: "Describe what you want in natural language" }, { icon: ImageIcon, title: "Browse", desc: "View all your creations in one place" }, { icon: Video, title: "Credits", desc: "Check in daily for free credits" }].map((f) => (
            <div key={f.title} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <f.icon size={16} className="text-primary shrink-0" />
              <div><p className="text-sm font-medium">{f.title}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
            </div>
          ))}
        </div>
        <Button onClick={onDismiss} className="w-full">{t("dashboard.close") || "Get Started"}</Button>
      </DialogContent>
    </Dialog>
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
  const searchRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);

  useEffect(() => { if (!localStorage.getItem(ONBOARDING_KEY)) setShowWelcome(true); }, []);
  useEffect(() => { if (user) api.get<TaskItem[]>("/api/tasks").then(setTasks).catch(() => {}); }, [user]);
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
        if (err instanceof ApiError && err.status === 401) { window.location.href = "/login"; return; }
        throw err;
      }
      setLoading(false);
    })();
  }, []);

  const handleCheckin = async () => {
    try {
      const data = await api.post<{ reward: number; credits: number; streak: number }>("/api/credits/checkin");
      await refreshUser();
      toast(t("toast.checkedIn", { reward: data.reward, streak: data.streak }), "success");
    } catch (err) { if (err instanceof ApiError) toast(err.message, "error"); }
  };

  const sortedImages = useMemo(() => [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [images]);
  const sortedVideos = useMemo(() => [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [videos]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-8"><div className="h-7 w-32 bg-muted rounded animate-pulse mb-2" /><div className="h-4 w-48 bg-muted rounded animate-pulse" /></div>
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
    } catch (err) { if (err instanceof ApiError) toast(err.message, "error"); }
    setDeletingItems((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function loadMore() {
    setLoadingMore(true);
    const offset = tab === "images" ? images.length : videos.length;
    const data = await api.get<PageData<ImageItem & VideoItem>>(`/api/me/${tab}?limit=${PAGE_SIZE}&offset=${offset}`);
    if (tab === "images") setImages((prev) => [...prev, ...(data.items as ImageItem[])]);
    else setVideos((prev) => [...prev, ...(data.items as VideoItem[])]);
    setLoadingMore(false);
  }

  const rawItems = tab === "images" ? images : videos;
  const query = search.toLowerCase();
  const filteredItems = rawItems.filter((item) => item.prompt.toLowerCase().includes(query));
  const currentTotal = tab === "images" ? imageTotal : videoTotal;
  const hasMore = rawItems.length < currentTotal;

  async function refreshUser() { try { setUser(await api.get<UserData>("/api/me")); } catch {} }

  async function handleClaimTask(taskKey: string) {
    setClaimingTask(taskKey);
    try {
      const data = await api.post<{ credits: number; reward: number }>("/api/tasks", { taskKey });
      await refreshUser();
      api.get<TaskItem[]>("/api/tasks").then(setTasks).catch(() => {});
      toast(t("toast.taskCompleted", { reward: data.reward }), "success");
    } catch (err) { if (err instanceof ApiError) toast(err.message, "error"); }
    setClaimingTask(null);
  }

  return (
    <main className="max-w-6xl mx-auto px-6 pt-24 pb-12 animate-fade-in">
      {showWelcome && <WelcomeModal onDismiss={() => { localStorage.setItem(ONBOARDING_KEY, "1"); setShowWelcome(false); }} />}
      {selectedImage && <ImageLightbox img={selectedImage} images={sortedImages} onClose={() => setSelectedImage(null)} onNavigate={setSelectedImage} />}
      {selectedVideo && <VideoModal vid={selectedVideo} onClose={() => setSelectedVideo(null)} />}

      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCheckin} className="border-primary/30 text-primary hover:bg-primary/10">{t("dashboard.checkIn")}</Button>
      </div>

      <motion.div className="grid grid-cols-3 gap-4 mb-8" variants={containerVariants} initial="hidden" animate="visible">
        {[
          { label: t("dashboard.images"), value: imageTotal, icon: ImageIcon, accent: "text-primary" },
          { label: t("dashboard.videos"), value: videoTotal, icon: Video, accent: "text-accent" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={itemVariants} className="bg-card border border-border/60 rounded-[14px] p-5 hover:border-primary/20 transition-colors duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <div className={`size-8 rounded-lg bg-current/10 flex items-center justify-center ${s.accent}`}>
                  <Icon size={14} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.accent}`}>{s.value}</p>
            </motion.div>
          );
        })}
        <motion.div variants={itemVariants}>
          <Link href="/credits" className="block bg-card border border-border/60 rounded-[14px] p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{t("dashboard.credits")}</p>
              <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/15 transition-colors">
                <Sparkles size={14} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-accent">{user.credits}</p>
          </Link>
        </motion.div>
      </motion.div>

      {tasks.length > 0 && (
        <Card className="mb-8 border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm">{t("tasks.title")}</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {tasks.map((task) => {
              const label = t(`tasks.${task.key}` as any);
              const desc = t(`tasks.${task.key}_desc` as any);
              return (
                <div key={task.key} className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${task.completed ? 'bg-muted/20 opacity-60' : 'hover:bg-muted/30'}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{task.completed ? <span className="line-through text-muted-foreground">{label}</span> : label}</p>
                      <span className="text-xs font-semibold text-primary">+{task.reward}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.completed ? t("tasks.completed") : `${desc} (${task.progress.current}/${task.progress.total})`}</p>
                  </div>
                  {!task.completed && task.conditionMet && (
                    <Button size="sm" variant="default" onClick={() => handleClaimTask(task.key)} disabled={claimingTask === task.key} className="ml-3 shrink-0">
                      {claimingTask === task.key ? <LoadingSpinner size="sm" /> : t("tasks.claim")}
                    </Button>
                  )}
                  {!task.completed && !task.conditionMet && <span className="text-xs text-muted-foreground ml-3 shrink-0">{t("tasks.locked")}</span>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setSearch(""); }}>
          <TabsList variant="line">
            <TabsTrigger value="images">{t("dashboard.images")} ({imageTotal})</TabsTrigger>
            <TabsTrigger value="videos">{t("dashboard.videos")} ({videoTotal})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
          <Input ref={searchRef} type="text" placeholder={t("dashboard.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
      </div>

      {tab === "images" && (
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
          {sortedImages.filter((i) => i.prompt.toLowerCase().includes(query)).map((img) => (
            <motion.div key={img.id} variants={itemVariants}>
              <div className="group relative bg-card border border-border/60 rounded-[14px] overflow-hidden cursor-pointer hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300" onClick={() => setSelectedImage(img)}>
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <Image src={img.url} alt={img.prompt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 33vw" />
                </div>
                <button onClick={(e) => handleDeleteItem(img.id, "images", e)} disabled={deletingItems.has(img.id)} className="absolute top-2 right-2 size-7 rounded-full bg-background/80 border border-border/60 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50">
                  {deletingItems.has(img.id) ? <LoadingSpinner size="sm" /> : <Trash2 size={11} />}
                </button>
                <div className="p-3">
                  <p className="text-xs font-medium truncate">{img.prompt}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">{img.model}</Badge>
                    <span className="text-[10px] text-muted-foreground">{img.created_at}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16">
              <ImageIcon className="size-10 mx-auto mb-3 text-muted-foreground/30" strokeWidth={1} />
              <p className="text-muted-foreground text-sm mb-4">{search ? t("dashboard.noImagesSearch") : t("dashboard.noImages")}</p>
              {!search && <Link href="/create"><Button size="sm">{t("dashboard.createFirstImage")}</Button></Link>}
            </div>
          )}
        </motion.div>
      )}

      {tab === "videos" && (
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
          {sortedVideos.filter((v) => v.prompt.toLowerCase().includes(query)).map((vid) => (
            <motion.div key={vid.id} variants={itemVariants}>
              <div className="group relative bg-card border border-border/60 rounded-[14px] overflow-hidden cursor-pointer hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300" onClick={() => setSelectedVideo(vid)}>
                {vid.status === "completed" && vid.url ? (
                  <div className="aspect-[4/3] bg-muted overflow-hidden"><video src={`/api/proxy/video?url=${encodeURIComponent(vid.url)}`} preload="metadata" muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground text-xs">{vid.status === "processing" ? `Processing (${vid.progress}%)` : vid.status}</div>
                )}
                <button onClick={(e) => handleDeleteItem(vid.id, "videos", e)} disabled={deletingItems.has(vid.id)} className="absolute top-2 right-2 size-7 rounded-full bg-background/80 border border-border/60 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50">
                  {deletingItems.has(vid.id) ? <LoadingSpinner size="sm" /> : <Trash2 size={11} />}
                </button>
                <div className="p-3">
                  <p className="text-xs font-medium truncate">{vid.prompt}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">{vid.model}</Badge>
                    <span className="text-[10px] text-muted-foreground">{vid.created_at}</span>
                    {vid.status !== "completed" && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{vid.status}</Badge>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Video className="size-10 mx-auto mb-3 text-muted-foreground/30" strokeWidth={1} />
              <p className="text-muted-foreground text-sm mb-4">{search ? t("dashboard.noVideosSearch") : t("dashboard.noVideos")}</p>
              {!search && <Link href="/create"><Button size="sm">{t("dashboard.createFirstVideo")}</Button></Link>}
            </div>
          )}
        </motion.div>
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
