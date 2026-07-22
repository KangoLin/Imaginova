"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";
import { Wand2, X } from "lucide-react";
import { TryOnForm } from "@/components/create/try-on-form";
import { StyleTransferForm } from "@/components/create/style-transfer-form";
import { GenderSwapForm } from "@/components/create/gender-swap-form";
import { AgeTransformForm } from "@/components/create/age-transform-form";

type Tab = "image" | "video";
type SceneMode = "general" | "try-on" | "style-transfer" | "gender-swap" | "age-transform";

interface RemixData {
  id: number; prompt: string; model: string; url: string;
  reference_url: string | null; created_at: string;
}

const IMAGE_EXAMPLES_EN = [
  "A serene mountain lake at twilight, mist rising from the water, reflected peaks, cinematic lighting",
  "A futuristic cyberpunk street market at night, neon signs reflecting on wet pavement, volumetric fog",
  "An oil painting of a cozy library with towering bookshelves, warm golden sunlight streaming through tall windows",
  "Macro photography of a dew-covered spider web catching the first morning light, bokeh background",
  "A minimalist line art portrait of a woman with flowing hair, elegant curves, soft beige background",
  "A steampunk mechanical owl with brass gears and copper feathers, detailed engraved metalwork",
];

const IMAGE_EXAMPLES_ZH = [
  "黄昏时分宁静的山中湖泊，水面升起薄雾，倒映着山峰，电影感光影",
  "未来赛博朋克风格的夜晚街头市场，霓虹灯倒映在潮湿的路面上，体积雾效果",
  "一幅油画风格的舒适图书馆，高耸的书架，温暖的阳光透过高大的窗户洒入",
  "微距摄影，露珠覆盖的蜘蛛网捕捉清晨第一缕阳光，散景背景",
  "极简线条艺术风格的女人肖像，飘逸的头发，优雅的曲线，柔和的米色背景",
  "一只蒸汽朋克风格的机械猫头鹰，黄铜齿轮和铜制羽毛，精细的雕刻金属工艺",
];

const VIDEO_EXAMPLES_EN = [
  "A cinematic drone shot flying over a misty forest canopy at sunrise, golden light piercing through trees",
  "An elegant slow-motion close-up of a dancer spinning, fabric flowing, dramatic spotlight on stage",
  "A hyperlapse of a bustling city street transitioning from day to night, neon lights flickering on",
  "A majestic waterfall cascading down moss-covered rocks, sunlight creating rainbow prisms in the mist",
  "Time-lapse of cherry blossoms blooming against a pastel sky, petals drifting in the breeze",
];

