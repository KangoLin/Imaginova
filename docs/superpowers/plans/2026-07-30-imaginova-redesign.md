# Imaginova Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition Imaginova from "AI tool" to "AI Visual Studio" with 5 vertical studios and a pure-black + grayscale dark mode aesthetic.

**Architecture:** Single-page-app style with Next.js App Router. All changes are frontend UI — no backend modifications. Color tokens in CSS variables control the theme globally. Five studio modes share existing generation APIs with different preset configurations.

**Tech Stack:** Next.js 16, Tailwind CSS 4, shadcn/ui, CSS custom properties (oklch)

## Global Constraints

- No new dependencies
- All text in both en.json and zh.json
- Never use purple or teal anywhere
- No `as any`, `@ts-ignore`, or `@ts-expect-error`
- All interactive elements must have `touch-action: manipulation`
- Ensure ≤375px viewport compatibility

---

### Task 1: Color System — CSS Variables

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing CSS variable structure
- Produces: new color tokens consumed by all components

- [ ] Replace the `:root` (light mode) block:

```css
:root {
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.1 0.02 260);
  --card: oklch(0.96 0.005 260);
  --card-elevated: oklch(0.93 0.005 260);
  --card-foreground: oklch(0.1 0.02 260);
  --popover: oklch(0.99 0 0);
  --popover-foreground: oklch(0.1 0.02 260);
  --primary: oklch(0.15 0.01 260); /* near-black */
  --primary-foreground: oklch(0.99 0 0); /* white */
  --secondary: oklch(0.92 0.005 260);
  --secondary-foreground: oklch(0.2 0.01 260);
  --muted: oklch(0.94 0.005 260);
  --muted-foreground: oklch(0.5 0.01 260);
  --accent: oklch(0.15 0.01 260); /* same as primary for grayscale */
  --accent-foreground: oklch(0.99 0 0);
  --destructive: oklch(0.55 0.22 25);
  --border: oklch(0.85 0.01 260);
  --input: oklch(0.85 0.01 260);
  --ring: oklch(0.15 0.01 260);
  --radius: 0.5rem;
  --radius-pill: 9999px;
}
```

- [ ] Replace the `.dark` block:

```css
.dark {
  --background: oklch(0.022 0 0); /* near-pure black */
  --foreground: oklch(0.93 0.005 260);
  --card: oklch(0.07 0.005 260); /* #1A1A1A equivalent */
  --card-elevated: oklch(0.12 0.008 260); /* #2A2A2A equivalent */
  --card-foreground: oklch(0.9 0.005 260);
  --popover: oklch(0.09 0.008 260);
  --popover-foreground: oklch(0.9 0.005 260);
  --primary: oklch(0.95 0 0); /* white */
  --primary-foreground: oklch(0.022 0 0); /* black */
  --secondary: oklch(0.12 0.008 260);
  --secondary-foreground: oklch(0.85 0.005 260);
  --muted: oklch(0.06 0.005 260);
  --muted-foreground: oklch(0.5 0.01 260);
  --accent: oklch(0.95 0 0); /* same as primary */
  --accent-foreground: oklch(0.022 0 0);
  --destructive: oklch(0.6 0.22 25);
  --border: oklch(0.2 0.008 260); /* #27272A — barely visible */
  --input: oklch(0.15 0.008 260);
  --ring: oklch(0.5 0 0);
  --radius-pill: 9999px;
}
```

- [ ] Remove the gradient background and shadow rules in `.dark body` / `.dark .card-elevated` (lines ~97-108) — replace with clean:

```css
.dark body,
body.dark {
  background-image: none;
}

.dark .card-elevated,
.dark [class*="bg-card"] {
  box-shadow: none;
}
```

- [ ] Remove `text-gradient` utility purple/blue — replace with black-to-white or keep but point to foreground:

```css
@utility text-gradient { color: var(--foreground); -webkit-text-fill-color: var(--foreground); }
```

- [ ] Verify: `npm run lint` passes

---

