"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ImageData {
  id: number;
  prompt: string;
  model: string;
  url: string;
  created_at: string;
}

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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
        <div className="mt-6 h-[50vh] bg-[var(--muted)] rounded-xl animate-pulse" />
        <div className="mt-6 h-40 bg-[var(--muted)] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard" className="text-[var(--primary)] underline text-sm mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  if (!image) return null;

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <Link href="/dashboard" className="text-[var(--primary)] underline text-sm">&larr; Back to Dashboard</Link>

        <div className="mt-6 bg-[var(--bg)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="bg-black flex items-center justify-center p-4">
            <img src={image.url} alt={image.prompt} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
          </div>

          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold">{image.prompt}</h1>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted-fg)]">Model</span>
                <p className="font-mono text-[var(--fg)]">{image.model}</p>
              </div>
              <div>
                <span className="text-[var(--muted-fg)]">Created</span>
                <p className="text-[var(--fg)]">{image.created_at}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={image.url}
                download
                className="inline-flex items-center gap-1.5 bg-[var(--primary)] text-[var(--primary-fg)] text-sm rounded-md px-4 py-2 hover:opacity-90 transition"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
