"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { downloadFile } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

interface VideoData { id: number; prompt: string; model: string; status: string; url: string | null; progress: number; created_at: string; }

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLocale();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const pollingRef = useRef(false);
  const pollStartRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<VideoData>(`/api/video/${params.id}`);
        setVideo(data);
        if (data.status === "queued" || data.status === "processing") {
          startSSE(data.id);
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
      }
      setLoading(false);
    })();
  }, [params.id]);

  function startSSE(videoId: number) {
    pollingRef.current = true;
    if (!pollStartRef.current) pollStartRef.current = Date.now();
    const es = new EventSource(`/api/video/${videoId}/stream`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setVideo((prev) => prev ? { ...prev, status: data.status, progress: data.progress, url: data.url || prev.url } : prev);
      if (data.status === "completed" || data.status === "failed") {
        es.close();
        pollingRef.current = false;
      }
    };

    es.onerror = () => {
      es.close();
      pollingRef.current = false;
    };

    setTimeout(() => {
      if (pollingRef.current) {
        es.close();
        pollingRef.current = false;
      }
    }, 600000);
  }

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
        <Link href="/dashboard" className="text-primary text-sm mt-4 inline-block hover:underline active:scale-[0.97] transition-all">{t("common.backToDashboard")}</Link>
      </div>
    );
  }

  if (!video) return null;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReport() {
    try {
      await api.post("/api/admin/reports", { type: "video", id: params.id });
      setReported(true);
    } catch {}
  }

  async function handleDelete() {
    if (!window.confirm(t("common.confirmDeleteVideo"))) return;
    setDeleting(true);
    try {
      await api.delete(`/api/video/${params.id}`);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      setDeleting(false);
    }
  }

  const isCompleted = video.status === "completed" && video.url;

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl overflow-hidden border border-border/60">
            <div className="bg-muted flex items-center justify-center p-6">
              {isCompleted ? (
                <video src={`/api/proxy/video?url=${encodeURIComponent(video.url!)}`} controls autoPlay className="max-w-full max-h-[65vh] rounded-lg" />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-64 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(video.progress, 5)}%` }} />
                  </div>
                  <span className="text-sm">{video.status === "processing" || video.status === "queued" ? (() => {
                    const elapsed = pollStartRef.current ? (Date.now() - pollStartRef.current) / 1000 : 0;
                    const eta = video.progress > 0 && video.progress < 100 && elapsed > 0
                      ? Math.round((elapsed / video.progress) * (100 - video.progress))
                      : 0;
                    const etaText = eta >= 60 ? `${Math.floor(eta / 60)}m ${eta % 60}s` : `${eta}s`;
                    return <>{t("video.processing", { progress: video.progress })}{eta > 0 && <span className="ml-1.5 text-muted-foreground/60">{t("video.remaining", { time: etaText })}</span>}</>;
                  })() : t("video.statusLabel", { status: video.status })}</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-5">
              <h1 className="text-xl font-bold leading-snug">{video.prompt}</h1>
              <div className="flex gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">{t("common.model")}</span>
                  <span className="font-medium">{video.model}</span>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">{t("common.created")}</span>
                  <span className="font-medium">{video.created_at}</span>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">{t("common.status")}</span>
                  <span className="font-medium capitalize">{video.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {isCompleted && <Button onClick={() => downloadFile(video.url!, `imaginova-${video.id}`)}>{t("common.download")}</Button>}
                <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
                  {copied ? <><svg className="w-4 h-4 text-green-500 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>{t("common.copied")}</> : t("common.copyLink")}
                </Button>
                <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.prompt)}&url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener")} className="gap-2">
                  {t("common.share")}
                </Button>
                {!reported ? (
                  <Button size="sm" variant="ghost" onClick={handleReport} className="text-muted-foreground">{t("admin.report")}</Button>
                ) : (
                  <span className="text-xs text-muted-foreground">{t("admin.reported")}</span>
                )}
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2 ml-auto">
                  {deleting && <LoadingSpinner />}
                  {deleting ? t("common.deleting") : t("common.delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
