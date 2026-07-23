"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  aspectRatio?: number;
  loading?: boolean;
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, aspectRatio = 1, loading }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setPosition((x / rect.width) * 100);
    };
    const handleUp = () => setDragging(false);
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
  }, [dragging]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/30 animate-shimmer bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20" style={{ aspectRatio }} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-lg border transition-colors duration-300 ${dragging ? "border-primary/40" : "border-border/60"} bg-muted/30 group`}
      style={{ aspectRatio }}
      onPointerDown={onPointerDown}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20" />
      )}
      <Image src={beforeSrc} alt="Before" fill className={`object-cover pointer-events-none transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`} unoptimized onLoad={() => setImageLoaded(true)} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={afterSrc} alt="After" fill className={`object-cover pointer-events-none transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`} unoptimized onLoad={() => setImageLoaded(true)} />
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none transition-colors duration-200"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 ${dragging ? "bg-primary text-primary-foreground scale-110" : "bg-white text-muted-foreground"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
