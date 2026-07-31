# Create Page UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 create page UI issues — dynamic title/subtitle, remove campaign link, inline Fashion Studio tools, and two-row free-mode tabs.

**Architecture:** All changes are confined to `src/app/(dashboard)/create/page.tsx` (client component) plus locale key removal in `en.json`/`zh.json`. No new components, no new dependencies. Uses the existing `Tabs`/`TabsList`/`TabsTrigger` from `@/components/ui/tabs` (base-ui) and existing form components (`TryOnForm`, `GenderSwapForm`, `AgeTransformForm`).

**Tech Stack:** Next.js 16 App Router, React 19, shadcn/ui (base-ui Tabs), Tailwind CSS 4, locale via `useLocale()` from `@/components/locale-provider`.

## Global Constraints

- Never use `as any` / `@ts-ignore` / `@ts-expect-error`.
- All user-facing text via `t("key")` — never hardcode English/Chinese strings.
- Add/remove locale keys in BOTH `en.json` and `zh.json` together.
- All `min-h-screen` must be `min-h-dvh`.
- No new dependencies.
- Verify after each task: `npm run lint` and `npm run build`.

---

### Task 1: Dynamic Title & Subtitle per Studio Mode

**Files:**
- Modify: `src/app/(dashboard)/create/page.tsx`

**Interfaces:**
- Consumes: `studioMode` variable (already exists, type `StudioMode`), `t` from `useLocale()` (already exists)
- Produces: none (self-contained UI change)

- [ ] **Step 1: Add mode→locale-key maps**

Add these two constants right after the `gameStyleDefs` definition (around line 105), before `VideoProgressBar`:

```tsx
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
```

- [ ] **Step 2: Use the maps in the header**

Replace the header block (currently lines ~537-544):

```tsx
      <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Wand2 size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">{t("create.badge")}</span>
          </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{t("create.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("create.subtitle")}</p>
      </div>
```

with:

```tsx
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
          <Wand2 size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">{t("create.badge")}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{t(studioTitleKey[studioMode])}</h1>
        <p className="text-sm text-muted-foreground">{t(studioDescKey[studioMode])}</p>
      </div>
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: no new errors in `create/page.tsx` (pre-existing lint errors in OTHER files are acceptable and unrelated).

Run: `npm run build`
Expected: build succeeds, 41 routes generated.

Manual check: open `/create?mode=fashion` → title shows "Fashion Studio"; `/create?mode=game` → "Game Assets"; `/create` → "Product Photography"; `/create?mode=free` → "Free Creation". Switch locale → titles translate.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/create/page.tsx"
git commit -m "feat(create): dynamic title and subtitle per studio mode"
```

---

### Task 2: Remove Campaign Link

**Files:**
- Modify: `src/app/(dashboard)/create/page.tsx`
- Modify: `src/locales/en.json`
- Modify: `src/locales/zh.json`

**Interfaces:**
- Consumes: `ImageGenerationForm` component definition (lines ~139-360)
- Produces: none (removal only)

- [ ] **Step 1: Remove the `Link` import**

In `src/app/(dashboard)/create/page.tsx`, delete line 5: `import Link from "next/link";` (it is only used by the campaign button).

- [ ] **Step 2: Remove `onCampaignLink` from the prop type and destructure**

In the `ImageGenerationForm` function signature, remove `onCampaignLink,` from the destructuring list (line ~145) and remove `onCampaignLink?: boolean;` from the type annotation (line ~164).

- [ ] **Step 3: Remove the campaign button block**

Delete this entire block from inside `ImageGenerationForm`'s JSX (currently lines ~176-183):

```tsx
      {onCampaignLink && (
        <div className="flex justify-end">
          <Link href="/create/campaign">
            <Button type="button" variant="outline" size="sm" className="gap-1 text-xs">
              {t("create.campaignLink")}
            </Button>
          </Link>
        </div>
      )}
```

- [ ] **Step 4: Remove the `onCampaignLink` prop at the call site**

At the product-photography `ImageGenerationForm` usage (currently line ~595), delete the line `onCampaignLink` (it is the only call site that passes it).

- [ ] **Step 5: Remove the locale key from both files**

In `src/locales/en.json`, delete: `"create.campaignLink": "Campaign \u2192",`
In `src/locales/zh.json`, delete: `"create.campaignLink": "营销活动 →",`

Do NOT remove `create.campaignStudio` / `create.campaignStudioDesc` (they are the Product Photography mode labels).

- [ ] **Step 6: Verify**

Run: `npm run lint` — no new errors in `create/page.tsx`.
Run: `npm run build` — build succeeds.

