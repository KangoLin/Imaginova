"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/components/locale-provider";

type Tab = "image" | "video";

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

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const [tab, setTab] = useState<Tab>("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const pollingRef = useRef(false);
  const pollStartRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("imaginova-onboarded")) setShowHint(true);
  }, []);

  function handleDragFile(file: File) {
    if (file.type.startsWith("image/")) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
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
        let data: { id: number };
        if (imageFile) {
          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("model", "agnes-image-2.1-flash");
          formData.append("image", imageFile);
          data = await api.post("/api/generate/image", formData);
        } else {
          data = await api.post("/api/generate/image", { prompt, model: "agnes-image-2.1-flash" });
        }

        router.push(`/image/${data.id}`);
        return;
      } else {
        let data: { task_id: string };
        if (imageFile) {
          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("image", imageFile);
          data = await api.post("/api/generate/video", formData);
        } else {
          data = await api.post("/api/generate/video", { prompt });
        }

        toast(t("create.videoStarted"), "info");
        pollStartRef.current = Date.now();
        pollStatus(data.task_id);
      }
    } catch (err) {
      if (err instanceof ApiError) { setError(err.message); } else { setError(t("create.networkError")); }
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
        setError(t("create.videoTimedOut"));
        setLoading(false);
        pollingRef.current = false;
        return;
      }

      await new Promise((r) => setTimeout(r, 3000));
      if (document.hidden) {
        await new Promise<void>((resolve) => {
          const cb = () => { document.removeEventListener("visibilitychange", cb); resolve(); };
          document.addEventListener("visibilitychange", cb);
        });
        if (!pollingRef.current) return;
      }
      try {
        const data = await api.get<{ status: string; progress: number; id?: number; error?: string }>(`/api/generate/video?taskId=${taskId}`);
        if (data.error) { setError(data.error); setLoading(false); pollingRef.current = false; return; }

        const p = data.progress || 0;
        setProgress(p);

        if (p <= 0) setProgressPhase(t("create.waitingInQueue"));
        else if (p < 100) setProgressPhase(t("create.generatingProgress", { progress: p }));
        else setProgressPhase(t("create.finalizing"));

        if (data.status === "completed") {
          router.push(`/video/${data.id}`);
          pollingRef.current = false;
          return;
        }
        if (data.status === "failed") {
          setError(data.error ? `${t("create.videoFailed")}: ${data.error}` : t("create.videoFailed"));
          setLoading(false);
          pollingRef.current = false;
          return;
        }
        failCount = 0;
      } catch {
        failCount++;
        if (failCount >= 3) {
          setError(t("create.statusCheckFailed"));
          setLoading(false);
          pollingRef.current = false;
          return;
        }
      }
    }
  }

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{t("create.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("create.subtitle")}</p>
          </div>

          {showHint && (
            <div className="mb-6 bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm animate-fade-in relative">
              <button onClick={() => setShowHint(false)} className="absolute top-2 right-2 text-muted-foreground/40 hover:text-muted-foreground text-lg leading-none">&times;</button>
              <p className="font-medium text-foreground mb-1.5">{t("create.tips")}</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>&bull; {t("create.tip1")}</li>
                <li>&bull; {t("create.tip2")}</li>
                <li>&bull; {t("create.tip3")}</li>
              </ul>
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
            <TabsList className="mb-6 w-full bg-muted/50 p-0.5">
              <TabsTrigger value="image" className="flex-1">{t("create.image")}</TabsTrigger>
              <TabsTrigger value="video" className="flex-1">{t("create.video")}</TabsTrigger>
            </TabsList>
          </Tabs>

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
                className="resize-none min-h-[76px] overflow-hidden"
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
                      className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border border-border/40 transition-all active:scale-[0.97] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">{t("create.referenceImage")}</label>
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
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleDragFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-lg py-8 text-sm text-muted-foreground transition-all cursor-pointer bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span>{dragOver ? t("create.dropImage") : t("create.uploadImage")}</span>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
              }} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("create.cost")}: {tab === "image" ? `1 ${t("create.credit")}` : `2 ${t("create.credits")}`}</span>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

            <Button type="submit" disabled={loading || !prompt.trim()} className="w-full gap-2">
              {loading && <LoadingSpinner />}
              {loading ? tab === "video" ? t("create.generatingVideo", { progress }) : t("create.generating") : `${t("create.generate")} ${tab === "image" ? t("create.image") : t("create.video")}`}
            </Button>
          </form>

          {loading && tab === "video" && (() => {
            const elapsed = pollStartRef.current ? (Date.now() - pollStartRef.current) / 1000 : 0;
            const eta = progress > 0 && progress < 100 && elapsed > 0
              ? Math.round((elapsed / progress) * (100 - progress))
              : 0;
            const etaText = eta >= 60 ? `${Math.floor(eta / 60)}m ${eta % 60}s` : `${eta}s`;
            return (
              <div className="mt-6 animate-fade-in">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(progress, 5)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {progressPhase || t("create.starting")}
                  {eta > 0 && <span className="ml-2 text-muted-foreground/60">({t("create.remaining", { time: etaText })})</span>}
                </p>
              </div>
            );
          })()}
        </div>
      </main>
  );
}
