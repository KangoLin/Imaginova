"use client";

import { type RefObject } from "react";
import Image from "next/image";
import { Wand2 } from "lucide-react";

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
}) {
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
          className={`${compact ? "" : "max-w-sm"} w-full h-48 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group ${
            dragOver ? "border-primary bg-primary/[0.06] scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
          }`}
        >
          <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50"
          }`}>
            <Wand2 size={18} />
          </div>
          <span className={dragOver ? "text-primary font-medium" : ""}>
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