Manual check: `/create` (product-photography) no longer shows the "Campaign →" button in the form's top-right. `/create/campaign` URL still loads (page file left in place, just unlinked).

- [ ] **Step 7: Commit**

```bash
git add "src/app/(dashboard)/create/page.tsx" src/locales/en.json src/locales/zh.json
git commit -m "feat(create): remove campaign link from product photography"
```

---

### Task 3: Fashion Studio Inline Tabs (Try-On / Gender Swap / Age Transform)

**Files:**
- Modify: `src/app/(dashboard)/create/page.tsx`

**Interfaces:**
- Consumes: `Tabs`, `TabsList`, `TabsTrigger` (already imported, line 12), `TryOnForm`, `GenderSwapForm`, `AgeTransformForm` (already imported, lines 16-19), `t` from `useLocale()`
- Produces: new state `fashionTab: "try-on" | "gender-swap" | "age-transform"`

- [ ] **Step 1: Add `fashionTab` state**

In `CreatePageContent`, next to the other state declarations (after `const [gameStyle, setGameStyle] = useState("fantasy");` around line 394), add:

```tsx
const [fashionTab, setFashionTab] = useState<"try-on" | "gender-swap" | "age-transform">("try-on");
```

- [ ] **Step 2: Replace the fashion section JSX**

Replace the entire `{studioMode === "fashion" && ( ... )}` block (currently lines ~599-633), which contains the Onboarding → TryOnForm → two jump buttons, with:

```tsx
      {studioMode === "fashion" && (
        <div className="space-y-6">
          {!sessionStorage.getItem("imaginova-onboarded-try-on") && !onboardingDismissed ? (
            <ModeOnboarding mode="try-on" onDismiss={() => setOnboardingDismissed(true)} />
          ) : (
            <div>
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
        </div>
      )}
```

Note: `VenusAndMars` and `UserCog` lucide icons may become unused in this file — check the import on line 15 and remove them from the import list if no other usage remains.

- [ ] **Step 3: Verify**

Run: `npm run lint` — no new errors (including unused imports).
Run: `npm run build` — build succeeds.

Manual check: `/create?mode=fashion` shows 3 tabs; default "Virtual Try-On" renders `TryOnForm`; clicking "Gender Swap" renders `GenderSwapForm` inline (no navigation); "Age Transform" renders `AgeTransformForm`; switching locale translates tab labels.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/create/page.tsx"
git commit -m "feat(create): inline gender swap and age transform in fashion studio tabs"
```

---

### Task 4: Free Mode Tabs — Two-Row Layout

**Files:**
- Modify: `src/app/(dashboard)/create/page.tsx`

**Interfaces:**
- Consumes: `freeTab` state (already exists), `Tabs`/`TabsList`/`TabsTrigger` (already imported)
- Produces: none (layout only)

- [ ] **Step 1: Update the free-mode `TabsList`**

In the `{studioMode === "free" && ( ... )}` block, change the `TabsList` (currently line ~748):

```tsx
            <TabsList variant="line" className="mb-6">
```

to:

```tsx
            <TabsList variant="line" className="mb-6 flex flex-wrap w-full">
```

The five `TabsTrigger`s stay in place. With `flex-wrap` + the triggers' existing `flex-1` behavior, "Image" and "Video" fill row 1 at 50% each; "Style Transfer", "Gender Swap", "Age Transform" fill row 2 at ~33% each. No changes to the `onValueChange` handler or tab content blocks.

- [ ] **Step 2: Verify**

Run: `npm run lint` — no new errors.
Run: `npm run build` — build succeeds.

Manual check: `/create?mode=free` shows the 5 tabs on two rows; tabs switch content correctly; active indicator (underline) shows on the selected tab in whichever row it sits; works at 375px viewport (no horizontal scroll).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/create/page.tsx"
git commit -m "feat(create): two-row tab layout for free creation mode"
```

---

### Task 5: Final Verification & Project Plan Update

**Files:**
- Modify: `PROJECT_PLAN.md`

**Interfaces:**
- Consumes: all previous tasks' changes
- Produces: nothing

- [ ] **Step 1: Full verification suite**

Run: `npm run lint` — record new issues (if any) from this change set.
Run: `npm run build` — build succeeds, all 41 routes.
Run: `npm test` — unit tests pass.

- [ ] **Step 2: Update PROJECT_PLAN.md**

Add an entry documenting the create page UI fixes (dynamic title/subtitle per mode, campaign removal, fashion studio inline tabs, two-row free tabs), per the AGENTS.md rule "After every feature update, update PROJECT_PLAN.md".

- [ ] **Step 3: Commit**

```bash
git add PROJECT_PLAN.md
git commit -m "docs: update project plan with create page UI fixes"
```
