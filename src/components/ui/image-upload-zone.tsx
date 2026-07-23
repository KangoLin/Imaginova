"use client";

import { type RefObject } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

export function ImageUploadZone({
  label,
  hint,
  preview,
  dragOver,
  uploadText,
  dropText,
  onFile,
  onRemove,
  onDragOver,
  inputRef,
  compact,
  loading,
}: {
  label: string;
  hint: string;
  preview: string | null;
  dragOver: boolean;
  uploadText: string;
  dropText: string;
  onFile: (f: File) => void;
  onRemove: () => void;
  onDragOver: (v: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  compact?: boolean;
  loading?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      {loading ? (
        <div className={`${compact ? "" : "max-w-sm"} w-full h-48 rounded-[14px] border border-border/60 bg-muted/30 animate-shimmer bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20`} />
      ) : preview ? (
        <div className="relative group">
          <Image
            src={preview}
            alt=""
            width={320}
            height={320}
            className="w-full h-48 object-cover rounded-[14px] border border-border/60 group-hover:border-primary/30 transition-colors duration-300"
            unoptimized
          />
          <div className="absolute inset-0 rounded-[14px] bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-300" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 size-7 rounded-full bg-background/90 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all text-xs opacity-0 group-hover:opacity-100 backdrop-blur-sm active:scale-90"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); onDragOver(true); }}
          onDragLeave={() => onDragOver(false)}
          onDrop={(e) => { e.preventDefault(); onDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`${compact ? "" : "max-w-sm"} w-full h-48 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group active:scale-[0.99] ${
            dragOver ? "border-primary bg-primary/[0.06] scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
          }`}
        >
          <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50"
          }`}>
            <ImageIcon size={18} />
          </div>
          <span className={`transition-colors duration-200 ${dragOver ? "text-primary font-medium" : ""}`}>
            {dragOver ? dropText : uploadText}
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
