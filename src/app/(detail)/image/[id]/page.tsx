"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Check, ArrowLeft } from "lucide-react";
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
      try { setImage(await api.get<ImageData>(`/api/image/${params.id}`)); }
      catch (err) { if (err instanceof ApiError) setError(err.message); }
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12">
      <div className="h-5 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="aspect-[4/3] bg-muted rounded-xl animate-pulse mb-6" />
      <div className="h-32 bg-muted rounded-xl animate-pulse" />
    </main>
  );

  if (error || !image) return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 animate-fade-in">
      <div className="bg-destructive/5 rounded-xl p-4 text-sm text-destructive">{error || "Image not found"}</div>
      <Link href="/dashboard" className="text-primary text-sm mt-4 inline-block hover:underline transition-all">{t("common.backToDashboard")}</Link>
    </main>
  );

  async function handleCopyLink() {
    try { await navigator.clipboard.writeText(window.location.href); }
    catch { const ta = document.createElement("textarea"); ta.value = window.location.href; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReport() {
    try { await api.post("/api/admin/reports", { type: "image", id: params.id }); setReported(true); } catch {}
  }

  async function handleDelete() {
    if (!window.confirm(t("common.confirmDeleteImage"))) return;
    setDeleting(true);
    try { await api.delete(`/api/image/${params.id}`); router.push("/dashboard"); }
    catch (err) { if (err instanceof ApiError) setError(err.message); setDeleting(false); }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 animate-fade-in">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={13} /> {t("common.backToDashboard")}
      </Link>
      <div className="bg-card rounded-xl overflow-hidden border border-border/60">
        <div className="bg-muted relative flex items-center justify-center" style={{ minHeight: "65vh", maxHeight: "85vh" }}>
          <Image src={image.url} alt={image.prompt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 1024px" />
        </div>
        <div className="p-5 space-y-4">
          <h1 className="text-lg font-bold leading-snug">{image.prompt}</h1>
          <div className="flex gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
              <span className="text-muted-foreground text-xs block">{t("common.model")}</span>
              <span className="font-medium">{image.model}</span>
            </div>
            <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
              <span className="text-muted-foreground text-xs block">{t("common.created")}</span>
              <span className="font-medium">{image.created_at}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => downloadFile(image.url, `imaginova-${image.id}`)}>{t("common.download")}</Button>
            <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
              {copied ? <><Check size={15} className="text-green-500" />{t("common.copied")}</> : t("common.copyLink")}
            </Button>
            <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(image.prompt)}&url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener")}>{t("common.share")}</Button>
            {!reported ? (
              <Button variant="ghost" size="sm" onClick={handleReport} className="text-muted-foreground">{t("admin.report")}</Button>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center">{t("admin.reported")}</span>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2 ml-auto">
              {deleting && <LoadingSpinner />}
              {deleting ? t("common.deleting") : t("common.delete")}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