### Task 2: Locale Files — Updated Copy

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/zh.json`

- [ ] Update en.json and zh.json to reflect 5-studio structure per the design spec. Key changes:
  - `home.badge`: "AI Visual Studio" / "AI 视觉工作室"
  - `home.title1` + `home.title2`: Keep existing "Create visuals that sell." / "创造能卖的视觉。"
  - `home.title3`: "AI-powered product visuals, fashion, game art, and more" / "AI 驱动的产品视觉、时尚、游戏美术等"
  - `home.cta`: "Start Creating" / "开始创作"
  - `home.learnMore`: "See Examples" / "查看案例"
  - `home.featureproductTitle / home.featureproductDesc`: Product Photography / 产品摄影
  - `home.featurefashionTitle / home.featurefashionDesc`: Fashion Studio / 时尚工作室
  - `home.featuregameTitle / home.featuregameDesc`: Game Assets / 游戏资产
  - `home.featurestyleTitle / home.featurestyleDesc`: Style Transfer / 风格转换
  - `home.featurefreeTitle / home.featurefreeDesc`: Free Creation / 自由创作
  - `scene.sectionTitle`: "Choose your studio" / "选择你的工作室"
  - `scene.productPhotography / scene.productPhotographyDesc`: Product Photography / 产品摄影 — description focused on product posters and ad visuals
  - `scene.fashion / scene.fashionDesc`: Fashion Studio / 时尚工作室 — includes try-on, age, gender
  - `scene.game / scene.gameDesc`: Game Assets / 游戏资产 — character art, sprites
  - `scene.styleTransfer / scene.styleTransferDesc`: Style Transfer / 风格转换
  - `scene.free / scene.freeDesc`: Free Creation / 自由创作
  - `create.campaignStudio / create.fashionStudio / create.gameAssets / create.styleStudio / create.freeCreation` and their `Desc` variants

- [ ] Verify: `npm run lint` passes

---

### Task 3: Homepage Hero — Auto Carousel

**Files:**
- Modify: `src/components/home-content.tsx`

- [ ] Read current file. Replace hero section with auto-playing carousel:

```tsx
// Carousel data
const heroSlides = [
  { studio: "Product Photography", tagline: "Turn products into campaigns", gradient: "from-zinc-800", imageUrl: "/images/hero/product.jpg" },
  { studio: "Fashion Studio", tagline: "AI model try-on & portrait editing", gradient: "from-zinc-800", imageUrl: "/images/hero/fashion.jpg" },
  { studio: "Game Assets", tagline: "Characters, sprites & concept art", gradient: "from-zinc-800", imageUrl: "/images/hero/game.jpg" },
  { studio: "Style Transfer", tagline: "Transform any photo into art", gradient: "from-zinc-800", imageUrl: "/images/hero/style.jpg" },
  { studio: "Free Creation", tagline: "Text-to-image, video & more", gradient: "from-zinc-800", imageUrl: "/images/hero/free.jpg" },
];
```

- Hero: full-viewport, centered text with badge + tagline
- Below: 5-slide auto carousel with:
  - Auto-play every 5 seconds
  - Dot pagination (clickable)
  - Each slide: full-bleed image with overlay, studio name + tagline
  - Fade transition between slides
  - **Note**: Hero images may not exist. Use existing `/images/showcase/*.jpg` as fallback, or use gradient backgrounds with text-only slides as graceful degradation
- CTA buttons below carousel: "Start Creating" / "See Examples"

- [ ] Replace scenes section with 5 studio cards (grid row)
- [ ] Update showcase gallery to reference correct keys
- [ ] Remove old logos/features section, keep "How it works" (3 steps)
- [ ] Keep examples section, update with 5-studio examples
- [ ] Verify: `npm run lint` passes

---

### Task 4: Create Page — 5 Studio Modes

**Files:**
- Modify: `src/app/(dashboard)/create/page.tsx`

- [ ] Read current file. The studio modes should be:

```tsx
type StudioMode = "product-photography" | "fashion" | "game" | "style" | "free";
```

- [ ] StudioSwitcher: 5-button grid (Product Photography | Fashion Studio | Game Assets | Style Transfer | Free Creation)

- [ ] ProductPhotographyMode (replaces old CampaignMode):
  - Image tab only (no video tab)
  - Product-focused prompt placeholder
  - Image-to-image with product reference
  - Link "Campaign" button → `/create/campaign`
  
- [ ] FashionStudioMode:
  - TryOnForm as main content
  - Below: quick tabs for Age Transform and Gender Swap
  
- [ ] GameAssetsMode:
  - Style preset selector (Fantasy, Cyberpunk, Pixel Art, Anime, RPG, Sci-Fi)
  - Text prompt → image generation with `[<style> style]` prefix
  
- [ ] StyleStudioMode:
  - Import and render existing StyleTransferForm

- [ ] FreeCreationMode:
  - Sub-tabs: Text-to-Image | Text-to-Video | Style Transfer | Gender Swap | Age Transform
  - Text-to-Image/Video has full parameter controls (size, resolution, duration, fps, keyframes)

- [ ] Update query parameter routing: `/create?mode=<studio>`
- [ ] Verify: `npm run lint` passes

---

### Task 5: Dashboard Polish

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] Update stats cards to use pure black/white accent colors (remove old primary/accent colors)
- [ ] Update Welcome modal to list 5 studios
- [ ] Verify: `npm run lint` passes

---

### Task 6: Final Verification

**Files:** (all)

- [ ] Run `npm run lint` — zero errors in modified files
- [ ] Run `npm run build` — succeeds
- [ ] Verify all 5 studio routes work: `/create`, `/create?mode=product-photography`, `/create?mode=fashion`, `/create?mode=game`, `/create?mode=style`, `/create?mode=free`
- [ ] Verify dark mode toggle still works
- [ ] Verify carousel auto-plays on homepage
