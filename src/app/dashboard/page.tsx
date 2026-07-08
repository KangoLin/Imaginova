"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { GridSkeleton } from "@/components/skeleton";

type Tab = "images" | "videos";

interface ImageItem {
  id: number;
  prompt: string;
  model: string;
  url: string;
  created_at: string;
}

interface VideoItem {
  id: number;
  prompt: string;
  model: string;
  status: string;
  url: string | null;
  progress: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("images");
  const [user, setUser] = useState<{ name: string; email: string; credits: number } | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinMsg, setCheckinMsg] = useState("");
  const [checkinErr, setCheckinErr] = useState("");

  const loadUser = async () => {
    const meRes = await fetch("/api/me");
    if (meRes.status === 401) { router.push("/login"); return; }
    setUser(await meRes.json());
  };

  useEffect(() => {
    (async () => {
      await loadUser();

      const [imgRes, vidRes] = await Promise.all([
        fetch("/api/me/images"),
        fetch("/api/me/videos"),
      ]);
      setImages(await imgRes.json());
      setVideos(await vidRes.json());
      setLoading(false);
    })();
  }, [router]);

  const handleCheckin = async () => {
    setCheckinMsg("");
    setCheckinErr("");
    const res = await fetch("/api/credits/checkin", { method: "POST" });
    const data = await res.json();
    if (data.error) {
      setCheckinErr(data.error);
    } else {
      setCheckinMsg(`Checked in! +${data.reward} credit`);
      setUser((prev) => prev ? { ...prev, credits: data.credits } : prev);
    }
    setTimeout(() => { setCheckinMsg(""); setCheckinErr(""); }, 3000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="h-8 w-48 bg-[var(--muted)] rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-[var(--muted)] rounded animate-pulse" />
        </div>
        <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
          <div className="h-8 w-24 bg-[var(--muted)] rounded-t animate-pulse" />
          <div className="h-8 w-24 bg-[var(--muted)] rounded-t animate-pulse" />
        </div>
        <GridSkeleton count={6} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <div className="flex items-center gap-4 text-sm text-[var(--muted-fg)]">
            <span>{user.name}</span>
            <span>{user.email}</span>
            <Link href="/credits" className="font-medium text-[var(--primary)] hover:underline">{user.credits} credits</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {checkinMsg && <span className="text-xs text-green-600">{checkinMsg}</span>}
          {checkinErr && <span className="text-xs text-red-600">{checkinErr}</span>}
          <button onClick={handleCheckin} className="text-xs border border-[var(--border)] text-[var(--primary)] rounded-md px-3 py-1 hover:bg-[var(--muted)] transition">Check In</button>
          <Link href="/settings" className="text-xs text-[var(--muted-fg)] hover:text-[var(--fg)] transition">Settings</Link>
          <ThemeToggle />
          <form action="/api/logout" method="POST">
            <button className="text-sm text-[var(--muted-fg)] hover:text-red-500 transition">Sign Out</button>
          </form>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
        <button
          onClick={() => setTab("images")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition ${
            tab === "images"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]"
          }`}
        >
          Images ({images.length})
        </button>
        <button
          onClick={() => setTab("videos")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition ${
            tab === "videos"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]"
          }`}
        >
          Videos ({videos.length})
        </button>
      </div>

      {tab === "images" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="border border-[var(--border)] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition hover:scale-[1.02] bg-[var(--bg)]"
              onClick={() => router.push(`/image/${img.id}`)}
            >
              <img src={img.url} alt={img.prompt} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="text-sm text-[var(--fg)] truncate">{img.prompt}</p>
                <p className="text-xs text-[var(--muted-fg)] mt-1">{img.created_at}</p>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <p className="col-span-full text-[var(--muted-fg)] text-sm py-8 text-center">
              No images yet.{" "}
              <Link href="/create" className="text-[var(--primary)] underline">Create one</Link>
            </p>
          )}
        </div>
      )}

      {tab === "videos" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="border border-[var(--border)] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition hover:scale-[1.02] bg-[var(--bg)]"
              onClick={() => router.push(`/video/${vid.id}`)}
            >
              {vid.status === "completed" && vid.url ? (
                <video src={vid.url} preload="metadata" muted playsInline className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-[var(--muted)] flex items-center justify-center text-[var(--muted-fg)] text-sm">
                  {vid.status === "processing" ? `Processing (${vid.progress}%)` : vid.status}
                </div>
              )}
              <div className="p-3">
                <p className="text-sm text-[var(--fg)] truncate">{vid.prompt}</p>
                <p className="text-xs text-[var(--muted-fg)] mt-1">{vid.created_at}</p>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="col-span-full text-[var(--muted-fg)] text-sm py-8 text-center">
              No videos yet.{" "}
              <Link href="/create" className="text-[var(--primary)] underline">Create one</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
