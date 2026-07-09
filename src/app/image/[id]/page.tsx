"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImageData { id: number; prompt: string; model: string; url: string; created_at: string; }

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/image/${params.id}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { setError("Image not found"); setLoading(false); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); } else { setImage(data); }
      setLoading(false);
    })();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container-narrow px-6 py-12">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-6" />
        <div className="aspect-[4/3] bg-muted rounded-xl animate-pulse mb-6" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow px-6 py-12 animate-fade-in">
        <div className="bg-destructive/5 rounded-lg p-4 text-sm text-destructive">{error}</div>
        <Link href="/dashboard" className="text-primary text-sm mt-4 inline-block hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  if (!image) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-border">
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Dashboard</Link>
        </div>
      </header>

      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl overflow-hidden border border-border/60">
            <div className="bg-[#0a0a0a] flex items-center justify-center p-6">
              <img src={image.url} alt={image.prompt} className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            </div>
            <div className="p-6 space-y-5">
              <h1 className="text-xl font-bold leading-snug">{image.prompt}</h1>
              <div className="flex gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">Model</span>
                  <span className="font-medium">{image.model}</span>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                  <span className="text-muted-foreground text-xs block">Created</span>
                  <span className="font-medium">{image.created_at}</span>
                </div>
              </div>
              <a href={image.url} download><Button>Download</Button></a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
