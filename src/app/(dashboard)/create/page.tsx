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
import { Wand2, X, Gamepad2, ImageIcon, Shirt, Paintbrush, Sparkles } from "lucide-react";
import { TryOnForm } from "@/components/create/try-on-form";
import { StyleTransferForm } from "@/components/create/style-transfer-form";
import { GenderSwapForm } from "@/components/create/gender-swap-form";
import { AgeTransformForm } from "@/components/create/age-transform-form";
import { GenerationResult } from "@/components/create/generation-result";

type StudioMode = "product-photography" | "fashion" | "game" | "style" | "free";
type FreeTab = "image" | "video";

interface RemixData {
  id: number; prompt: string; model: string; url: string;
  reference_url: string | null; created_at: string;
}

function nowMs(): number {
  return Date.now();
}

const PRODUCT_EXAMPLES_EN = [
  "A sleek black wireless mouse on a minimalist white desk, soft studio lighting, shallow depth of field",
  "A luxury perfume bottle with gold accents, dramatic side lighting, dark gradient background",
  "A ceramic coffee mug with steam rising, warm morning light, rustic wooden table texture",
  "A pair of white sneakers on a clean pastel background, natural diffused lighting, 3/4 angle",
  "A minimalist watch on a marble surface, soft window light casting gentle shadows, neutral tones",
  "A skincare bottle with dropper, soft focus background, clean and modern aesthetic, natural lighting",
];

const PRODUCT_EXAMPLES_ZH = [
  "一只黑色无线鼠标放在极简白色桌面上，柔和影棚灯光，浅景深效果",
  "一瓶带有金色点缀的奢华香水，戏剧性侧光，深色渐变背景",
  "一只冒着热气的陶瓷咖啡杯，温暖的晨光，质朴的木桌纹理",
  "一双白色运动鞋在干净的浅色背景上，自然漫射光，3/4侧面角度",
  "一款极简手表在大理石表面上，柔和窗光投下轻柔阴影，中性色调",
  "一瓶带滴管的护肤品瓶，柔焦背景，干净现代的美学风格，自然光",
];

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

const studios = [
  { mode: "product-photography" as StudioMode, labelKey: "create.campaignStudio", descKey: "create.campaignStudioDesc" },
  { mode: "fashion" as StudioMode, labelKey: "create.fashionStudio", descKey: "create.fashionStudioDesc" },
  { mode: "game" as StudioMode, labelKey: "create.gameStudio", descKey: "create.gameStudioDesc" },
  { mode: "style" as StudioMode, labelKey: "create.styleStudio", descKey: "create.styleStudioDesc" },
  { mode: "free" as StudioMode, labelKey: "create.freeStudio", descKey: "create.freeStudioDesc" },
];

const studioIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "product-photography": ImageIcon,
  fashion: Shirt,
  game: Gamepad2,
  style: Paintbrush,
  free: Sparkles,
};

const gameStyleDefs = [
  { id: "fantasy", labelKey: "create.gameStyleFantasy" },
  { id: "cyberpunk", labelKey: "create.gameStyleCyberpunk" },
  { id: "pixel-art", labelKey: "create.gameStylePixelArt" },
  { id: "anime", labelKey: "create.gameStyleAnime" },
  { id: "rpg", labelKey: "create.gameStyleRpg" },
  { id: "sci-fi", labelKey: "create.gameStyleSciFi" },
];

const studioTitleKey: Record<StudioMode, string> = {
  "product-photography": "create.campaignStudio",
  fashion: "create.fashionStudio",
  game: "create.gameStudio",
  style: "create.styleStudio",
  free: "create.freeStudio",
};

const studioDescKey: Record<StudioMode, string> = {
  "product-photography": "create.campaignStudioDesc",
  fashion: "create.fashionStudioDesc",
  game: "create.gameStudioDesc",
  style: "create.styleStudioDesc",
  free: "create.freeStudioDesc",
};

