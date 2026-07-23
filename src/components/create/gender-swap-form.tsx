"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { api, ApiError } from "@/lib/api-client";
import { downloadFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { Download, RotateCcw, Check } from "lucide-react";
import { StudioLayout } from "@/components/create/studio-layout";
import { BeforeAfterSlider } from "@/components/create/before-after-slider";

type GenderTarget = "male-to-female" | "female-to-male";

const GENDER_PROMPTS: Record<GenderTarget, string> = {
  "male-to-female": "Change only the gender to female, keep all original facial features, identity, and characteristics unchanged, only adjust gender presentation",
  "female-to-male": "Change only the gender to male, keep all original facial features, identity, and characteristics unchanged, only adjust gender presentation",
};

export function GenderSwapForm() {
  const { t } = useLocale();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetGender, setTargetGender] = useState<GenderTarget | null>(null);
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
    if (!sourceFile || !targetGender) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const genderPrompt = GENDER_PROMPTS[targetGender];
      const desc = description.trim() ? `, ${description.trim()}` : "";
      const prompt = `${genderPrompt}${desc}, photorealistic, high quality, detailed face`;

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", "768x1024");
      formData.append("image", sourceFile);

      const data = (await api.post("/api/generate/image", formData)) as { id: number; url: string; credits: number };
      setResult({ id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("genderSwap.error"));
    }
    setLoading(false);
  }

  const canSubmit = sourceFile && targetGender && !loading;

  const inputSection = (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto" onPaste={(e) => { const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/")); if (item) { const f = item.getAsFile(); if (f) { e.preventDefault(); handleSourceFile(f); } }; }}>
      <ImageUploadZone
        label={t("genderSwap.sourceImage")}
        hint={t("genderSwap.sourceImageHint")}
        preview={sourcePreview}
        dragOver={dragOver}
        uploadText={t("genderSwap.uploadImage")}
        dropText={t("genderSwap.dropImage")}
        onFile={handleSourceFile}
        onRemove={() => { if (sourcePreview) URL.revokeObjectURL(sourcePreview); setSourceFile(null); setSourcePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
        onDragOver={setDragOver}
        inputRef={fileInputRef}
        loading={loading}
      />

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">{t("genderSwap.targetGender")}</label>
        <div className="grid grid-cols-2 gap-3">
          {(["male-to-female", "female-to-male"] as GenderTarget[]).map((g) => {
            const isSelected = targetGender === g;
            return (
                <button key={g} type="button" onClick={() => setTargetGender(g)} className={`relative rounded-[14px] border p-4 text-center transition-all duration-200 active:scale-[0.97] ${isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/60 hover:border-primary/30 hover:scale-[1.02] bg-card"}`}>
                <div className="text-2xl mb-1">{g === "male-to-female" ? "♀️" : "♂️"}</div>
                <p className="text-xs font-medium">{t(`genderSwap.${g === "male-to-female" ? "maleToFemale" : "femaleToMale"}`)}</p>
                {isSelected && <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center"><Check size={10} className="text-primary-foreground" /></div>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">{t("genderSwap.description")}</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("genderSwap.descriptionPlaceholder")} rows={2} className="resize-none text-base" />
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("create.cost")}: 1 {t("create.credit")}</span>
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full gap-2 h-11 text-base active:scale-[0.97] transition-all duration-200">
        {loading && <LoadingSpinner />}
        {loading ? t("genderSwap.generating") : t("genderSwap.generate")}
      </Button>
    </form>
  );

  const resultSection = result ? (
    <div className="animate-slide-up space-y-4 rounded-[14px] border border-border/60 bg-card p-5 glow-primary">
      <h3 className="text-sm font-medium text-foreground">{t("genderSwap.result")}</h3>
      {sourcePreview ? (
        <BeforeAfterSlider beforeSrc={sourcePreview} afterSrc={result.url} aspectRatio={3 / 4} />
      ) : (
        <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
          <Image src={result.url} alt="Gender swap result" width={768} height={1024} className="w-full h-auto object-contain" unoptimized />
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(result.url, `gender-swap-${result.id}.png`)}><Download size={14} />{t("common.download")}</Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setResult(null); setDescription(""); }}><RotateCcw size={14} />{t("genderSwap.generateAgain")}</Button>
      </div>
    </div>
  ) : undefined;

  return <StudioLayout left={inputSection} right={resultSection} />;
}
