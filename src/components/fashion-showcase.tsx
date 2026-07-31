"use client";

import { ImageIcon, Sparkles } from "lucide-react";

export interface ShowcaseItem {
  id: number;
  before: { src?: string; label: string };
  after: { src?: string; label: string };
  caption: string;
}

const defaultItems: ShowcaseItem[] = [
  {
    id: 1,
    before: { label: "Product flat lay" },
    after: { label: "Model shot" },
    caption: "Product photo → Model shot",
  },
  {
    id: 2,
    before: { label: "Garment on hanger" },
    after: { label: "Lifestyle scene" },
    caption: "Flat lay → Lifestyle",
  },
  {
    id: 3,
    before: { label: "Single angle" },
    after: { label: "Multiple angles" },
    caption: "Single item → Campaign set",
  },
  {
    id: 4,
    before: { label: "Static product" },
    after: { label: "Motion video" },
    caption: "Photo → Video ad",
  },
];

interface FashionShowcaseProps {
  items?: ShowcaseItem[];
}

export function FashionShowcase({ items = defaultItems }: FashionShowcaseProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="rounded-[14px] border border-border/60 bg-card overflow-hidden group animate-slide-up"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="grid grid-cols-2 divide-x divide-border/60">
            <div className="relative aspect-square bg-muted/30 p-4 flex items-center justify-center">
              {item.before.src ? (
                <img
                  src={item.before.src}
                  alt={item.before.label}
                  className="size-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Before</p>
                  <div className="size-16 mx-auto rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                    <ImageIcon size={28} />
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-2">{item.before.label}</p>
                </div>
              )}
            </div>
            <div className="relative aspect-square bg-muted/30 p-4 flex items-center justify-center">
              {item.after.src ? (
                <img
                  src={item.after.src}
                  alt={item.after.label}
                  className="size-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <p className="text-xs font-medium text-primary mb-2">After</p>
                  <div className="size-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary/40">
                    <Sparkles size={28} />
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-2">{item.after.label}</p>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground text-center">{item.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
