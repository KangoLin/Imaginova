"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { api, ApiError } from "@/lib/api-client";
import { downloadFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Wand2, Download, RotateCcw, Check } from "lucide-react";

type AgeTarget = "child" | "teen" | "young-adult" | "middle-aged" | "elderly";

const AGE_PROMPTS: Record<AgeTarget, string> = {
  "child": "Transform this person to look like a child around 6-12 years old, keep all original facial features and identity unchanged, only adjust age appearance, younger face, smoother skin",
  "teen": "Transform this person to look like a teenager around 13-19 years old, keep all original facial features and identity unchanged, only adjust age appearance, youthful skin",
  "young-adult": "Transform this person to look like a young adult around 20-30 years old, keep all original facial features and identity unchanged, only adjust age appearance, fresh look",
  "middle-aged": "Transform this person to look middle-aged around 40-55 years old, keep all original facial features and identity unchanged, only adjust age appearance, mature features, slight wrinkles",
  "elderly": "Transform this person to look elderly around 60+ years old, keep all original facial features and identity unchanged, only adjust age appearance, visible wrinkles, gray hair",
};

const AGE_OPTIONS: { key: AgeTarget; icon: string }[] = [
  { key: "child", icon: "👶" },
  { key: "teen", icon: "🧑" },
  { key: "young-adult", icon: "👨‍💼" },
  { key: "middle-aged", icon: "👨‍🦱" },
  { key: "elderly", icon: "👴" },
];

export function AgeTransformForm() {
  const { t } = useLocale();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetAge, setTargetAge] = useState<AgeTarget | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: number; url: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (sourcePreview) URL.revokeObjectURL(sourcePreview); };
  }, [sourcePreview]);

  function handleSourceFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    setSourceFile(file);
    setSourcePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceFile || !targetAge) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const agePrompt = AGE_PROMPTS[targetAge];
      const desc = description.trim() ? `, ${description.trim()}` : "";
      const prompt = `${agePrompt}${desc}, photorealistic, high quality, detailed face portrait`;

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", "768x1024");
      formData.append("image", sourceFile);

      const data = (await api.post("/api/generate/image", formData)) as { id: number; url: string; credits: number };
      setResult({ id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("ageTransform.error"));
    }
    setLoading(false);
  }

  const canSubmit = sourceFile && targetAge && !loading;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("ageTransform.sourceImage")}</label>
          {sourcePreview ? (
            <div className="relative group max-w-sm">
              <Image src={sourcePreview} alt="" width={320} height={320} className="w-full h-48 object-cover rounded-[14px] border border-border/60" unoptimized />
              <button type="button" onClick={() => { if (sourcePreview) URL.revokeObjectURL(sourcePreview); setSourceFile(null); setSourcePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 right-2 size-6 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all text-xs opacity-0 group-hover:opacity-100 backdrop-blur-sm">x</button>
            </div>
          ) : (
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleSourceFile(f); }} onClick={() => fileInputRef.current?.click()} className={`w-full max-w-sm h-48 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group ${dragOver ? "border-primary bg-primary/[0.06] scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"}`}>
              <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50"}`}><Wand2 size={18} /></div>
              <span className={dragOver ? "text-primary font-medium" : ""}>{dragOver ? t("ageTransform.dropImage") : t("ageTransform.uploadImage")}</span>
              <span className="text-xs text-muted-foreground/40">{t("ageTransform.sourceImageHint")}</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSourceFile(f); }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-foreground">{t("ageTransform.targetAge")}</label>
          <div className="grid grid-cols-5 gap-2">
            {AGE_OPTIONS.map((opt) => {
              const isSelected = targetAge === opt.key;
              return (
                <button key={opt.key} type="button" onClick={() => setTargetAge(opt.key)} className={`relative rounded-[14px] border p-3 text-center transition-all duration-200 ${isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/60 hover:border-primary/30 bg-card"}`}>
                  <div className="text-xl mb-1">{opt.icon}</div>
                  <p className="text-[10px] font-medium leading-tight">{t(`ageTransform.${opt.key === "young-adult" ? "youngAdult" : opt.key === "middle-aged" ? "middleAged" : opt.key}`)}</p>
                  {isSelected && <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center"><Check size={10} className="text-primary-foreground" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("ageTransform.description")}</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("ageTransform.descriptionPlaceholder")} rows={2} className="resize-none text-base" />
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("create.cost")}: 1 {t("create.credit")}</span>
        </div>

        <Button type="submit" disabled={!canSubmit} className="w-full gap-2 h-11 text-base">
          {loading && <LoadingSpinner />}
          {loading ? t("ageTransform.generating") : t("ageTransform.generate")}
        </Button>
      </form>

      {result && (
        <div className="animate-slide-up space-y-4 pt-4 border-t border-border/60">
          <h3 className="text-sm font-medium text-foreground">{t("ageTransform.result")}</h3>
          <div className="rounded-[14px] overflow-hidden border border-border/60 bg-card">
            <Image src={result.url} alt="Age transform result" width={768} height={1024} className="w-full h-auto object-contain" unoptimized />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(result.url, `age-transform-${result.id}.png`)}><Download size={14} />{t("common.download")}</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { setResult(null); setDescription(""); }}><RotateCcw size={14} />{t("ageTransform.generateAgain")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