function VideoProgressBar({ progress, progressPhase, pollStartRef, t }: {
  progress: number; progressPhase: string;
  pollStartRef: React.RefObject<number>;
  t: (k: string, p?: Record<string, string | number>) => string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(nowMs() - (pollStartRef.current || nowMs()));
    }, 1000);
    return () => clearInterval(interval);
  }, [pollStartRef]);

  const elapsedSec = elapsed / 1000;
  const eta = progress > 0 && progress < 100 && elapsedSec > 0
    ? Math.round((elapsedSec / progress) * (100 - progress)) : 0;
  const etaText = eta >= 60 ? `${Math.floor(eta / 60)}m ${eta % 60}s` : `${eta}s`;

  return (
    <div className="mt-6 animate-fade-in">
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full bg-foreground/30 transition-all duration-500" style={{ width: `${Math.max(progress, 5)}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {progressPhase || t("create.starting")}
        {eta > 0 && <span className="ml-2 text-muted-foreground/60">({t("create.remaining", { time: etaText })})</span>}
      </p>
    </div>
  );
}

function ImageGenerationForm({
  prompt, setPrompt, loading, error, imageFiles, imagePreviews, imageSize, setImageSize, dragOver,
  textareaRef, fileInputRef, showHint, examplesEn, examplesZh, locale, t, handleSubmit,
  setImageFiles, setImagePreviews, handleDragFile, setDragOver, progress,
  progressPhase, pollStartRef, isVideo, videoWidth, videoHeight, videoNumFrames,
  videoFrameRate, setVideoSize, setVideoNumFrames, setVideoFrameRate, videoMode,
  setVideoMode,
}: {
  prompt: string; setPrompt: (v: string) => void; loading: boolean; error: string;
  imageFiles: File[]; imagePreviews: string[]; imageSize: string; setImageSize: (v: string) => void; dragOver: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showHint: boolean; examplesEn: string[]; examplesZh: string[];
  locale: string; t: (k: string, p?: Record<string, string | number>) => string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setImageFiles: (v: File[] | ((prev: File[]) => File[])) => void;
  setImagePreviews: (v: string[] | ((prev: string[]) => string[])) => void;
  handleDragFile: (f: File) => void; setDragOver: (v: boolean) => void;
  progress: number; progressPhase: string;
  pollStartRef: React.RefObject<number>; isVideo?: boolean;
  videoWidth?: number; videoHeight?: number; videoNumFrames?: number;
  videoFrameRate?: number;
  setVideoSize?: (w: number, h: number) => void;
  setVideoNumFrames?: (v: number) => void; setVideoFrameRate?: (v: number) => void;
  videoMode?: string; setVideoMode?: (v: "standard" | "keyframes") => void;
}) {
  const [hintDismissed, setHintDismissed] = useState(false);
  const showHintLocal = showHint && !hintDismissed;

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {showHintLocal && (
        <div className="mb-2 bg-muted/30 border border-border/60 rounded-xl p-4 text-sm animate-fade-in relative">
          <button onClick={() => setHintDismissed(true)} className="absolute top-3 right-3 size-5 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"><X size={13} /></button>
          <p className="font-medium text-foreground mb-1.5">{t("create.tips")}</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li>{"\u2022"} {t("create.tip1")}</li>
            <li>{"\u2022"} {t("create.tip2")}</li>
            <li>{"\u2022"} {t("create.tip3")}</li>
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium mb-1.5 text-foreground">{t("create.prompt")}</label>
        <Textarea
          ref={textareaRef}
          id="prompt"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); if (textareaRef.current) autoResize(textareaRef.current); }}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(e); }}
          placeholder={isVideo ? "A cinematic drone shot flying over a forest canopy..." : "A serene mountain landscape at sunset, volumetric lighting..."}
          rows={3}
          required
          className="resize-none min-h-[76px] overflow-hidden text-base"
        />
      </div>

      {!prompt && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">{t("create.tryExample")}</p>
          <div className="flex flex-wrap gap-1.5">
            {(locale === "zh" ? examplesZh : examplesEn).map((ex) => (
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
              dragOver ? "border-foreground/40 bg-muted/20 scale-[1.02]" : "border-border/60 hover:border-foreground/30 hover:bg-muted/10"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              dragOver ? "bg-muted/40 text-foreground scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-foreground/50"
            }`}>
              <Wand2 size={18} />
            </div>
            <span className={dragOver ? "text-foreground font-medium" : ""}>{imagePreviews.length > 0 ? (isVideo && videoMode === "standard" ? t("create.replaceImage") : t("create.addMoreImages")) : dragOver ? t("create.dropImage") : t("create.uploadImage")}</span>
            <span className="text-xs text-muted-foreground/40">{isVideo && videoMode === "standard" ? t("create.singleImageHint") : t("create.dragHint")}</span>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
          const files = e.target.files;
          if (files) {
            const isSingle = isVideo && videoMode === "standard";
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

      {!isVideo && (
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

      {isVideo && (
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.videoMode") || "Video Mode"}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setVideoMode?.("standard"); if (imageFiles.length > 1) { setImageFiles([imageFiles[0]]); setImagePreviews([imagePreviews[0]]); } }} className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all text-left ${videoMode === "standard" ? "border-foreground/30 bg-muted/30 text-foreground" : "border-border/60 text-muted-foreground hover:border-foreground/30"}`}>
                <div className="font-medium mb-0.5">{t("create.modeStandard") || "Standard"}</div>
                <div className="opacity-60 font-normal">{t("create.modeStandardDesc") || "Upload one reference image, AI generates a video continuing that scene"}</div>
              </button>
              <button type="button" onClick={() => setVideoMode?.("keyframes")} className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all text-left ${videoMode === "keyframes" ? "border-foreground/30 bg-muted/30 text-foreground" : "border-border/60 text-muted-foreground hover:border-foreground/30"}`}>
                <div className="font-medium mb-0.5">{t("create.modeKeyframes") || "Keyframe Animation"}</div>
                <div className="opacity-60 font-normal">{t("create.modeKeyframesDesc") || "Upload multiple reference images as keyframes"}</div>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.videoResolution")}</label>
            <Select value={`${videoWidth}x${videoHeight}`} onChange={(e) => { const [w, h] = e.target.value.split("x").map(Number); setVideoSize?.(w, h); }}>
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
            <Select value={videoNumFrames} onChange={(e) => setVideoNumFrames?.(Number(e.target.value))}>
              <option value={81}>{t("create.dur3s")}</option>
              <option value={121}>{t("create.dur5s")}</option>
              <option value={241}>{t("create.dur10s")}</option>
              <option value={441}>{t("create.dur18s")}</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.frameRate")}</label>
            <Select value={videoFrameRate} onChange={(e) => setVideoFrameRate?.(Number(e.target.value))}>
              <option value={24}>24 {t("create.fps")}</option>
              <option value={30}>30 {t("create.fps")}</option>
              <option value={60}>60 {t("create.fps")}</option>
            </Select>
          </div>
        </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("create.cost")}: {isVideo ? `2 ${t("create.credits")}` : `1 ${t("create.credit")}`}</span>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

      <Button type="submit" disabled={loading || !prompt.trim()} className="w-full gap-2 h-11 text-base">
        {loading && <LoadingSpinner />}
        {loading ? (isVideo ? t("create.generatingVideo", { progress }) : t("create.generating")) : `${t("create.generate")} ${isVideo ? t("create.video") : t("create.image")}`}
      </Button>

      {loading && isVideo && (
        <VideoProgressBar progress={progress} progressPhase={progressPhase} pollStartRef={pollStartRef} t={t} />
      )}
    </form>
  );
}

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const rawMode = searchParams.get("mode");
  const remixType = searchParams.get("type");
  const studioMode: StudioMode = rawMode === "remix"
    ? (remixType === "video" ? "free" : "product-photography")
    : (rawMode as StudioMode) || "product-photography";
  const initialFreeTab: FreeTab = rawMode === "remix" && remixType === "video"
    ? "video"
    : (searchParams.get("tab") as FreeTab) || "image";
  const [freeTab, setFreeTab] = useState<FreeTab>(initialFreeTab);
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
  const [result, setResult] = useState<{ type: "image" | "video"; id: number; url: string } | null>(null);
  const [videoWidth, setVideoWidth] = useState(1280);
  const [videoHeight, setVideoHeight] = useState(720);
  const [videoNumFrames, setVideoNumFrames] = useState(121);
  const [videoFrameRate, setVideoFrameRate] = useState(24);
  const [remixLoading, setRemixLoading] = useState(false);
  const [remixError, setRemixError] = useState("");
  const [gameStyle, setGameStyle] = useState("fantasy");
  const [fashionTab, setFashionTab] = useState<"try-on" | "gender-swap" | "age-transform">("try-on");

  useEffect(() => {
    if (!localStorage.getItem("imaginova-onboarded")) requestAnimationFrame(() => setShowHint(true));
  }, []);

  function switchMode(m: StudioMode) {
    setResult(null);
    setImageFiles([]);
    setImagePreviews([]);
    if (m === "product-photography") router.push("/create");
    else router.push(`/create?mode=${m}`);
  }

  useEffect(() => {
    const mode = searchParams.get("mode");
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (mode === "remix" && id && type) {
      (async () => {
        setRemixLoading(true);
        try {
          const data = await api.get<RemixData>(`/api/${type}/${id}`);
          setPrompt(data.prompt);
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
      setImageFiles((prev) => [...prev, file]);
      setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
    }
  }

  useEffect(() => {
    return () => { pollingRef.current = false; };
  }, []);

  async function runImageGeneration(effectivePrompt: string) {
    setError("");
    setProgress(0);
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("prompt", effectivePrompt);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", imageSize);
      for (const file of imageFiles) formData.append("image", file);
      const data = (imageFiles.length > 0
        ? await api.post("/api/generate/image", formData)
        : await api.post("/api/generate/image", { prompt: effectivePrompt, model: "agnes-image-2.1-flash", size: imageSize })) as { id: number; url: string };
      setResult({ type: "image", id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) { setError(err.message); } else { setError(t("create.networkError")); }
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runImageGeneration(prompt);
  }

  async function runVideoGeneration() {
    setError("");
    setProgress(0);
    setLoading(true);
    setResult(null);

    try {
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
      pollStartRef.current = nowMs();
      startSSE(data.id);
    } catch (err) {
      if (err instanceof ApiError) { setError(err.message); } else { setError(t("create.networkError")); }
      setLoading(false);
    }
  }

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runVideoGeneration();
  }

  async function handleGameSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runImageGeneration(`[${gameStyle} style] ${prompt}`);
  }

  function handleResultRegenerate() {
    if (!result) return;
    if (result.type === "video") { void runVideoGeneration(); return; }
    if (studioMode === "game") { void runImageGeneration(`[${gameStyle} style] ${prompt}`); return; }
    void runImageGeneration(prompt);
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
      if (data.status === "completed") {
        es.close();
        pollingRef.current = false;
        setLoading(false);
        setResult({ type: "video", id: videoId, url: data.url });
      }
      else if (data.status === "failed") { es.close(); pollingRef.current = false; setError(data.error || t("create.videoFailed")); setLoading(false); }
    };
    es.onerror = () => { es.close(); pollingRef.current = false; setError(t("create.statusCheckFailed")); setLoading(false); };
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <main className="mx-auto px-6 pt-24 pb-12 animate-fade-in max-w-4xl" onPaste={(e) => { const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/")); if (item) { const f = item.getAsFile(); if (f) { e.preventDefault(); handleDragFile(f); } }; }}>
      <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Wand2 size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">{t("create.badge")}</span>
          </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{t(studioTitleKey[studioMode])}</h1>
        <p className="text-sm text-muted-foreground">{t(studioDescKey[studioMode])}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {studios.map(({ mode, labelKey, descKey }) => {
          const StudioIcon = studioIcons[mode];
          return (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              className={`rounded-xl p-3.5 text-left transition-all border ${
                studioMode === mode
                  ? "border-foreground/30 bg-card shadow-sm ring-1 ring-foreground/10"
                  : "border-border/60 bg-card hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5"
              }`}
            >
              {StudioIcon && (
                <div className={`size-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                  studioMode === mode ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground group-hover:bg-foreground/5"
                }`}>
                  <StudioIcon size={15} />
                </div>
              )}
              <div className="text-sm font-medium text-foreground mb-0.5">{t(labelKey)}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{t(descKey)}</div>
            </button>
          );
        })}
      </div>

      {remixLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">{t("common.loading")}</span>
        </div>
      )}

      {remixError && (
        <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3 mb-4">{remixError}</p>
      )}

      {studioMode === "product-photography" && (
        <ImageGenerationForm
          prompt={prompt} setPrompt={setPrompt} loading={loading} error={error}
          imageFiles={imageFiles} imagePreviews={imagePreviews} imageSize={imageSize} setImageSize={setImageSize}
          dragOver={dragOver} textareaRef={textareaRef} fileInputRef={fileInputRef}
          showHint={showHint} examplesEn={PRODUCT_EXAMPLES_EN} examplesZh={PRODUCT_EXAMPLES_ZH}
          locale={locale} t={t} handleSubmit={handleSubmit}
          setImageFiles={setImageFiles} setImagePreviews={setImagePreviews}
          handleDragFile={handleDragFile} setDragOver={setDragOver}
          progress={progress} progressPhase={progressPhase} pollStartRef={pollStartRef}
        />
      )}

      {studioMode === "fashion" && (
        <div className="space-y-6">
          <Tabs
            value={fashionTab}
            onValueChange={(v) => setFashionTab(v as "try-on" | "gender-swap" | "age-transform")}
          >
            <TabsList variant="line" className="mb-6 flex flex-wrap w-full">
              <TabsTrigger value="try-on">{t("scene.tryOn")}</TabsTrigger>
              <TabsTrigger value="gender-swap">{t("scene.genderSwap")}</TabsTrigger>
              <TabsTrigger value="age-transform">{t("scene.ageTransform")}</TabsTrigger>
            </TabsList>
          </Tabs>
          {fashionTab === "try-on" && <TryOnForm key="fashion-try-on" />}
          {fashionTab === "gender-swap" && <GenderSwapForm key="fashion-gender-swap" />}
          {fashionTab === "age-transform" && <AgeTransformForm key="fashion-age-transform" />}
        </div>
      )}

      {studioMode === "game" && (
        <form onSubmit={handleGameSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2.5 text-foreground">{t("create.selectStyle")}</label>
            <div className="flex flex-wrap gap-2">
              {gameStyleDefs.map(({ id, labelKey }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGameStyle(id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
                    gameStyle === id
                      ? "border-foreground/30 bg-muted/30 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="game-prompt" className="block text-sm font-medium mb-1.5 text-foreground">{t("create.prompt")}</label>
            <Textarea
              ref={textareaRef}
              id="game-prompt"
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); if (textareaRef.current) autoResize(textareaRef.current); }}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGameSubmit(e); }}
              placeholder="A powerful warrior with glowing armor, epic battle scene..."
              rows={3}
              required
              className="resize-none min-h-[76px] overflow-hidden text-base"
            />
          </div>

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
                  dragOver ? "border-foreground/40 bg-muted/20 scale-[1.02]" : "border-border/60 hover:border-foreground/30 hover:bg-muted/10"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  dragOver ? "bg-muted/40 text-foreground scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:text-foreground/50"
                }`}>
                  <Gamepad2 size={18} />
                </div>
                <span className={dragOver ? "text-foreground font-medium" : ""}>{imagePreviews.length > 0 ? t("create.addMoreImages") || "Add more images" : dragOver ? t("create.dropImage") : t("create.uploadImage")}</span>
                <span className="text-xs text-muted-foreground/40">{t("create.dragHint") || "Drag & drop images here"}</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
              const files = e.target.files;
              if (files) {
                const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
                setImageFiles((prev) => [...prev, ...newFiles]);
                setImagePreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
              }
            }} />
          </div>

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

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("create.cost")}: 1 {t("create.credit")}</span>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

          <Button type="submit" disabled={loading || !prompt.trim()} className="w-full gap-2 h-11 text-base">
            {loading && <LoadingSpinner />}
            {loading ? t("create.generating") : t("create.generate")}
          </Button>
        </form>
      )}

      {studioMode === "style" && (
        <StyleTransferForm key="style-studio" />
      )}

      {studioMode === "free" && (
        <div>
          <Tabs value={freeTab} onValueChange={(v) => { setFreeTab(v as FreeTab); setImageFiles([]); setImagePreviews([]); setResult(null); if (fileInputRef.current) fileInputRef.current.value = ""; setError(""); }}>
            <TabsList variant="line" className="mb-6 flex flex-wrap w-full">
              <TabsTrigger value="image">{t("create.image")}</TabsTrigger>
              <TabsTrigger value="video">{t("create.video")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {freeTab === "image" && (
            <ImageGenerationForm
              prompt={prompt} setPrompt={setPrompt} loading={loading} error={error}
              imageFiles={imageFiles} imagePreviews={imagePreviews} imageSize={imageSize} setImageSize={setImageSize}
              dragOver={dragOver} textareaRef={textareaRef} fileInputRef={fileInputRef}
              showHint={showHint} examplesEn={IMAGE_EXAMPLES_EN} examplesZh={IMAGE_EXAMPLES_ZH}
              locale={locale} t={t} handleSubmit={handleSubmit}
              setImageFiles={setImageFiles} setImagePreviews={setImagePreviews}
              handleDragFile={handleDragFile} setDragOver={setDragOver}
              progress={progress} progressPhase={progressPhase} pollStartRef={pollStartRef}
            />
          )}

          {freeTab === "video" && (
            <ImageGenerationForm
              prompt={prompt} setPrompt={setPrompt} loading={loading} error={error}
              imageFiles={imageFiles} imagePreviews={imagePreviews} imageSize={imageSize} setImageSize={setImageSize}
              dragOver={dragOver} textareaRef={textareaRef} fileInputRef={fileInputRef}
              showHint={showHint} examplesEn={VIDEO_EXAMPLES_EN} examplesZh={VIDEO_EXAMPLES_ZH}
              locale={locale} t={t} handleSubmit={handleVideoSubmit}
              setImageFiles={setImageFiles} setImagePreviews={setImagePreviews}
              handleDragFile={handleDragFile} setDragOver={setDragOver}
              progress={progress} progressPhase={progressPhase} pollStartRef={pollStartRef}
              isVideo videoWidth={videoWidth} videoHeight={videoHeight}
              videoNumFrames={videoNumFrames} videoFrameRate={videoFrameRate}
              setVideoSize={(w, h) => { setVideoWidth(w); setVideoHeight(h); }}
              setVideoNumFrames={setVideoNumFrames} setVideoFrameRate={setVideoFrameRate}
              videoMode={videoMode} setVideoMode={setVideoMode}
            />
          )}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <GenerationResult
            type={result.type}
            id={result.id}
            url={result.url}
            prompt={prompt}
            regenerating={loading}
            onRegenerate={handleResultRegenerate}
            t={t}
          />
        </div>
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
