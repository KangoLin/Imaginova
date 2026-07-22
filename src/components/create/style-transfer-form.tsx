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

  return (
    <div className="space-y-6" onPaste={(e) => { const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/")); if (item) { const f = item.getAsFile(); if (f) { e.preventDefault(); handleSourceFile(f); } }; }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("styleTransfer.sourceImage")}</label>
          {sourcePreview ? (
            <div className="relative group max-w-sm">
              <Image
                src={sourcePreview}
                alt=""
                width={320}
                height={320}
                className="w-full h-48 object-cover rounded-[14px] border border-border/60"
                unoptimized
              />
              <button
                type="button"
                onClick={() => { if (sourcePreview) URL.revokeObjectURL(sourcePreview); setSourceFile(null); setSourcePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-2 right-2 size-6 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all text-xs opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                x
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleSourceFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-sm h-48 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group ${
                dragOver ? "border-primary bg-primary/[0.06] scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
              }`}
            >
              <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50"
              }`}>
                <Wand2 size={18} />
              </div>
              <span className={dragOver ? "text-primary font-medium" : ""}>
                {dragOver ? t("styleTransfer.dropImage") : t("styleTransfer.uploadImage")}
              </span>
              <span className="text-xs text-muted-foreground/40">{t("styleTransfer.sourceImageHint")}</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSourceFile(f); }} />
        </div>

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

      {result && (
        <div className="animate-slide-up space-y-4 pt-4 border-t border-border/60">
          <h3 className="text-sm font-medium text-foreground">{t("styleTransfer.result")}</h3>
          <div className="rounded-[14px] overflow-hidden border border-border/60 bg-card">
            <Image
              src={result.url}
              alt="Style transfer result"
              width={1024}
              height={1024}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
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
      )}
    </div>
  );
}
