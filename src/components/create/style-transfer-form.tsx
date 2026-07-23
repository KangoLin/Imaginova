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

type StylePreset =
  | "anime"
  | "oilPainting"
  | "sketch"
  | "render3d"
  | "pixelArt"
  | "watercolor"
  | "cyberpunk"
  | "ukiyoe";

const STYLE_PROMPTS: Record<StylePreset, string> = {
  anime: "in anime style, cel shading, vibrant colors, clean lineart, Studio Ghibli inspired",
  oilPainting: "in oil painting style, thick brushstrokes, impasto texture, classical fine art",
  sketch: "in pencil sketch style, black and white, hand-drawn shading, cross-hatching, paper texture",
  render3d: "in 3D render style, Pixar-like, volumetric lighting, subsurface scattering, smooth surfaces",
  pixelArt: "in pixel art style, retro 8-bit game aesthetic, limited color palette, blocky pixels",
  watercolor: "in watercolor painting style, soft washes, flowing pigments, wet-on-wet technique, paper grain",
  cyberpunk: "in cyberpunk style, neon lights, dark urban atmosphere, rain-slicked streets, holographic glow",
  ukiyoe: "in ukiyo-e style, woodblock print, flat colors, bold outlines, traditional Japanese art",
};

const STYLE_PRESETS: { key: StylePreset; icon: string; gradient: string }[] = [
  { key: "anime", icon: "🎨", gradient: "from-pink-400/20 via-purple-400/10 to-transparent" },
  { key: "oilPainting", icon: "🖼️", gradient: "from-amber-400/20 via-yellow-400/10 to-transparent" },
  { key: "sketch", icon: "✏️", gradient: "from-gray-400/20 via-stone-400/10 to-transparent" },
  { key: "render3d", icon: "🎬", gradient: "from-blue-400/20 via-cyan-400/10 to-transparent" },
  { key: "pixelArt", icon: "🟦", gradient: "from-green-400/20 via-emerald-400/10 to-transparent" },
  { key: "watercolor", icon: "🌊", gradient: "from-sky-400/20 via-teal-400/10 to-transparent" },
  { key: "cyberpunk", icon: "🌃", gradient: "from-fuchsia-400/20 via-violet-400/10 to-transparent" },
  { key: "ukiyoe", icon: "🗾", gradient: "from-red-400/20 via-orange-400/10 to-transparent" },
];

export function StyleTransferForm() {
  const { t } = useLocale();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: number; url: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    };
  }, [sourcePreview]);

  function handleSourceFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    setSourceFile(file);
    setSourcePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceFile || !selectedStyle) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const stylePrompt = STYLE_PROMPTS[selectedStyle];
      const desc = description.trim() ? `, ${description.trim()}` : "";
      const prompt = `将参考图中的角色或场景改为${stylePrompt}${desc}, high quality, detailed`;

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", "1024x1024");
      formData.append("image", sourceFile);

      const data = (await api.post("/api/generate/image", formData)) as { id: number; url: string; credits: number };
      setResult({ id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("styleTransfer.error"));
    }
    setLoading(false);
  }

  const canSubmit = sourceFile && selectedStyle && !loading;

  const inputSection = (
    <form onSubmit={handleSubmit} className="space-y-5" onPaste={(e) => { const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/")); if (item) { const f = item.getAsFile(); if (f) { e.preventDefault(); handleSourceFile(f); } }; }}>
      <ImageUploadZone
        label={t("styleTransfer.sourceImage")}
        hint={t("styleTransfer.sourceImageHint")}
        preview={sourcePreview}
        dragOver={dragOver}
        uploadText={t("styleTransfer.uploadImage")}
        dropText={t("styleTransfer.dropImage")}
        onFile={handleSourceFile}
        onRemove={() => { if (sourcePreview) URL.revokeObjectURL(sourcePreview); setSourceFile(null); setSourcePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
        onDragOver={setDragOver}
        inputRef={fileInputRef}
      />

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">{t("styleTransfer.chooseStyle")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => setSelectedStyle(preset.key)}
                className={`relative rounded-[14px] border p-3 text-center transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border/60 hover:border-primary/30 bg-card"
                }`}
              >
                <div className={`absolute inset-0 rounded-[14px] bg-gradient-to-br ${preset.gradient} opacity-50`} />
                <div className="relative">
                  <div className="text-xl mb-1">{preset.icon}</div>
                  <p className="text-xs font-medium">{t(`styleTransfer.preset${preset.key.charAt(0).toUpperCase() + preset.key.slice(1)}`)}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">{t("styleTransfer.description")}</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("styleTransfer.descriptionPlaceholder")}
          rows={2}
          className="resize-none text-base"
        />
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("create.cost")}: 1 {t("create.credit")}</span>
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full gap-2 h-11 text-base">
        {loading && <LoadingSpinner />}
        {loading ? t("styleTransfer.generating") : t("styleTransfer.generate")}
      </Button>
    </form>
  );

  const resultSection = result ? (
    <div className="animate-slide-up space-y-4 rounded-[14px] border border-border/60 bg-card p-5">
      <h3 className="text-sm font-medium text-foreground">{t("styleTransfer.result")}</h3>
      {sourcePreview ? (
        <BeforeAfterSlider beforeSrc={sourcePreview} afterSrc={result.url} aspectRatio={1} />
      ) : (
        <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
          <Image src={result.url} alt="Style transfer result" width={1024} height={1024} className="w-full h-auto object-contain" unoptimized />
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(result.url, `style-transfer-${result.id}.png`)}>
          <Download size={14} />
          {t("common.download")}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setResult(null); setDescription(""); }}>
          <RotateCcw size={14} />
          {t("styleTransfer.generateAgain")}
        </Button>
      </div>
    </div>
  ) : undefined;

  return <StudioLayout left={inputSection} right={resultSection} />;
}
