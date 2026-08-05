"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, RotateCcw, Link2, ExternalLink, Check } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";

interface GenerationResultProps {
  type: "image" | "video";
  id: number;
  url: string;
  prompt: string;
  regenerating?: boolean;
  onRegenerate?: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function GenerationResult({ type, id, url, prompt, regenerating, onRegenerate, t }: GenerationResultProps) {
  const [copied, setCopied] = useState(false);
  const detailPath = `/${type}/${id}`;
  const detailUrl = typeof window !== "undefined" ? `${window.location.origin}${detailPath}` : detailPath;

  async function handleCopyLink() {
    try { await navigator.clipboard.writeText(detailUrl); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = detailUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const videoSrc = url.startsWith("/api/file/") ? url : `/api/proxy/video?url=${encodeURIComponent(url)}`;

  return (
    <div className="animate-slide-up space-y-4 rounded-[14px] border border-border/60 bg-card p-5 glow-primary">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{t("create.resultTitle")}</h3>
        <Link href={detailPath} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink size={12} /> {t("dashboard.viewDetails")}
        </Link>
      </div>

      {type === "image" ? (
        url.startsWith("/api/file/") ? (
          <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
            <img src={url} alt={prompt} className="w-full h-auto object-contain max-h-[60dvh]" />
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
            <Image src={url} alt={prompt} width={1024} height={1024} className="w-full h-auto object-contain max-h-[60dvh]" unoptimized />
          </div>
        )
      ) : (
        <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
          <video src={videoSrc} controls autoPlay playsInline muted className="w-full max-h-[60dvh] object-contain mx-auto" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {onRegenerate && (
          <Button onClick={onRegenerate} disabled={regenerating} className="gap-2">
            {regenerating && <LoadingSpinner />}
            <RotateCcw size={14} />
            {regenerating ? t("create.generating") : t("create.regenerate")}
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(url, `${type}-${id}`)}>
          <Download size={14} />
          {t("common.download")}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
          {copied
            ? <><Check size={14} className="text-green-500" />{t("common.copied")}</>
            : <><Link2 size={14} />{t("common.copyLink")}</>}
        </Button>
      </div>
    </div>
  );
}