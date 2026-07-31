# Create Page UI Fixes — Design Spec

## Overview
Fix 4 UI issues on the create page: static title/subtitle, remove campaign jump, inline Fashion Studio tools, and free-mode tab crowding.

## Changes

### 1. Dynamic Title & Subtitle
- Replace the static `{t("create.title")}` / `{t("create.subtitle")}` with mode-aware values.
- Map `studioMode` to locale keys pulled from the `create.*Studio` / `create.*StudioDesc` series.
- `"product-photography"` → `create.campaignStudio` / `create.campaignStudioDesc`
- `"fashion"` → `create.fashionStudio` / `create.fashionStudioDesc`
- `"game"` → `create.gameStudio` / `create.gameStudioDesc`
- `"style"` → `create.styleStudio` / `create.styleStudioDesc`
- `"free"` → `create.freeStudio` / `create.freeStudioDesc`
- Falls back to the current static keys for safety.

### 2. Remove Campaign
- Drop `onCampaignLink` prop from `ImageGenerationForm` (type def + destructure + conditional render block).
- Remove the `<Link href="/create/campaign">` button and the "Campaign →" locale key `create.campaignLink`.
- Remove the `Link` import from `next/link` (only used there).
- Keep `/create/campaign` page file in the tree (just not linked) — can be pruned later.
- Keep `create.campaignStudio` / `create.campaignStudioDesc` locale keys (they are the Product Photography mode labels, not campaign-specific).

### 3. Fashion Studio → 3 Tabs
- Replace the current Fashion section (Onboarding → TryOnForm → gender-swap/age-transform jump buttons) with a `Tabs` component.
- 3 tabs: `[Virtual Try-On]` `[Gender Swap]` `[Age Transform]`
- Tab values: `"try-on"`, `"gender-swap"`, `"age-transform"`
- Default tab: `"try-on"`
- Each tab renders the corresponding form inline (`TryOnForm`, `GenderSwapForm`, `AgeTransformForm`).
- Keep the `onboardingDismissed` state for first-time visitors — show `ModeOnboarding` once per session (as before), then show the tabs.
- Locale keys used: `scene.tryOn`, `scene.genderSwap`, `scene.ageTransform` (already exist).

### 4. Free Mode Tabs → Two Rows
- Keep `Tabs` with `TabsList`, but break into 2 rows.
- Row 1: `[Image] [Video]`
- Row 2: `[Style Transfer] [Gender Swap] [Age Transform]`
- Use `flex flex-wrap` + `w-full` + `sm:w-auto` so it wraps naturally.
- Active tab indicator spans the selected item in whichever row it sits.
- No functional change to tab content.

## Locale Changes
- Remove `create.campaignLink` from both en.json and zh.json.
- No new keys needed (all exist in both files).

## Files to Modify
- `src/app/(dashboard)/create/page.tsx` — all 4 changes above
- `src/locales/en.json` — remove `create.campaignLink`
- `src/locales/zh.json` — remove `create.campaignLink`
- `src/app/(dashboard)/create/campaign/page.tsx` — leave in place (no link to it anymore)

## Non-Goals
- No new components or dependencies.
- No refactoring of existing form components (TryOnForm, GenderSwapForm, etc.).
- No styling overhaul — just layout fixes within the existing design system.
