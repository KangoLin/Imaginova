"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = "image" | "video";

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const pollingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    return () => { pollingRef.current = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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

        router.push(`/image/${data.id}`);
        return;
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

        toast("Video generation started — you can leave this page and check progress in Dashboard", "info");
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
    const maxDuration = 10 * 60 * 1000;
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
          router.push(`/video/${data.id}`);
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
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-border">
        <div className="container-narrow px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]">Dashboard</Link>
            <ThemeToggle />
            <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className="text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]">Sign Out</button>
          </nav>
        </div>
      </header>

      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Create</h1>
            <p className="text-muted-foreground text-sm">Describe what you want to generate</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
            <TabsList className="mb-6 w-full bg-muted/50 p-0.5">
              <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
              <TabsTrigger value="video" className="flex-1">Video</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-1.5 text-foreground">Prompt</label>
              <Textarea
                ref={textareaRef}
                id="prompt"
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); if (textareaRef.current) autoResize(textareaRef.current); }}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(e); }}
                placeholder={tab === "image" ? "A serene mountain landscape at sunset, volumetric lighting..." : "A cinematic drone shot flying over a forest canopy..."}
                rows={3}
                required
                className="resize-none min-h-[76px] overflow-hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Reference Image (optional)</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Reference" className="w-28 h-28 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/40 hover:text-foreground rounded-full w-5 h-5 text-[10px] flex items-center justify-center transition-all cursor-pointer"
                  >
                    x
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border rounded-lg py-8 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer bg-transparent"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span>Upload an image</span>
                  </div>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
              }} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost: {tab === "image" ? "1 credit" : "2 credits"}</span>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

            <Button type="submit" disabled={loading || !prompt.trim()} className="w-full gap-2">
              {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
              {loading ? tab === "video" ? `Generating... ${progress}%` : "Generating..." : `Generate ${tab === "image" ? "Image" : "Video"}`}
            </Button>
          </form>

          {loading && tab === "video" && (
            <div className="mt-6 animate-fade-in">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(progress, 5)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">{progressPhase || "Starting..."}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
