"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Tab = "image" | "video";

export default function CreatePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const pollingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { pollingRef.current = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultUrl(null);
    setProgress(0);
    setLoading(true);

    try {
      if (tab === "image") {
        let res: Response;
        if (imageFile) {
          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("model", "agnes-image-2.1-flash");
          formData.append("image", imageFile);
          res = await fetch("/api/generate/image", { method: "POST", body: formData });
        } else {
          res = await fetch("/api/generate/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model: "agnes-image-2.1-flash" }),
          });
        }

        if (res.status === 401) { router.push("/login"); return; }

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Generation failed");
          setLoading(false);
          return;
        }

        setResultUrl(data.url);
        setLoading(false);
      } else {
        let res: Response;
        if (imageFile) {
          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("image", imageFile);
          res = await fetch("/api/generate/video", { method: "POST", body: formData });
        } else {
          res = await fetch("/api/generate/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });
        }

        if (res.status === 401) { router.push("/login"); return; }

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Video creation failed");
          setLoading(false);
          return;
        }

        pollStatus(data.task_id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(`Request failed: ${msg}. Server may be restarting, please retry.`);
      setLoading(false);
    }
  }

  async function pollStatus(taskId: string) {
    pollingRef.current = true;
    const startTime = Date.now();
    const maxDuration = 10 * 60 * 1000; // 10 minutes max (API queuing can be slow)
    let failCount = 0;

    while (pollingRef.current) {
      if (Date.now() - startTime > maxDuration) {
        setError("Video generation timed out after 10 minutes");
        setLoading(false);
        pollingRef.current = false;
        return;
      }

      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/generate/video?taskId=${taskId}`);
        const data = await res.json();
        if (data.error) { setError(data.error); setLoading(false); pollingRef.current = false; return; }

        const p = data.progress || 0;
        setProgress(p);

        if (p <= 0) setProgressPhase("Waiting in queue...");
        else if (p < 100) setProgressPhase(`Generating (${p}%)...`);
        else setProgressPhase("Finalizing...");

        if (data.status === "completed") {
          setResultUrl(data.url);
          setProgressPhase("Done");
          setLoading(false);
          pollingRef.current = false;
          return;
        }
        if (data.status === "failed") {
          setError(data.error ? `Video generation failed: ${data.error}` : "Video generation failed");
          setLoading(false);
          pollingRef.current = false;
          return;
        }
        failCount = 0;
      } catch {
        failCount++;
        if (failCount >= 3) {
          setError("Status check failed after 3 retries");
          setLoading(false);
          pollingRef.current = false;
          return;
        }
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <nav className="flex items-center justify-between mb-8">
        <span className="font-bold text-lg">Imaginova</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-[var(--muted-fg)] hover:text-[var(--fg)] transition">Dashboard</Link>
          <ThemeToggle />
          <form action="/api/logout" method="POST" className="inline">
            <button className="text-[var(--muted-fg)] hover:text-red-500 transition">Sign Out</button>
          </form>
        </div>
      </nav>
      <h1 className="text-2xl font-bold mb-8 animate-fade-in">Create</h1>

      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
        <button
          onClick={() => { setTab("image"); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition ${
            tab === "image"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]"
          }`}
        >
          Image
        </button>
        <button
          onClick={() => { setTab("video"); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition ${
            tab === "video"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]"
          }`}
        >
          Video
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              tab === "image"
                ? "A serene mountain landscape at sunset..."
                : "A cinematic drone shot flying over a forest..."
            }
            rows={3}
            className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--fg)] resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reference Image (optional)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Reference" className="w-32 h-32 object-cover rounded-md border border-[var(--border)]" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
              >
                x
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[var(--border)] rounded-md py-8 text-sm text-[var(--muted-fg)] hover:text-[var(--fg)] hover:border-[var(--muted-fg)] transition cursor-pointer"
            >
              + Upload Image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                const url = URL.createObjectURL(file);
                setImagePreview(url);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
          <span>{tab === "image" ? "1 credit" : "2 credits"}</span>
        </div>

        {error && <p className="text-red-600 text-sm animate-fade-in">{error}</p>}

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-[var(--primary)] text-[var(--primary-fg)] rounded-md py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {loading
            ? tab === "video"
              ? `Generating video... ${progress}%`
              : "Generating..."
            : `Generate ${tab === "image" ? "Image" : "Video"}`}
        </button>
      </form>

      {loading && tab === "video" && (
        <div className="mt-8 animate-fade-in">
          <div className="w-full bg-[var(--muted)] rounded-full h-2.5">
            <div
              className="bg-[var(--primary)] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--muted-fg)] mt-1 text-center">
            {progressPhase || "Starting..."}
          </p>
        </div>
      )}

      {resultUrl && (
        <div className="mt-8 animate-fade-in">
          <h2 className="text-lg font-semibold mb-3">Result</h2>
          {tab === "image" ? (
            <img
              src={resultUrl}
              alt={prompt}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <video
              src={resultUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-lg shadow-lg"
            />
          )}
        </div>
      )}
    </div>
  );
}
