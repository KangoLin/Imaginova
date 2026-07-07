"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      if (meRes.status === 401) { router.push("/login"); return; }
      const meData = await meRes.json();
      setUser(meData);

      const [imgRes, vidRes] = await Promise.all([
        fetch("/api/me/images"),
        fetch("/api/me/videos"),
      ]);
      setImages(await imgRes.json());
      setVideos(await vidRes.json());
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{user.name}</span>
            <span>{user.email}</span>
            <span className="font-medium text-blue-600">{user.credits} credits</span>
          </div>
        </div>
        <form action="/api/logout" method="POST">
          <button className="text-sm text-gray-400 hover:text-red-500">Sign Out</button>
        </form>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setTab("images")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 ${
            tab === "images"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Images ({images.length})
        </button>
        <button
          onClick={() => setTab("videos")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 ${
            tab === "videos"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
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
              className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition"
              onClick={() => setSelectedImage(img.url)}
            >
              <img src={img.url} alt={img.prompt} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="text-sm text-gray-700 truncate">{img.prompt}</p>
                <p className="text-xs text-gray-400 mt-1">{img.created_at}</p>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <p className="col-span-full text-gray-500 text-sm py-8 text-center">
              No images yet.{" "}
              <Link href="/create" className="text-blue-600 underline">Create one</Link>
            </p>
          )}
        </div>
      )}

      {tab === "videos" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition"
              onClick={() => vid.url && setSelectedVideo(`/api/proxy/video?url=${encodeURIComponent(vid.url)}`)}
            >
              {vid.status === "completed" && vid.url ? (
                <video src={`/api/proxy/video?url=${encodeURIComponent(vid.url)}`} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  {vid.status === "processing" ? `Processing (${vid.progress}%)` : vid.status}
                </div>
              )}
              <div className="p-3">
                <p className="text-sm text-gray-700 truncate">{vid.prompt}</p>
                <p className="text-xs text-gray-400 mt-1">{vid.created_at}</p>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="col-span-full text-gray-500 text-sm py-8 text-center">
              No videos yet.{" "}
              <Link href="/create" className="text-blue-600 underline">Create one</Link>
            </p>
          )}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-full rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <video
            src={selectedVideo}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
