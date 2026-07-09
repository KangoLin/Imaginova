"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/utils";

interface VideoData { id: number; prompt: string; model: string; status: string; url: string | null; progress: number; created_at: string; }

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/video/${params.id}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { setError("Video not found"); setLoading(false); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); } else { setVideo(data); }
      setLoading(false);
    })();
  }, [params.id, router]);

  const status = video?.status;

  useEffect(() => {
    if (status && (status === "queued" || status === "processing")) {
      pollingRef.current = true;
      const interval = setInterval(async () => {
        const res = await fetch(`/api/video/${params.id}`);
        const data = await res.json();
        if (data.error) { clearInterval(interval); pollingRef.current = false; return; }
        setVideo(data);
        if (data.status === "completed" || data.status === "failed") { clearInterval(interval); pollingRef.current = false; }
      }, 5000);
      return () => { clearInterval(interval); pollingRef.current = false; };
    }
  }, [status, params.id]);

  if (loading) {
    return (
      <div className="container-narrow px-6 py-12">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-6" />
        <div className="aspect-[4/3] bg-muted rounded-xl animate-pulse mb-6" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow px-6 py-12 animate-fade-in">
        <div className="bg-destructive/5 rounded-lg p-4 text-sm text-destructive">{error}</div>
        <Link href="/dashboard" className="text-primary text-sm mt-4 inline-block hover:underline active:scale-[0.97] transition-all">Back to Dashboard</Link>
      </div>
    );
  }

  if (!video) return null;

  const isCompleted = video.status === "completed" && video.url;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-border">
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]">&larr; Dashboard</Link>
        </div>
      </header>

      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl overflow-hidden border border-border/60">
            <div className="bg-[#0a0a0a] flex items-center justify-center p-6">
              {isCompleted ? (
                <video src={video.url!} controls autoPlay className="max-w-full max-h-[65vh] rounded-lg" />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-64 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(video.progress, 5)}%` }} />
                  </div>
                  <span className="text-sm">{video.status === "processing" || video.status === "queued" ? `Processing (${video.progress}%)` : `Status: ${video.status}`}</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-5">
              <h1 className="text-xl font-bold leading-snug">{video.prompt}</h1>
              <div className="flex gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">Model</span>
                  <span className="font-medium">{video.model}</span>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">Created</span>
                  <span className="font-medium">{video.created_at}</span>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">Status</span>
                  <span className="font-medium capitalize">{video.status}</span>
                </div>
              </div>
              {isCompleted && <Button onClick={() => downloadFile(video.url!, `imaginova-${video.id}`)}>Download</Button>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
