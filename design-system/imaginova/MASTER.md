# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Imaginova
**Generated:** 2026-07-17 (Phase 1 UI Redesign)
**Category:** Generative Art Platform

---

## Global Rules

### Color Palette

> 颜色系统使用 OKLCH 色彩空间，通过 CSS 变量定义（见 `src/app/globals.css`）。
> **关键设计原则：暗色模式下背景接近纯黑（`oklch(0.012)`），让 AI 生成物成为视觉主角。CTA 使用纯白填充，是页面上最亮的元素。**

#### Light Mode

| Role | OKLCH | Visual |
|------|-------|--------|
| Background | `oklch(0.97 0.005 260)` | 暖白 |
| Foreground | `oklch(0.1 0.02 280)` | 深紫灰 |
| Card | `oklch(0.99 0 0)` | 纯白 |
| Card Elevated | `oklch(0.96 0.005 260)` | 浅灰（hover/悬浮态） |
| Primary | `oklch(0.5 0.22 280)` | 青紫 |
| Accent | `oklch(0.55 0.2 200)` | 青绿 |
| Muted | `oklch(0.94 0.005 260)` | 浅灰 |
| Border | `oklch(0.85 0.01 260)` | 灰 |

#### Dark Mode（新 — 对标 Krea.ai 暗色画布）

| Role | OKLCH | Visual |
|------|-------|--------|
| Background | `oklch(0.012 0.003 280)` | 近纯黑 |
| Foreground | `oklch(0.93 0.006 260)` | 亮白灰 |
| Card | `oklch(0.03 0.006 280)` | 极深灰（几乎不可见） |
| Card Elevated | `oklch(0.05 0.008 280)` | 微亮卡片（hover/悬浮） |
| Primary | `oklch(0.62 0.22 280)` | 亮青紫（在深底色上醒目） |
| Accent | `oklch(0.65 0.18 200)` | 亮青绿 |
| Muted | `oklch(0.06 0.006 280)` | 极深灰 |
| Muted Foreground | `oklch(0.42 0.008 260)` | 中灰 |
| Border | `oklch(0.1 0.008 280)` | 深灰 |
| Ring/Focus | `oklch(0.62 0.22 280)` | 同 Primary |

**CTA 规范：**
- **Primary CTA**：纯白填充（`#ffffff`） + 圆角 pill（9999px）+ 微阴影
- **Secondary CTA**：透明 + 白色边框 1px + 白色文字
- **常规按钮**：使用 `--primary` 渐变（`from-primary to-accent`）

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
- 固定圆角系统（三分法）：`--radius: 8px`（功能元素/卡片/输入框），`--radius-md: 14px`（弹窗/特殊容器），`--radius-pill: 9999px`（仅 CTA main CTA）

---

## Style Guidelines

**Style:** 暗色画布 + 极简科技（对标 Krea.ai / Linear）

**Keywords:** Dark canvas, zero chromatic noise, pure white CTA, product-imagery-first, generous whitespace, pill + 8px geometry

**Key CSS Tokens:**
- `--radius: 8px` — 功能元素/卡片圆角
- `--radius-md: 14px` — 弹窗/特殊容器圆角
- `--radius-pill: 9999px` — 仅 CTA 主按钮
- `--card-elevated` — 悬浮态卡片背景
- `container-narrow` — 内容区最大宽 1120px 居中
- 动画使用 `tw-animate-css` + 自定 keyframes（`slide-up`, `fade-in/out`, `shimmer`）

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
