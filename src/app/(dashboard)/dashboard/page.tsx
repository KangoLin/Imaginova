"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GridSkeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = "images" | "videos";
const PAGE_SIZE = 12;

interface UserData { name: string; email: string; credits: number; }
interface ImageItem { id: number; prompt: string; model: string; url: string; created_at: string; }
interface VideoItem { id: number; prompt: string; model: string; status: string; url: string | null; progress: number; created_at: string; }
interface PageData<T> { items: T[]; total: number; }

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("images");
  const [user, setUser] = useState<UserData | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageTotal, setImageTotal] = useState(0);
  const [videoTotal, setVideoTotal] = useState(0);

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
        if (!(err instanceof ApiError && err.status === 401)) throw err;
      }
      setLoading(false);
    })();
  }, []);

  const handleCheckin = async () => {
    try {
      const data = await api.post<{ reward: number; credits: number }>("/api/credits/checkin");
      toast(`Checked in! +${data.reward} credit`, "success");
      setUser((prev) => prev ? { ...prev, credits: data.credits } : prev);
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, "error");
    }
  };

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

  async function loadMore() {
    setLoadingMore(true);
    const offset = tab === "images" ? images.length : videos.length;
    const data = await api.get<PageData<ImageItem & VideoItem>>(`/api/me/${tab}?limit=${PAGE_SIZE}&offset=${offset}`);
    if (tab === "images") { setImages((prev) => [...prev, ...(data.items as ImageItem[])]); } else { setVideos((prev) => [...prev, ...(data.items as VideoItem[])]); }
    setLoadingMore(false);
  }

  const currentItems = tab === "images" ? images : videos;
  const currentTotal = tab === "images" ? imageTotal : videoTotal;
  const hasMore = currentItems.length < currentTotal;

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-fade-in">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{user.name}</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="hidden sm:inline">{user.email}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCheckin}>Check In</Button>
        </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-card rounded-lg p-4 border border-border/60">
              <p className="text-xs text-muted-foreground font-medium">Images</p>
              <p className="text-xl font-bold mt-0.5">{images.length}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60">
              <p className="text-xs text-muted-foreground font-medium">Videos</p>
              <p className="text-xl font-bold mt-0.5">{videos.length}</p>
            </div>
            <Link href="/credits" className="bg-card rounded-lg p-4 border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98] block">
              <p className="text-xs text-muted-foreground font-medium">Credits</p>
              <p className="text-xl font-bold mt-0.5 text-primary">{user.credits}</p>
            </Link>
          </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="images">Images ({imageTotal})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videoTotal})</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "images" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img) => (
              <Card key={img.id} className="overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer" onClick={() => router.push(`/image/${img.id}`)}>
                <div className="aspect-[4/3] overflow-hidden bg-muted"><img src={img.url} alt={img.prompt} className="w-full h-full object-cover" /></div>
                <div className="p-3"><p className="text-sm font-medium truncate">{img.prompt}</p><p className="text-xs text-muted-foreground mt-1">{img.created_at}</p></div>
              </Card>
            ))}
            {images.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground text-sm mb-4">No images yet</p>
                <Link href="/create" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]">Create your first image</Link>
              </div>
            )}
          </div>
        )}

        {tab === "videos" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {videos.map((vid) => (
              <Card key={vid.id} className="overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer" onClick={() => router.push(`/video/${vid.id}`)}>
                {vid.status === "completed" && vid.url ? (
                  <div className="aspect-[4/3] overflow-hidden bg-muted"><video src={vid.url} preload="metadata" muted playsInline className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    {vid.status === "processing" ? `Processing (${vid.progress}%)` : vid.status}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{vid.prompt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{vid.created_at}</p>
                    {vid.status !== "completed" && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{vid.status}</Badge>}
                  </div>
                </div>
              </Card>
            ))}
            {videos.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground text-sm mb-4">No videos yet</p>
                <Link href="/create" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 hover:shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.97]">Create your first video</Link>
              </div>
            )}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="gap-2 min-w-[140px]">
              {loadingMore && <LoadingSpinner />}
              {loadingMore ? "Loading..." : `Load More (${currentItems.length}/${currentTotal})`}
            </Button>
          </div>
        )}
      </main>
  );
}
