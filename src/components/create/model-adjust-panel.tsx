"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/components/locale-provider";
import { api, ApiError } from "@/lib/api-client";
import { downloadFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, RotateCcw, Check, VenusAndMars, UserCog } from "lucide-react";

type GenderTarget = "male-to-female" | "female-to-male";
type AgeTarget = "child" | "teen" | "young-adult" | "middle-aged" | "elderly";

const GENDER_PROMPTS: Record<GenderTarget, string> = {
  "male-to-female": "Change only the gender to female, keep all original facial features, identity, and characteristics unchanged, only adjust gender presentation",
  "female-to-male": "Change only the gender to male, keep all original facial features, identity, and characteristics unchanged, only adjust gender presentation",
};

const AGE_PROMPTS: Record<AgeTarget, string> = {
  "child": "Transform this person to look like a child around 6-12 years old, keep all original facial features and identity unchanged, only adjust age appearance, younger face, smoother skin",
  "teen": "Transform this person to look like a teenager around 13-19 years old, keep all original facial features and identity unchanged, only adjust age appearance, youthful skin",
  "young-adult": "Transform this person to look like a young adult around 20-30 years old, keep all original facial features and identity unchanged, only adjust age appearance, fresh look",
  "middle-aged": "Transform this person to look middle-aged around 40-55 years old, keep all original facial features and identity unchanged, only adjust age appearance, mature features, slight wrinkles",
  "elderly": "Transform this person to look elderly around 60+ years old, keep all original facial features and identity unchanged, only adjust age appearance, visible wrinkles, gray hair",
};

const AGE_OPTIONS: { key: AgeTarget; icon: string }[] = [
  { key: "child", icon: "👶" },
  { key: "teen", icon: "🧑" },
  { key: "young-adult", icon: "👨‍💼" },
  { key: "middle-aged", icon: "👨‍🦱" },
  { key: "elderly", icon: "👴" },
];

interface ModelAdjustPanelProps {
  sourceUrl: string;
  onClose: () => void;
}

export function ModelAdjustPanel({ sourceUrl, onClose }: ModelAdjustPanelProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState("gender");
  const [genderTarget, setGenderTarget] = useState<GenderTarget | null>(null);
  const [ageTarget, setAgeTarget] = useState<AgeTarget | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: number; url: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "gender" && !genderTarget) return;
    if (tab === "age" && !ageTarget) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let prompt: string;
      if (tab === "gender") {
        prompt = `${GENDER_PROMPTS[genderTarget!]}${description.trim() ? `, ${description.trim()}` : ""}, photorealistic, high quality, detailed face`;
      } else {
        prompt = `${AGE_PROMPTS[ageTarget!]}${description.trim() ? `, ${description.trim()}` : ""}, photorealistic, high quality, detailed face portrait`;
      }

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", "agnes-image-2.1-flash");
      formData.append("size", "768x1024");
      const blob = await fetch(sourceUrl).then((r) => r.blob());
      formData.append("image", blob, "source.png");

      const data = (await api.post("/api/generate/image", formData)) as { id: number; url: string };
      setResult({ id: data.id, url: data.url });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("genderSwap.error"));
    }
    setLoading(false);
  }

  const canSubmit = (tab === "gender" ? genderTarget : ageTarget) && !loading;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <VenusAndMars size={16} className="text-primary" />
            {t("create.modelAdjust")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="gender" className="gap-1.5 text-xs">
              <VenusAndMars size={13} />{t("genderSwap.title")}
            </TabsTrigger>
            <TabsTrigger value="age" className="gap-1.5 text-xs">
              <UserCog size={13} />{t("ageTransform.title")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gender" className="space-y-4">
            {result ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
                  <Image src={result.url} alt="Gender swap result" width={768} height={1024} className="w-full h-auto object-contain" unoptimized />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(result.url, `gender-swap-${result.id}.png`)}><Download size={14} />{t("common.download")}</Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => { setResult(null); setGenderTarget(null); setDescription(""); }}><RotateCcw size={14} />{t("genderSwap.generateAgain")}</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30 max-h-40">
                  <Image src={sourceUrl} alt="Source" width={200} height={200} className="w-full h-auto object-contain" unoptimized />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["male-to-female", "female-to-male"] as GenderTarget[]).map((g) => (
                    <button key={g} type="button" onClick={() => setGenderTarget(g)}
                      className={`relative rounded-xl border p-3 text-center transition-all ${genderTarget === g ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/60 bg-card hover:border-primary/30"}`}>
                      <div className="text-xl mb-1">{g === "male-to-female" ? "♀️" : "♂️"}</div>
                      <p className="text-[11px] font-medium">{t(`genderSwap.${g === "male-to-female" ? "maleToFemale" : "femaleToMale"}`)}</p>
                      {genderTarget === g && <Check size={10} className="absolute top-1.5 right-1.5 text-primary" />}
                    </button>
                  ))}
                </div>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("genderSwap.descriptionPlaceholder")} rows={2} className="resize-none text-sm" />
                {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}
                <Button type="submit" disabled={!canSubmit} className="w-full gap-2 h-10 text-sm">
                  {loading && <LoadingSpinner />}
                  {loading ? t("genderSwap.generating") : t("genderSwap.generate")}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="age" className="space-y-4">
            {result ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30">
                  <Image src={result.url} alt="Age transform result" width={768} height={1024} className="w-full h-auto object-contain" unoptimized />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(result.url, `age-transform-${result.id}.png`)}><Download size={14} />{t("common.download")}</Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => { setResult(null); setAgeTarget(null); setDescription(""); }}><RotateCcw size={14} />{t("ageTransform.generateAgain")}</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30 max-h-40">
                  <Image src={sourceUrl} alt="Source" width={200} height={200} className="w-full h-auto object-contain" unoptimized />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {AGE_OPTIONS.map((opt) => (
                    <button key={opt.key} type="button" onClick={() => setAgeTarget(opt.key)}
                      className={`relative rounded-xl border p-2 text-center transition-all ${ageTarget === opt.key ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/60 bg-card hover:border-primary/30"}`}>
                      <div className="text-lg mb-0.5">{opt.icon}</div>
                      <p className="text-[10px] font-medium leading-tight">{t(`ageTransform.${opt.key === "young-adult" ? "youngAdult" : opt.key === "middle-aged" ? "middleAged" : opt.key}`)}</p>
                      {ageTarget === opt.key && <Check size={10} className="absolute top-1 right-1 text-primary" />}
                    </button>
                  ))}
                </div>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("ageTransform.descriptionPlaceholder")} rows={2} className="resize-none text-sm" />
                {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}
                <Button type="submit" disabled={!canSubmit} className="w-full gap-2 h-10 text-sm">
                  {loading && <LoadingSpinner />}
                  {loading ? t("ageTransform.generating") : t("ageTransform.generate")}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
