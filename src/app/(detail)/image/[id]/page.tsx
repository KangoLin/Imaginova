"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { downloadFile } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

interface ImageData { id: number; prompt: string; model: string; url: string; created_at: string; }

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLocale();
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setImage(await api.get<ImageData>(`/api/image/${params.id}`));
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
      }
      setLoading(false);
    })();
  }, [params.id]);

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

  if (!image) return null;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReport() {
    try {
      await api.post("/api/admin/reports", { type: "image", id: params.id });
      setReported(true);
    } catch {}
  }

  async function handleDelete() {
    if (!window.confirm(t("common.confirmDeleteImage"))) return;
    setDeleting(true);
    try {
      await api.delete(`/api/image/${params.id}`);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      setDeleting(false);
    }
  }

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl overflow-hidden border border-border/60">
            <div className="bg-muted relative flex items-center justify-center p-6 max-h-[65vh]">
              <Image src={image.url} alt={image.prompt} fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 768px" />
            </div>
            <div className="p-6 space-y-5">
              <h1 className="text-xl font-bold leading-snug">{image.prompt}</h1>
              <div className="flex gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">{t("common.model")}</span>
                  <span className="font-medium">{image.model}</span>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">{t("common.created")}</span>
                  <span className="font-medium">{image.created_at}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => downloadFile(image.url, `imaginova-${image.id}`)}>{t("common.download")}</Button>
                <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
                  {copied ? <><svg className="w-4 h-4 text-green-500 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>{t("common.copied")}</> : t("common.copyLink")}
                </Button>
                <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(image.prompt)}&url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener")} className="gap-2">
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
