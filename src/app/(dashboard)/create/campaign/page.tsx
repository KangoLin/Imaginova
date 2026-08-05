"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/loading-spinner";
import { api, ApiError } from "@/lib/api-client";
import { Sparkles, Upload } from "lucide-react";
import { GenerationResult } from "@/components/create/generation-result";

const STYLES = [
  { key: "luxury", label: "Luxury" },
  { key: "street", label: "Street" },
  { key: "minimal", label: "Minimal" },
];

export default function CampaignPage() {
  const { t } = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [style, setStyle] = useState("luxury");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{ id: number; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | File[]) {
    const valid = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;
    setFiles((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function runGeneration() {
    if (files.length === 0) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("prompt", `${description || "Campaign product shot"} — style: ${style}`);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", "1024x1024");
      for (const f of files) formData.append("image", f);
      const data = (await api.post("/api/generate/image", formData)) as { id: number; url: string };
      setResult({ id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Generation failed");
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runGeneration();
  }

  return (
    <main className="mx-auto px-6 pt-24 pb-12 animate-fade-in max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">{t("campaign.badge")}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{t("campaign.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("campaign.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("campaign.feature1Title")}</label>
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative inline-block group">
                  <Image src={preview} alt="" width={120} height={120} className="object-cover rounded-xl border border-border/80 size-[120px]" unoptimized />
                  <button type="button" onClick={() => removeFile(idx)} className="absolute -top-2.5 -right-2.5 size-6 rounded-full bg-background border border-border/80 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all text-xs opacity-0 group-hover:opacity-100 shadow-sm">✕</button>
                </div>
              ))}
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full rounded-xl py-8 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group overflow-hidden ${
              dragOver ? "border-2 border-primary bg-primary/[0.06] scale-[1.02] shadow-lg shadow-primary/10 ring-2 ring-primary/20" : "border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/[0.03]"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50 group-hover:bg-primary/10"}`}>
                <Upload size={20} />
              </div>
              <span className={`text-sm ${dragOver ? "text-primary font-medium" : ""}`}>
                {files.length > 0 ? "Add more products" : dragOver ? "Drop products here" : "Upload product images"}
              </span>
              <span className="text-[11px] text-muted-foreground/40">Supports PNG, JPG — multiple files allowed</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("campaign.feature2Title")}</label>
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map((s) => (
              <button key={s.key} type="button" onClick={() => setStyle(s.key)}
                className={`rounded-xl py-3 text-sm font-medium transition-all border ${
                  style === s.key
                    ? "border-primary bg-primary/[0.06] ring-1 ring-primary/20 text-primary"
                    : "border-border/60 bg-card text-foreground hover:border-primary/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">Description (optional)</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Outdoor natural lighting, white background, studio quality"
            rows={2} className="resize-none text-base" />
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

        <Button type="submit" disabled={loading || files.length === 0} className="w-full gap-2 h-11 text-base">
          {loading ? <LoadingSpinner /> : <Sparkles size={16} />}
          {loading ? "Generating..." : "✨ Generate Campaign"}
        </Button>
      </form>

      {result && (
        <div className="mt-6">
          <GenerationResult
            type="image"
            id={result.id}
            url={result.url}
            prompt={description || "Campaign product shot"}
            regenerating={loading}
            onRegenerate={runGeneration}
            t={t}
          />
        </div>
      )}
    </main>
  );
}