const VIDEO_EXAMPLES_ZH = [
  "电影感的无人机航拍，拂晓时分飞过薄雾笼罩的森林树冠，金色阳光穿透树林",
  "优雅的慢动作特写，舞者旋转起舞，布料飘动，舞台上戏剧性的聚光灯",
  "一段繁华城市街道从白天过渡到夜晚的超延时摄影，霓虹灯依次亮起",
  "壮观的瀑布从长满青苔的岩石上倾泻而下，阳光在水雾中形成彩虹棱镜",
  "延时摄影，樱花在柔和的天空下绽放，花瓣随风飘落",
];

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const mode = (searchParams.get("mode") as SceneMode) || "general";
  const [tab, setTab] = useState<Tab>("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoMode, setVideoMode] = useState<"standard" | "keyframes">("standard");
  const pollingRef = useRef(false);
  const pollStartRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageSize, setImageSize] = useState("1024x1024");
  const [videoWidth, setVideoWidth] = useState(1280);
  const [videoHeight, setVideoHeight] = useState(720);
  const [videoNumFrames, setVideoNumFrames] = useState(121);
  const [videoFrameRate, setVideoFrameRate] = useState(24);
  const [remixLoading, setRemixLoading] = useState(false);
  const [remixError, setRemixError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("imaginova-onboarded")) setShowHint(true);
  }, []);

  function switchMode(m: SceneMode) {
    if (m === "general") router.push("/create");
    else router.push(`/create?mode=${m}`);
  }

  useEffect(() => {
    const mode = searchParams.get("mode");
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (mode === "remix" && id && type) {
      setRemixLoading(true);
      (async () => {
        try {
          const data = await api.get<RemixData>(`/api/${type}/${id}`);
          setPrompt(data.prompt);
          setTab(type as Tab);
          if (data.reference_url) {
            setImagePreviews([data.reference_url]);
          }
        } catch (err) {
          if (err instanceof ApiError) setRemixError(err.message);
          else setRemixError("Failed to load remix data");
        }
        setRemixLoading(false);
      })();
    }
  }, [searchParams]);

  function handleDragFile(file: File) {
    if (file.type.startsWith("image/")) {
      if (tab === "video" && videoMode === "standard") {
        setImageFiles([file]);
        setImagePreviews([URL.createObjectURL(file)]);
      } else {
        setImageFiles((prev) => [...prev, file]);
        setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      }
    }
  }

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
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("model", "agnes-image-2.1-flash");
        formData.append("size", imageSize);
        for (const file of imageFiles) formData.append("image", file);
        const data = (imageFiles.length > 0
          ? await api.post("/api/generate/image", formData)
          : await api.post("/api/generate/image", { prompt, model: "agnes-image-2.1-flash", size: imageSize })) as { id: number };
        router.push(`/image/${data.id}`);
        return;
      } else {
        const formData = new FormData();
        formData.append("prompt", prompt);
        if (videoMode === "keyframes") {
          formData.append("mode", "keyframes");
          for (const file of imageFiles) formData.append("image", file);
        } else if (imageFiles.length > 0) {
          formData.append("image", imageFiles[0]);
        }
        formData.append("width", String(videoWidth));
        formData.append("height", String(videoHeight));
        formData.append("num_frames", String(videoNumFrames));
        formData.append("frame_rate", String(videoFrameRate));
        const data = (await api.post("/api/generate/video", formData)) as { id: number; task_id: string };
        toast(t("create.videoStarted"), "info");
        pollStartRef.current = Date.now();
        startSSE(data.id);
      }
    } catch (err) {
      if (err instanceof ApiError) { setError(err.message); } else { setError(t("create.networkError")); }
      setLoading(false);
    }
  }

  function startSSE(videoId: number) {
    pollingRef.current = true;
    const es = new EventSource(`/api/video/${videoId}/stream`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const p = data.progress || 0;
      setProgress(p);
      if (p <= 0) setProgressPhase(t("create.waitingInQueue"));
      else if (p < 100) setProgressPhase(t("create.generatingProgress", { progress: p }));
      else setProgressPhase(t("create.finalizing"));
      if (data.status === "completed") { es.close(); pollingRef.current = false; router.push(`/video/${videoId}`); }
      else if (data.status === "failed") { es.close(); pollingRef.current = false; setError(data.error || t("create.videoFailed")); setLoading(false); }
    };
    es.onerror = () => { es.close(); pollingRef.current = false; setError(t("create.statusCheckFailed")); setLoading(false); };
  }

  return (
    <main className="max-w-2xl mx-auto px-6 pt-24 pb-12 animate-fade-in" onPaste={(e) => { const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/")); if (item) { const f = item.getAsFile(); if (f) { e.preventDefault(); handleDragFile(f); } }; }}>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Wand2 size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">{t("create.badge")}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{t("create.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("create.subtitle")}</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => switchMode("general")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "general" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("create.title")}
          </button>
          <button
            type="button"
            onClick={() => switchMode("try-on")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "try-on" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("scene.tryOn")}
          </button>
          <button
            type="button"
            onClick={() => switchMode("style-transfer")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "style-transfer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("scene.styleTransfer")}
          </button>
          <button
            type="button"
            onClick={() => switchMode("gender-swap")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "gender-swap" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("scene.genderSwap")}
          </button>
          <button
            type="button"
            onClick={() => switchMode("age-transform")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "age-transform" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("scene.ageTransform")}
          </button>
        </div>
      </div>

      {mode === "try-on" ? (
        <TryOnForm />
      ) : mode === "style-transfer" ? (
        <StyleTransferForm />
      ) : mode === "gender-swap" ? (
        <GenderSwapForm />
      ) : mode === "age-transform" ? (
        <AgeTransformForm />
      ) : (
        <>
      {showHint && (
        <div className="mb-6 bg-primary/[0.04] border border-primary/10 rounded-xl p-4 text-sm animate-fade-in relative">
          <button onClick={() => setShowHint(false)} className="absolute top-3 right-3 size-5 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"><X size={13} /></button>
          <p className="font-medium text-foreground mb-1.5">{t("create.tips")}</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li>{"\u2022"} {t("create.tip1")}</li>
            <li>{"\u2022"} {t("create.tip2")}</li>
            <li>{"\u2022"} {t("create.tip3")}</li>
          </ul>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setImageFiles([]); setImagePreviews([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="image">{t("create.image")}</TabsTrigger>
          <TabsTrigger value="video">{t("create.video")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {remixLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">{t("common.loading")}</span>
        </div>
      )}

      {remixError && (
        <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3 mb-4">{remixError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1.5 text-foreground">{t("create.prompt")}</label>
          <Textarea
            ref={textareaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); if (textareaRef.current) autoResize(textareaRef.current); }}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(e); }}
            placeholder={tab === "image" ? "A serene mountain landscape at sunset, volumetric lighting..." : "A cinematic drone shot flying over a forest canopy..."}
            rows={3}
            required
            className="resize-none min-h-[76px] overflow-hidden text-base"
          />
        </div>

        {!prompt && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("create.tryExample")}</p>
            <div className="flex flex-wrap gap-1.5">
              {(tab === "image" ? (locale === "zh" ? IMAGE_EXAMPLES_ZH : IMAGE_EXAMPLES_EN) : (locale === "zh" ? VIDEO_EXAMPLES_ZH : VIDEO_EXAMPLES_EN)).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setPrompt(ex); if (textareaRef.current) autoResize(textareaRef.current); }}
                  className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border border-border/60 transition-all active:scale-[0.97]"
                >
                  {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.referenceImage")}</label>
          {imagePreviews.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative inline-block group">
                  <Image src={preview} alt={`Reference ${idx + 1}`} width={96} height={96} className="object-cover rounded-lg border border-border size-24" unoptimized />
                  <button type="button" onClick={() => {
                    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                  }} className="absolute -top-2 -right-2 size-5 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all text-[10px] opacity-0 group-hover:opacity-100">x</button>
                </div>
              ))}
            </div>
          ) : null}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleDragFile(f); }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl py-6 text-sm text-muted-foreground transition-all duration-300 cursor-pointer group ${
                dragOver ? "border-primary bg-primary/[0.06] scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                dragOver ? "bg-primary/20 text-primary scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-primary/50"
              }`}>
                <Wand2 size={18} />
              </div>
              <span className={dragOver ? "text-primary font-medium" : ""}>{imagePreviews.length > 0 ? (tab === "video" && videoMode === "standard" ? t("create.replaceImage") || "替换图片" : t("create.addMoreImages") || "添加更多图片") : dragOver ? t("create.dropImage") : t("create.uploadImage")}</span>
              <span className="text-xs text-muted-foreground/40">{tab === "video" && videoMode === "standard" ? (t("create.singleImageHint") || "标准模式仅支持一张参考图") : (t("create.dragHint") || "支持拖放图片到此处")}</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
            const files = e.target.files;
            if (files) {
              const isSingle = tab === "video" && videoMode === "standard";
              const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
              if (isSingle && newFiles.length > 0) {
                setImageFiles([newFiles[0]]);
                setImagePreviews([URL.createObjectURL(newFiles[0])]);
              } else {
                setImageFiles((prev) => [...prev, ...newFiles]);
                setImagePreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
              }
            }
          }} />
        </div>

        {tab === "image" && (
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.imageSize")}</label>
            <Select value={imageSize} onChange={(e) => setImageSize(e.target.value)}>
              <option value="1024x1024">{t("create.size1024")}</option>
              <option value="1024x768">{t("create.size1024_768")}</option>
              <option value="768x1024">{t("create.size768_1024")}</option>
              <option value="1024x576">{t("create.size1024_576")}</option>
              <option value="576x1024">{t("create.size576_1024")}</option>
              <option value="2048x2048">{t("create.size2048")}</option>
            </Select>
          </div>
        )}

        {tab === "video" && (
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.videoMode") || "视频模式"}</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setVideoMode("standard"); if (imageFiles.length > 1) { setImageFiles([imageFiles[0]]); setImagePreviews([imagePreviews[0]]); } }} className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all text-left ${videoMode === "standard" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  <div className="font-medium mb-0.5">{t("create.modeStandard") || "标准图生视频"}</div>
                  <div className="opacity-60 font-normal">{t("create.modeStandardDesc") || "上传一张参考图，AI 生成延续该画面的视频"}</div>
                </button>
                <button type="button" onClick={() => setVideoMode("keyframes")} className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all text-left ${videoMode === "keyframes" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  <div className="font-medium mb-0.5">{t("create.modeKeyframes") || "关键帧动画"}</div>
                  <div className="opacity-60 font-normal">{t("create.modeKeyframesDesc") || "上传多张参考图作为关键帧，AI 生成连贯过渡动画"}</div>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.videoResolution")}</label>
              <Select value={`${videoWidth}x${videoHeight}`} onChange={(e) => { const [w, h] = e.target.value.split("x").map(Number); setVideoWidth(w); setVideoHeight(h); }}>
                <option value="854x480">{t("create.res480p")}</option>
                <option value="1280x720">{t("create.res720p")}</option>
                <option value="1920x1080">{t("create.res1080p")}</option>
                <option value="480x854">{t("create.res480pPortrait")}</option>
                <option value="720x1280">{t("create.res720pPortrait")}</option>
                <option value="1080x1920">{t("create.res1080pPortrait")}</option>
                <option value="480x480">{t("create.res480pSquare")}</option>
                <option value="720x720">{t("create.res720pSquare")}</option>
                <option value="1080x1080">{t("create.res1080pSquare")}</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.videoDuration")}</label>
              <Select value={videoNumFrames} onChange={(e) => setVideoNumFrames(Number(e.target.value))}>
                <option value={81}>{t("create.dur3s")}</option>
                <option value={121}>{t("create.dur5s")}</option>
                <option value={241}>{t("create.dur10s")}</option>
                <option value={441}>{t("create.dur18s")}</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.frameRate")}</label>
              <Select value={videoFrameRate} onChange={(e) => setVideoFrameRate(Number(e.target.value))}>
                <option value={24}>24 {t("create.fps")}</option>
                <option value={30}>30 {t("create.fps")}</option>
                <option value={60}>60 {t("create.fps")}</option>
              </Select>
            </div>
          </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("create.cost")}: {tab === "image" ? `1 ${t("create.credit")}` : `2 ${t("create.credits")}`}</span>
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

        <Button type="submit" disabled={loading || !prompt.trim()} className="w-full gap-2 h-11 text-base">
          {loading && <LoadingSpinner />}
          {loading ? tab === "video" ? t("create.generatingVideo", { progress }) : t("create.generating") : `${t("create.generate")} ${tab === "image" ? t("create.image") : t("create.video")}`}
        </Button>
      </form>

      {loading && tab === "video" && (() => {
        const elapsed = pollStartRef.current ? (Date.now() - pollStartRef.current) / 1000 : 0;
        const eta = progress > 0 && progress < 100 && elapsed > 0
          ? Math.round((elapsed / progress) * (100 - progress)) : 0;
        const etaText = eta >= 60 ? `${Math.floor(eta / 60)}m ${eta % 60}s` : `${eta}s`;
        return (
          <div className="mt-6 animate-fade-in">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(progress, 5)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {progressPhase || t("create.starting")}
              {eta > 0 && <span className="ml-2 text-muted-foreground/60">({t("create.remaining", { time: etaText })})</span>}
            </p>
          </div>
        );
      })()}
      </>
      )}
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      </main>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
