# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Imaginova
**Generated:** 2026-07-09 13:52:58
**Category:** Generative Art Platform

---

## Global Rules

### Color Palette

> 颜色系统使用 OKLCH 色彩空间，通过 CSS 变量定义。暗色模式下各值相应调整（见 `src/app/globals.css`）。

| Role | Light (OKLCH) | CSS Variable | 视觉描述 |
|------|---------------|--------------|----------|
| Primary | `oklch(0.55 0.13 185)` | `--color-primary` | 青绿 (Teal) |
| On Primary | `oklch(0.98 0 0)` | `--color-primary-foreground` | 近白色 |
| Secondary | `oklch(0.92 0.01 70)` | `--color-secondary` | 暖灰 |
| Secondary Foreground | `oklch(0.35 0.015 40)` | `--color-secondary-foreground` | 深灰 |
| Accent/CTA | `oklch(0.72 0.14 75)` | `--color-accent` | 琥珀 (Amber) |
| Accent Foreground | `oklch(0.15 0.02 40)` | `--color-accent-foreground` | 近黑 |
| Background | `oklch(0.985 0.002 65)` | `--color-background` | 暖白 |
| Foreground | `oklch(0.21 0.015 40)` | `--color-foreground` | 深棕灰 |
| Muted | `oklch(0.96 0.005 65)` | `--color-muted` | 浅暖灰 |
| Muted Foreground | `oklch(0.55 0.01 40)` | `--color-muted-foreground` | 中灰 |
| Border | `oklch(0.91 0.005 65)` | `--color-border` | 浅灰 |
| Destructive | `oklch(0.58 0.2 25)` | `--color-destructive` | 红 |
| Ring/Focus | `oklch(0.55 0.13 185)` | `--color-ring` | 青绿 (同 Primary) |
| Radius | `0.75rem` / `12px` | `--radius` | 基础圆角 |

**Color Notes:** 青绿(Teal)主色 + 琥珀(Amber)强调色 — 科技感 + 温暖

### Typography

- **Font:** Inter (通过 `next/font/google` 加载)
- **CSS Variable:** `--font-sans`
- **Fallback Stack:** `system-ui, -apple-system, sans-serif`
- **Mood:** flat, clean, system, bold, geometric, cross-platform, minimal, functional, responsive

**Next.js Loader:**
```tsx
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
```

**Usage:**
```tsx
<html className={cn("font-sans", inter.variable)}>
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## 组件库

项目使用 **shadcn/ui** (style: `base-nova`) + **@base-ui/react** 作为底层无障碍基元。

| 组件 | 位置 | 底层基元 | 变体 |
|------|------|----------|------|
| Button | `src/components/ui/button.tsx` | `@base-ui/react/button` | default / outline / secondary / ghost / destructive / link；size: default / xs / sm / lg / icon / icon-xs / icon-sm / icon-lg |
| Badge | `src/components/ui/badge.tsx` | `@base-ui/react` (mergeProps) | default / secondary / destructive / outline / ghost / link |
| Card | `src/components/ui/card.tsx` | — | default / sm (size) |
| Input | `src/components/ui/input.tsx` | `@base-ui/react/input` | — |
| Label | `src/components/ui/label.tsx` | — | — |
| Tabs | `src/components/ui/tabs.tsx` | `@base-ui/react/tabs` | default / line (variant) |
| Textarea | `src/components/ui/textarea.tsx` | 原生 `<textarea>` | — |

### 使用规范

- 所有组件通过 `src/components/ui/` 导入
- 使用 `cn()` 工具函数（`clsx` + `tailwind-merge`）合并类名
- 使用 `class-variance-authority` (cva) 定义组件变体
- 图标统一使用 `lucide-react`
- 固定圆角基础值 `--radius: 0.75rem`，衍生值 `--radius-sm/md/lg/xl/2xl/3xl/4xl`

---

## Style Guidelines

**Style:** 极简 + 科技暖色

**Keywords:** Clean minimalism, teal + amber warmth, generous whitespace, rounded corners, subtle glassmorphism

**Key CSS Tokens:**
- `--radius: 0.75rem` — 基础圆角（12px）
- `transition-theme` — 主题切换过渡（bg/text/border 200ms）
- `container-narrow` — 内容区最大宽 1120px 居中
- 动画使用 `tw-animate-css` + 自定 keyframes（`slide-up`, `fade-in/out`, `scale-in/out`）

---

## Anti-Patterns (Do NOT Use)

- ❌ Heavy chrome
- ❌ Slow loading

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
