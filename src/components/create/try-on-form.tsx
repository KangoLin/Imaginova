"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { api, ApiError } from "@/lib/api-client";
import { downloadFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Wand2, Download, RotateCcw } from "lucide-react";

export function TryOnForm() {
  const { t } = useLocale();
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: number; url: string } | null>(null);
  const [dragOverPerson, setDragOverPerson] = useState(false);
  const [dragOverGarment, setDragOverGarment] = useState(false);
  const personInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (personPreview) URL.revokeObjectURL(personPreview);
      if (garmentPreview) URL.revokeObjectURL(garmentPreview);
    };
  }, [personPreview, garmentPreview]);

  function handlePersonFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (personPreview) URL.revokeObjectURL(personPreview);
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
  }

  function handleGarmentFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (garmentPreview) URL.revokeObjectURL(garmentPreview);
    setGarmentFile(file);
    setGarmentPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personFile || !garmentFile) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const desc = description.trim() ? `, ${description.trim()}` : "";
      const prompt = `A person wearing this garment${desc}, full body, photorealistic, high quality detail, studio lighting`;

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", "768x1024");
      formData.append("image", personFile);
      formData.append("image", garmentFile);

      const data = (await api.post("/api/generate/image", formData)) as { id: number; url: string; credits: number };
      setResult({ id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("tryOn.error"));
    }
    setLoading(false);
  }

  const canSubmit = personFile && garmentFile && !loading;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <UploadZone
            label={t("tryOn.personImage")}
            hint={t("tryOn.personImageHint")}
            preview={personPreview}
            dragOver={dragOverPerson}
            inputRef={personInputRef}
            onFile={handlePersonFile}
            onRemove={() => { if (personPreview) URL.revokeObjectURL(personPreview); setPersonFile(null); setPersonPreview(null); if (personInputRef.current) personInputRef.current.value = ""; }}
            onDragOver={setDragOverPerson}
          />
          <UploadZone
            label={t("tryOn.garmentImage")}
            hint={t("tryOn.garmentImageHint")}
            preview={garmentPreview}
            dragOver={dragOverGarment}
            inputRef={garmentInputRef}
            onFile={handleGarmentFile}
            onRemove={() => { if (garmentPreview) URL.revokeObjectURL(garmentPreview); setGarmentFile(null); setGarmentPreview(null); if (garmentInputRef.current) garmentInputRef.current.value = ""; }}
            onDragOver={setDragOverGarment}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("tryOn.description")}</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("tryOn.descriptionPlaceholder")}
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
          {loading ? t("tryOn.generating") : t("tryOn.generate")}
        </Button>
      </form>

      {result && (
        <div className="animate-slide-up space-y-4 pt-4 border-t border-border/60">
          <h3 className="text-sm font-medium text-foreground">{t("tryOn.result")}</h3>
          <div className="rounded-[14px] overflow-hidden border border-border/60 bg-card">
            <Image
              src={result.url}
              alt="Try-on result"
              width={768}
              height={1024}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(result.url, result.id)}>
              <Download size={14} />
              {t("common.download")}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { setResult(null); setDescription(""); }}>
              <RotateCcw size={14} />
              {t("tryOn.generateAgain")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function handleDownload(url: string, id: number) {
  downloadFile(url, `try-on-${id}.png`);
}

function UploadZone({
  label,
  hint,
  preview,
  dragOver,
  inputRef,
  onFile,
  onRemove,
  onDragOver,
}: {
  label: string;
  hint: string;
  preview: string | null;
  dragOver: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (f: File) => void;
  onRemove: () => void;
  onDragOver: (v: boolean) => void;
}) {
  const { t } = useLocale();

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      {preview ? (
        <div className="relative group">
          <Image
            src={preview}
            alt=""
            width={320}
            height={320}
            className="w-full h-48 object-cover rounded-[14px] border border-border/60"
            unoptimized
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 size-6 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all text-xs opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            x
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); onDragOver(true); }}
          onDragLeave={() => onDragOver(false)}
          onDrop={(e) => { e.preventDefault(); onDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group ${
            dragOver ? "border-primary bg-primary/[0.06] scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
          }`}
        >
          <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50"
          }`}>
            <Wand2 size={18} />
          </div>
          <span className={dragOver ? "text-primary font-medium" : ""}>
            {dragOver ? t("tryOn.dropImage") : t("tryOn.uploadImage")}
          </span>
          <span className="text-xs text-muted-foreground/40">{hint}</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
